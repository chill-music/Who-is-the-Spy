(function () {
  var { useState, useEffect, useRef, useCallback, useMemo } = React;
  // Late-bind helpers and sub-components for hybrid architecture safety
  // NOTE: RingsShopSection and GiftPreviewModal might be loaded AFTER this file, 
  // so we access them via window during render or as early as possible.
  var getRingsShopSection = () => window.RingsShopSection;
  var getGiftPreviewModal = () => window.GiftPreviewModal;

  var getGiftRarity = function (cost) {
    if (window.getGiftRarity) return window.getGiftRarity(cost);
    if (cost >= 10000) return 'Mythic';
    if (cost >= 500) return 'Legendary';
    if (cost >= 50) return 'Epic';
    if (cost >= 15) return 'Uncommon';
    return 'Common';
  };

  // ═══════════════════════════════════════════════════════════════
  // 🛒  SHOP MODAL — Premium Dark Gaming Store
  // ═══════════════════════════════════════════════════════════════
  var ShopModal = ({ show, onClose, userData, lang, onPurchase, onEquip, onUnequip, onOpenInventory, onPropose, currentUID, coupleData, onOpenCoupleCard }) => {
    var t = TRANSLATIONS[lang];
    var [activeTab, setActiveTab] = useState('frames');
    var [activeGiftSubTab, setActiveGiftSubTab] = useState('all'); // ✅ New gift sub-tab state
    var [selectedItem, setSelectedItem] = useState(null);
    var [showPreview, setShowPreview] = useState(false);
    // ✅ Gift filter state
    var [giftSort, setGiftSort] = useState('default');
    var [giftRarityFilter, setGiftRarityFilter] = useState('all');
    var [giftVIPOnly, setGiftVIPOnly] = useState(false);
    var [showGiftFilter, setShowGiftFilter] = useState(false);

    if (!show) return null;

    var currency = userData?.currency || 0;
    var vipLevel = window.getVIPLevel ? window.getVIPLevel(userData) : 0;
    var inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    var equipped = userData?.equipped || {};

    var isOwned = (item) => inventory[item.type]?.includes(item.id);
    var isEquipped = (item) => {
      if (item.type === 'badges') {
        var eb = equipped.badges || [];
        return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id;
      }
      return equipped[item.type] === item.id;
    };

    var renderPreview = (item) => {
      if (item.type === 'frames') return item.preview?.startsWith('http') ? /*#__PURE__*/
      React.createElement("img", { src: item.preview, alt: "", style: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', background: item.preview } });
      if (item.type === 'badges') return item.imageUrl ? /*#__PURE__*/
      React.createElement("img", { src: item.imageUrl, alt: "", style: { width: '32px', height: '32px', objectFit: 'contain' } }) : /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '26px' } }, item.preview);
      if (item.type === 'titles') return item.imageUrl ? /*#__PURE__*/
      React.createElement("img", { src: item.imageUrl, alt: "", style: { width: '28px', height: '28px', objectFit: 'contain', background: 'transparent !important', border: 'none' } }) : /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '22px' } }, item.preview);

      if (item.type === 'gifts' || item.type === 'gifts_vip') return item.imageUrl ? /*#__PURE__*/
      React.createElement("img", { src: item.imageUrl, alt: "", style: { width: '32px', height: '32px', objectFit: 'contain' } }) : /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '26px' } }, item.emoji);
      if (item.type === 'profileEffects') {
        var src = typeof item.particles === 'string' && item.particles.startsWith('http') ?
        item.particles : item.imageUrl || null;
        return src ? /*#__PURE__*/
        React.createElement("img", { src: src, alt: item.name_en, style: { width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' } }) : /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '26px' } }, item.preview);
      }
      return /*#__PURE__*/React.createElement("span", { style: { fontSize: '22px' } }, "\uD83C\uDFA8");
    };

    // 🎁 تاب الهدايا أُزيل من الشوب — الهدايا متاحة فقط من البروفايل والشاتات
    var tabs = [
    { id: 'gifts', icon: '🎁', label_ar: 'هدايا', label_en: 'Gifts' },
    { id: 'red_packets', icon: '🧧', label_ar: 'مغلفات', label_en: 'Packets' },
    { id: 'rings', icon: '💍', label_ar: 'خواتم', label_en: 'Rings' },
    { id: 'bff_tokens', icon: '🤝', label_ar: 'BFF', label_en: 'BFF' },
    { id: 'frames', icon: '🖼️', label_ar: 'إطارات', label_en: 'Frames' },
    { id: 'titles', icon: '🏷️', label_ar: 'ألقاب', label_en: 'Titles' },
    { id: 'badges', icon: '🏅', label_ar: 'شارات', label_en: 'Badges' },
    { id: 'profileEffects', icon: '✨', label_ar: 'تأثيرات', label_en: 'Effects' }];


    var getTabItems = (tab) => {
      if (tab === 'red_packets') {
        return typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
      }
      if (tab === 'bff_tokens') {
        // Return BFF_TOKEN_ITEMS from config (not hidden ones)
        return typeof BFF_TOKEN_ITEMS !== 'undefined' ? BFF_TOKEN_ITEMS.filter((t) => !t.hidden) : [];
      }
      if (tab === 'gifts') {
        var regular = (SHOP_ITEMS.gifts || []).filter((item) => !item.hidden);
        var vipGifts = (SHOP_ITEMS.gifts_vip || []).filter((item) => !item.hidden && item.vipExclusive !== false);
        var famGifts = (SHOP_ITEMS.gifts_family || []).filter((item) => !item.hidden);
        var spcGifts = (SHOP_ITEMS.gifts_special || []).filter((item) => !item.hidden);
        var flgGifts = (SHOP_ITEMS.gifts_flag || []).filter((item) => !item.hidden);

        var items = [];
        if (activeGiftSubTab === 'all') {
          items = [...regular, ...vipGifts, ...famGifts, ...spcGifts, ...flgGifts];
        } else if (activeGiftSubTab === 'vip') {
          items = vipGifts;
        } else if (activeGiftSubTab === 'family') {
          items = famGifts;
        } else if (activeGiftSubTab === 'special') {
          items = spcGifts;
        } else if (activeGiftSubTab === 'flags') {
          items = flgGifts;
        }

        if (giftVIPOnly) {
          items = items.filter((item) => item.type === 'gifts_vip');
        }

        if (giftRarityFilter !== 'all') {
          items = items.filter((item) => {
            var rKey = item.type === 'gifts_vip' ? 'Legendary' : getGiftRarity(item.cost);
            return rKey === giftRarityFilter;
          });
        }
        if (giftSort === 'price_desc') items = [...items].sort((a, b) => b.cost - a.cost);else
        if (giftSort === 'price_asc') items = [...items].sort((a, b) => a.cost - b.cost);else
        {
          var RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
          items = [...items].sort((a, b) => {
            var rA = RARITY_ORDER.indexOf(a.type === 'gifts_vip' ? 'Legendary' : getGiftRarity(a.cost));
            var rB = RARITY_ORDER.indexOf(b.type === 'gifts_vip' ? 'Legendary' : getGiftRarity(b.cost));
            return rA - rB || a.cost - b.cost;
          });
        }
        return items;
      }
      return (SHOP_ITEMS[tab] || []).filter((item) => !item.hidden);
    };

    return (/*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { backdropFilter: 'blur(6px)' } }, /*#__PURE__*/
      React.createElement("div", {
        onClick: (e) => e.stopPropagation(),
        style: {
          background: 'linear-gradient(160deg,#0a0e1f 0%,#0d1225 55%,#080c1a 100%)',
          border: '1px solid rgba(0,242,255,0.12)',
          borderRadius: '20px',
          width: '96vw', maxWidth: '540px',
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(0,0,0,0.8),0 0 140px rgba(0,80,255,0.04),inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative'
        } }, /*#__PURE__*/


      React.createElement("div", { style: { position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: 'linear-gradient(90deg,transparent,#00f2ff,#7c3aed,transparent)', zIndex: 2 } }), /*#__PURE__*/


      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,rgba(0,242,255,0.055) 0%,rgba(112,0,255,0.055) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 16px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          width: '38px', height: '38px', borderRadius: '11px',
          background: 'linear-gradient(135deg,rgba(0,242,255,0.14),rgba(112,0,255,0.14))',
          border: '1px solid rgba(0,242,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px',
          flexShrink: 0
        } }, "\uD83D\uDED2"), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '15px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.2px' } },
      t.shop || (lang === 'ar' ? 'المتجر' : 'Store')
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '7px' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.05))',
          border: '1px solid rgba(251,191,36,0.22)',
          borderRadius: '10px', padding: '5px 10px'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '13px' } }, "\uD83E\uDDE0"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', fontWeight: 800, color: '#fbbf24' } }, currency.toLocaleString())
      ),
      onOpenInventory && /*#__PURE__*/
      React.createElement("button", { onClick: () => {onClose();setTimeout(onOpenInventory, 100);},
        title: lang === 'ar' ? 'مخزوني' : 'My Inventory',
        style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(0,242,255,0.07)', border: '1px solid rgba(0,242,255,0.18)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
        onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(0,242,255,0.17)';e.currentTarget.style.transform = 'scale(1.06)';},
        onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(0,242,255,0.07)';e.currentTarget.style.transform = 'scale(1)';} },
      "\uD83C\uDF92"), /*#__PURE__*/

      React.createElement("button", { onClick: onClose,
        style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
        onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.14)';e.currentTarget.style.color = '#f87171';},
        onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.04)';e.currentTarget.style.color = '#6b7280';} },
      "\u2715")
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: {
          display: 'flex', overflowX: 'auto', gap: '3px',
          padding: '10px 10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          scrollbarWidth: 'none', flexShrink: 0,
          background: 'rgba(0,0,0,0.14)'
        } },
      tabs.map((tab) => {
        var active = activeTab === tab.id;
        return (/*#__PURE__*/
          React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), style: {
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '6px 12px 8px', borderRadius: '10px 10px 0 0',
              fontSize: '10px', fontWeight: active ? 800 : 500, cursor: 'pointer', border: 'none',
              background: active ? 'rgba(0,242,255,0.09)' : 'transparent',
              color: active ? '#00f2ff' : '#4b6070',
              borderBottom: active ? '2px solid #00f2ff' : '2px solid transparent',
              transition: 'all 0.18s', minWidth: '50px'
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '16px', lineHeight: 1 } }, tab.icon), /*#__PURE__*/
          React.createElement("span", null, lang === 'ar' ? tab.label_ar : tab.label_en)
          ));

      })
      ), /*#__PURE__*/


      React.createElement("div", { style: {
          flex: 1, overflowY: 'auto', padding: '14px',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,242,255,0.18) transparent'
        } },


      activeTab === 'rings' && (getRingsShopSection() ? /*#__PURE__*/
      React.createElement(window.RingsShopSection, {
        userData: userData, lang: lang, currentUID: currentUID,
        onPropose: onPropose || (() => {}), coupleData: coupleData,
        onOpenCoupleCard: onOpenCoupleCard }
      ) : /*#__PURE__*/

      React.createElement("div", { style: { padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '12px' } }, "\u23F3 ",
      lang === 'ar' ? 'جاري التحميل...' : 'Loading...'
      )),



      activeTab === 'bff_tokens' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, /*#__PURE__*/

      React.createElement("div", { style: {
          padding: '12px 14px', borderRadius: '14px',
          background: 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(112,0,255,0.08))',
          border: '1px solid rgba(167,139,250,0.3)'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#e9d5ff', marginBottom: '4px' } }, "\uD83E\uDD1D ",
      lang === 'ar' ? 'توكنات BFF' : 'BFF Tokens'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 } },
      lang === 'ar' ?
      `اشترِ توكن لإنشاء علاقة صداقة. لديك ${BFF_CONFIG.freeSlots} خانات مجانية.` :
      `Buy a token to create a friendship. You have ${BFF_CONFIG.freeSlots} free slots.`
      )
      ),

      (typeof BFF_TOKEN_ITEMS !== 'undefined' ? BFF_TOKEN_ITEMS : []).map((token) => {
        var myTokenCount = (userData?.inventory?.bff_tokens || []).filter((t) => t === token.id).length;
        var canAfford = (userData?.currency || 0) >= token.cost;
        return (/*#__PURE__*/
          React.createElement("div", { key: token.id, style: {
              padding: '14px 16px', borderRadius: '16px',
              background: `linear-gradient(135deg,${token.color}10,${token.color}05)`,
              border: `1px solid ${token.color}35`,
              display: 'flex', alignItems: 'center', gap: '14px'
            } }, /*#__PURE__*/

          React.createElement("div", { style: {
              width: '50px', height: '50px', flexShrink: 0, borderRadius: '14px',
              background: `${token.color}18`, border: `1px solid ${token.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              boxShadow: `0 0 12px ${token.glow}`
            } },
          token.imageURL ? /*#__PURE__*/
          React.createElement("img", { src: token.imageURL, alt: "", style: { width: '36px', height: '36px', objectFit: 'contain' } }) :
          token.emoji
          ), /*#__PURE__*/

          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: 'white', marginBottom: '2px' } },
          lang === 'ar' ? token.name_ar : token.name_en
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: BFF_RARITY_COLORS?.[token.rarity] || '#9ca3af', fontWeight: 700, marginBottom: '3px' } }, token.rarity), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } },
          lang === 'ar' ? token.desc_ar : token.desc_en
          ),
          myTokenCount > 0 && /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#4ade80', fontWeight: 700, marginTop: '3px' } }, "\u2705 ",
          lang === 'ar' ? `لديك ${myTokenCount} توكن` : `You have ${myTokenCount} token(s)`
          )

          ), /*#__PURE__*/

          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#fcd34d' } },
          token.cost.toLocaleString(), " \uD83E\uDDE0"
          ), /*#__PURE__*/
          React.createElement("button", {
            onClick: () => onPurchase && onPurchase(token),
            disabled: !canAfford,
            style: {
              padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
              background: canAfford ? `linear-gradient(135deg,${token.color},${token.color}88)` : 'rgba(255,255,255,0.06)',
              color: canAfford ? '#000' : '#4b5563',
              fontSize: '11px', fontWeight: 800,
              boxShadow: canAfford ? `0 3px 12px ${token.glow}` : 'none',
              transition: 'all 0.2s'
            } }, "\uD83E\uDD1D ",
          lang === 'ar' ? 'شراء' : 'Buy'
          )
          )
          ));

      })
      ),



      activeTab === 'red_packets' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { padding: '12px 14px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(185,28,28,0.06))', border: '1px solid rgba(239,68,68,0.25)' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#fca5a5', marginBottom: '4px' } }, "\uD83E\uDDE7 ", lang === 'ar' ? 'مغلفات حمراء' : 'Red Packets'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 } }, lang === 'ar' ? 'اشتر مغلفاً وأرسله لأصدقائك أو في الشات — يوزع الرصيد على المستلمين!' : 'Buy a packet and send it to friends or in chat — coins split among recipients!')
      ),
      (typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map((rp) => {
        var canAfford = (userData?.currency || 0) >= rp.amount;
        return (/*#__PURE__*/
          React.createElement("div", { key: rp.id, style: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '16px', background: rp.bg, border: `1px solid ${rp.border}` } },
          rp.imageURL ? /*#__PURE__*/
          React.createElement("img", { src: rp.imageURL, alt: "", style: { width: '50px', height: '50px', objectFit: 'contain', flexShrink: 0 } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '50px', height: '50px', borderRadius: '14px', background: `${rp.color}20`, border: `1px solid ${rp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 } }, "\uD83E\uDDE7"), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: rp.color, marginBottom: '2px' } }, lang === 'ar' ? rp.name_ar : rp.name_en), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginBottom: '2px' } }, lang === 'ar' ? rp.desc_ar : rp.desc_en), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', color: '#fbbf24', fontWeight: 700 } }, (rp.amount || 0).toLocaleString(), " \uD83E\uDDE0 \xB7 ", rp.maxClaims, " ", lang === 'ar' ? 'استلام' : 'claims')
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#fbbf24' } }, (rp.amount || 0).toLocaleString(), " \uD83E\uDDE0"), /*#__PURE__*/
          React.createElement("button", {
            onClick: () => {
              if (!canAfford || !currentUID) return;
              onPurchase(rp);
            },
            disabled: !canAfford,
            style: { padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed', background: canAfford ? `linear-gradient(135deg,${rp.color},${rp.color}88)` : 'rgba(255,255,255,0.06)', color: canAfford ? '#000' : '#4b5563', fontSize: '11px', fontWeight: 800, transition: 'all 0.2s' } }, "\uD83E\uDDE7 ",
          lang === 'ar' ? 'شراء' : 'Buy'
          )
          )
          ));

      })
      ),



      activeTab !== 'rings' && activeTab !== 'bff_tokens' && activeTab !== 'red_packets' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },


      activeTab === 'gifts' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, /*#__PURE__*/

      React.createElement("div", { style: {
          display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '6px',
          scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '4px'
        } },
      [
      { id: 'all', label_ar: 'الكل', label_en: 'All', icon: '📦' },
      { id: 'vip', label_ar: 'VIP', label_en: 'VIP', icon: '👑' },
      { id: 'family', label_ar: 'القبيلة', label_en: 'Family', icon: '🛡️' },
      { id: 'special', label_ar: 'مميز', label_en: 'Special', icon: '✨' },
      { id: 'flags', label_ar: 'أعلام', label_en: 'Flags', icon: '🚩' }].
      map((st) => {
        var active = activeGiftSubTab === st.id;
        return (/*#__PURE__*/
          React.createElement("button", { key: st.id, onClick: () => setActiveGiftSubTab(st.id), style: {
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: active ? 900 : 600,
              background: active ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.03)',
              border: active ? '1px solid rgba(0,242,255,0.32)' : '1px solid rgba(255,255,255,0.06)',
              color: active ? '#00f2ff' : '#4b6170', cursor: 'pointer', transition: 'all 0.18s'
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '14px' } }, st.icon), /*#__PURE__*/
          React.createElement("span", null, lang === 'ar' ? st.label_ar : st.label_en)
          ));

      })
      ), /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowGiftFilter((p) => !p), style: {
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '5px 11px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
          background: showGiftFilter ? 'rgba(0,242,255,0.09)' : 'rgba(255,255,255,0.04)',
          border: showGiftFilter ? '1px solid rgba(0,242,255,0.28)' : '1px solid rgba(255,255,255,0.07)',
          color: showGiftFilter ? '#00f2ff' : '#4b6070', cursor: 'pointer', transition: 'all 0.15s'
        } }, "\uD83D\uDD0D ",
      lang === 'ar' ? 'فلتر' : 'Filter',
      (giftRarityFilter !== 'all' || giftVIPOnly || giftSort !== 'default') && /*#__PURE__*/
      React.createElement("span", { style: { background: '#ef4444', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "!")

      ),
      ['default', 'price_asc', 'price_desc'].map((s) => /*#__PURE__*/
      React.createElement("button", { key: s, onClick: () => setGiftSort(s), style: {
          padding: '5px 9px', borderRadius: '7px', fontSize: '9px', fontWeight: 700,
          background: giftSort === s ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
          border: giftSort === s ? '1px solid rgba(251,191,36,0.32)' : '1px solid rgba(255,255,255,0.06)',
          color: giftSort === s ? '#fbbf24' : '#4b6070', cursor: 'pointer', transition: 'all 0.15s'
        } },
      s === 'default' ? lang === 'ar' ? 'افتراضي' : 'Default' : s === 'price_asc' ? '↑ ' + (lang === 'ar' ? 'سعر' : 'Price') : '↓ ' + (lang === 'ar' ? 'سعر' : 'Price')
      )
      )
      ),
      showGiftFilter && /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#4b6070', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' } },
      lang === 'ar' ? '🎨 النادرية' : '🎨 Rarity'
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
      ['all', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((r) => {
        var rc = RARITY_CONFIG[r] || {};
        return (/*#__PURE__*/
          React.createElement("button", { key: r, onClick: () => setGiftRarityFilter(r), style: {
              padding: '3px 9px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
              background: giftRarityFilter === r ? rc.bg || 'rgba(0,242,255,0.13)' : 'rgba(255,255,255,0.03)',
              border: giftRarityFilter === r ? `1px solid ${rc.border || '#00f2ff'}` : '1px solid rgba(255,255,255,0.06)',
              color: giftRarityFilter === r ? rc.color || '#00f2ff' : '#4b6070'
            } },
          r === 'all' ? lang === 'ar' ? 'الكل' : 'All' : (rc.icon || '') + ' ' + (lang === 'ar' ? RARITY_CONFIG[r]?.name_ar || r : RARITY_CONFIG[r]?.name_en || r)
          ));

      })
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setGiftVIPOnly((p) => !p), style: {
          padding: '4px 10px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
          background: giftVIPOnly ? 'rgba(239,68,68,0.09)' : 'rgba(255,255,255,0.04)',
          border: giftVIPOnly ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
          color: giftVIPOnly ? '#ef4444' : '#4b6070'
        } }, "\uD83D\uDC51 ",
      lang === 'ar' ? 'هدايا VIP فقط' : 'VIP Gifts Only'
      ),
      (giftRarityFilter !== 'all' || giftVIPOnly || giftSort !== 'default') && /*#__PURE__*/
      React.createElement("button", { onClick: () => {setGiftRarityFilter('all');setGiftVIPOnly(false);setGiftSort('default');}, style: {
          padding: '4px 9px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, cursor: 'pointer',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171'
        } }, "\u2715 ",
      lang === 'ar' ? 'مسح الفلاتر' : 'Clear'
      )

      )
      )

      )
      ), /*#__PURE__*/



      React.createElement("div", { style: {
          display: 'grid',
          gridTemplateColumns: activeTab === 'gifts' ? 'repeat(auto-fill,minmax(82px,1fr))' : 'repeat(auto-fill,minmax(106px,1fr))',
          gap: '8px'
        } },
      getTabItems(activeTab)?.map((item) => {
        var owned = isOwned(item);
        var equippedItem = isEquipped(item);
        var isEventItem = item.isEvent;
        var isLimited = item.limitedTime;
        var isEventOnly = item.eventOnly;

        /* Gift cards */
        if (activeTab === 'gifts') {
          var isVIPGift = item.type === 'gifts_vip';
          var vipRequired = item.vipMinLevel || 0;
          var isVIPLocked = isVIPGift && vipLevel < vipRequired;
          var isVIPMaxGift = isVIPGift && vipRequired >= 10;
          var vipGlowType = item.vipGlowType || null;
          var rKey = getGiftRarity(item.cost);
          var rarity = RARITY_CONFIG[rKey];
          var vipCfg = vipRequired > 0 ? VIP_CONFIG[vipRequired - 1] : null;
          var vipGlowColor = vipCfg ? vipCfg.nameColor : '#7c3aed';
          var cardBorder = isVIPGift ? `1.5px solid ${vipGlowColor}66` : `1.5px solid ${rarity.border}`;
          var cardBg = isVIPGift && !isVIPLocked ? `linear-gradient(145deg,${vipGlowColor}0e,rgba(8,10,28,0.98))` : rarity.bg;
          var hasSpecialGlow = !isVIPLocked && vipGlowType;
          var cardShadow = hasSpecialGlow ? 'none' :
          isVIPGift && !isVIPLocked ?
          isVIPMaxGift ? `0 0 16px ${vipGlowColor}99,0 0 30px ${vipGlowColor}44` : `0 0 9px ${vipGlowColor}55` :
          rarity.glow && rKey === 'Mythic' ? '0 0 14px rgba(255,0,85,0.6)' : rarity.glow ? `0 0 8px ${rarity.color}44` : 'none';
          var glowClass = hasSpecialGlow ? `glow-${vipGlowType}` : '';
          var cardAnim = !hasSpecialGlow && (
          isVIPMaxGift && !isVIPLocked ? 'mythic-pulse 2s ease-in-out infinite' :
          rKey === 'Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none');

          return (/*#__PURE__*/
            React.createElement("div", { key: item.id, className: glowClass,
              onClick: () => {if (!isEventOnly) {setSelectedItem(item);setShowPreview(true);}},
              style: {
                position: 'relative', cursor: isEventOnly ? 'default' : 'pointer',
                border: cardBorder, background: cardBg, boxShadow: cardShadow,
                borderRadius: '12px', padding: '10px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '90px', gap: '4px',
                opacity: isEventOnly || isVIPLocked ? 0.58 : 1,
                animation: cardAnim || 'none', transition: 'transform 0.14s'
              },
              onMouseEnter: (e) => {if (!isEventOnly && !isVIPLocked) e.currentTarget.style.transform = 'scale(1.06)';},
              onMouseLeave: (e) => {e.currentTarget.style.transform = 'scale(1)';} }, /*#__PURE__*/

            React.createElement("span", { style: { position: 'absolute', top: '3px', left: '3px', fontSize: '8px' } }, rarity.icon),
            isEventItem && /*#__PURE__*/React.createElement("span", { className: "shop-event-tag" }, "\u26A1"),
            isLimited && /*#__PURE__*/React.createElement("span", { className: "shop-limited-tag" }, "\u23F3"),

            item.durationDays && !isLimited && /*#__PURE__*/
            React.createElement("span", { style: { position: 'absolute', bottom: '3px', left: '3px', fontSize: '6px', fontWeight: 900, background: 'rgba(245,158,11,0.85)', color: '#000', padding: '1px 3px', borderRadius: '3px' } },
            item.durationDays, "d"
            ),

            isVIPGift && /*#__PURE__*/
            React.createElement("span", { style: { position: 'absolute', top: '3px', right: '3px', fontSize: '7px', fontWeight: 900, background: vipGlowColor, color: '#000', padding: '1px 4px', borderRadius: '4px', boxShadow: isVIPMaxGift ? `0 0 8px ${vipGlowColor}` : 'none', animation: isVIPMaxGift ? 'mythic-pulse 2s ease-in-out infinite' : 'none' } }, "VIP ",
            vipRequired
            ),

            item.imageUrl ? /*#__PURE__*/
            React.createElement("img", { src: item.imageUrl, alt: "", style: { width: '32px', height: '32px', objectFit: 'contain', marginBottom: '2px' } }) : /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '26px', lineHeight: 1, marginBottom: '2px' } }, item.emoji), /*#__PURE__*/

            React.createElement("div", { style: { fontSize: '9px', fontWeight: 800, color: '#fbbf24' } }, item.cost.toLocaleString(), "\uD83E\uDDE0"), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '8px', color: '#9ca3af' } }, "+", formatCharisma(item.charisma), "\u2B50"), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '7px', color: '#a78bfa', fontWeight: 700 } }, "+", getGiftVIPXP(item), " VXP"),
            isVIPLocked && /*#__PURE__*/
            React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '16px' } }, "\uD83D\uDD12"), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '7px', color: vipGlowColor, fontWeight: 800 } }, "VIP ", vipRequired, "+")
            ),

            isEventOnly && !isVIPLocked && /*#__PURE__*/
            React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '18px' } }, "\uD83D\uDD12")
            )

            ));

        }

        /* Non-gift cards */
        var rKey2 = getItemRarity(item);
        var rarity2 = RARITY_CONFIG[rKey2];
        return (/*#__PURE__*/
          React.createElement("div", { key: item.id,
            onClick: () => {if (!item.eventOnly) {setSelectedItem(item);setShowPreview(true);}},
            style: {
              position: 'relative', cursor: item.eventOnly ? 'default' : 'pointer',
               border: `1.5px solid ${equippedItem ? 'rgba(0,242,255,0.45)' : rarity2.border}`,
               background: equippedItem ? 'linear-gradient(145deg,rgba(0,242,255,0.07),rgba(8,10,28,0.98))' : 
                          (item.type === 'titles' && item.imageUrl) ? 'transparent' : rarity2.bg,
               boxShadow: equippedItem ? '0 0 14px rgba(0,242,255,0.22)' : rarity2.glow ? `0 0 8px ${rarity2.color}33` : 'none',

              borderRadius: '12px', padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              opacity: item.eventOnly ? 0.58 : 1,
              transition: 'transform 0.14s'
            },
            onMouseEnter: (e) => {if (!item.eventOnly) e.currentTarget.style.transform = 'scale(1.05)';},
            onMouseLeave: (e) => {e.currentTarget.style.transform = 'scale(1)';} }, /*#__PURE__*/

          React.createElement("span", { style: { position: 'absolute', top: '3px', left: '3px', fontSize: '8px' } }, rarity2.icon),
          item.isEvent && /*#__PURE__*/React.createElement("span", { className: "shop-event-tag" }, "\u26A1"),
          item.limitedTime && /*#__PURE__*/React.createElement("span", { className: "shop-limited-tag" }, "\u23F3"),
          equippedItem && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '4px', right: '4px', width: '7px', height: '7px', borderRadius: '50%', background: '#00f2ff', boxShadow: '0 0 6px #00f2ff' } }), /*#__PURE__*/
          React.createElement("div", { style: { marginTop: '4px' } }, renderPreview(item)), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: equippedItem ? '#00f2ff' : '#d1d5db', textAlign: 'center', lineHeight: 1.3, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          lang === 'ar' ? item.name_ar : item.name_en
          ),
          item.eventOnly ? /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '8px', color: '#7c3aed', fontWeight: 700 } }, "\uD83D\uDD12 Event") :
          owned ?
          equippedItem ? /*#__PURE__*/
          React.createElement("button", { onClick: (e) => {e.stopPropagation();onUnequip(item.type, item.id);}, style: { width: '100%', fontSize: '8px', padding: '3px 0', borderRadius: '5px', background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.32)', color: '#f87171', cursor: 'pointer', fontWeight: 700, transition: 'all 0.12s' }, onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.22)';}, onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.13)';} }, t.unequip) : /*#__PURE__*/
          React.createElement("button", { onClick: (e) => {e.stopPropagation();onEquip(item);}, style: { width: '100%', fontSize: '8px', padding: '3px 0', borderRadius: '5px', background: 'rgba(74,222,128,0.13)', border: '1px solid rgba(74,222,128,0.32)', color: '#4ade80', cursor: 'pointer', fontWeight: 700, transition: 'all 0.12s' }, onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(74,222,128,0.22)';}, onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(74,222,128,0.13)';} }, t.equip) : /*#__PURE__*/

          React.createElement("div", { style: { fontSize: '9px', color: '#fbbf24', fontWeight: 800 } }, item.cost.toLocaleString(), "\uD83E\uDDE0")

          ));

      })
      )
      )

      )
      )
      ),





      showPreview && selectedItem && ReactDOM.createPortal(
        (() => {
          // للهدايا: نستخدم GiftPreviewModal الأصلي
          if (selectedItem.type && selectedItem.type.startsWith('gifts')) {
            var GPM = getGiftPreviewModal();
            if (!GPM) {
              console.warn('GiftPreviewModal not yet available in window');
              return null;
            }
            return (/*#__PURE__*/
              React.createElement(GPM, {
                show: showPreview,
                onClose: () => setShowPreview(false),
                gift: selectedItem,
                lang: lang,
                onBuy: (item, target) => {if (currency >= item.cost) {onPurchase(item, target);setShowPreview(false);}},
                currency: currency,
                friendsData: [],
                user: { uid: userData?.uid },
                currentUserData: userData }
              ));

          }
          // للأيتمز الأخرى (frames/titles/badges/effects): نافذة شراء مخصصة
          var item = selectedItem;
          var canAfford = currency >= item.cost;
          var owned = (userData?.inventory?.[item.type] || []).includes(item.id);
          var name = lang === 'ar' ? item.name_ar : item.name_en;
          var desc = lang === 'ar' ? item.desc_ar || item.description_ar || '' : item.desc_en || item.description_en || '';
          return (/*#__PURE__*/
            React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: (Z.MODAL_HIGH || 9000) + 10, padding: '20px' },
              onClick: () => setShowPreview(false) }, /*#__PURE__*/
            React.createElement("div", { style: { background: 'linear-gradient(160deg,#0a0e1f,#0d1225)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '22px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 0 80px rgba(0,0,0,0.9)' },
              onClick: (e) => e.stopPropagation(), className: "animate-pop" }, /*#__PURE__*/

            React.createElement("div", { style: { height: '2px', background: 'linear-gradient(90deg,transparent,#00f2ff,#7c3aed,transparent)' } }), /*#__PURE__*/
            React.createElement("div", { style: { padding: '24px 20px 20px', textAlign: 'center' } }, /*#__PURE__*/

            React.createElement("div", { style: { width: '72px', height: '72px', borderRadius: '18px', 
              background: (item.type === 'titles' && item.imageUrl) ? 'transparent' : 'rgba(0,242,255,0.06)', 
              border: (item.type === 'titles' && item.imageUrl) ? 'none' : '1px solid rgba(0,242,255,0.18)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '40px' } },

            item.type === 'frames' ?
            item.preview?.startsWith('http') ? /*#__PURE__*/
            React.createElement("img", { src: item.preview, alt: "", style: { width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' } }) : /*#__PURE__*/
            React.createElement("div", { style: { width: '52px', height: '52px', borderRadius: '50%', background: item.preview } }) :
            item.imageUrl ? /*#__PURE__*/
            React.createElement("img", { src: item.imageUrl, alt: "", style: { width: '48px', height: '48px', objectFit: 'contain' } }) : /*#__PURE__*/
            React.createElement("span", null, item.preview || '🎨')
            ), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '17px', fontWeight: 900, color: '#f1f5f9', marginBottom: '4px' } }, name),
            desc && /*#__PURE__*/React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' } }, desc), /*#__PURE__*/

            React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.05))', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '10px', padding: '6px 16px', marginBottom: '16px' } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '16px' } }, "\uD83E\uDDE0"), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '16px', fontWeight: 900, color: '#fbbf24' } }, item.cost?.toLocaleString())
            ),

            owned ? /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
            React.createElement("div", { style: { padding: '10px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', fontSize: '13px', color: '#4ade80', fontWeight: 700 } }, "\u2705 ",
            lang === 'ar' ? 'تمتلك هذا العنصر' : 'You own this item'
            ), /*#__PURE__*/
            React.createElement("button", { onClick: () => setShowPreview(false), style: { width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
            lang === 'ar' ? 'إغلاق' : 'Close'
            )
            ) : /*#__PURE__*/

            React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
            React.createElement("button", { onClick: () => setShowPreview(false), style: { flex: 1, padding: '11px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#6b7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
            lang === 'ar' ? 'إلغاء' : 'Cancel'
            ), /*#__PURE__*/
            React.createElement("button", {
              onClick: () => {if (canAfford) {onPurchase(item);setShowPreview(false);}},
              disabled: !canAfford,
              style: { flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: canAfford ? 'linear-gradient(135deg,#00f2ff22,#7c3aed44)' : 'rgba(100,100,100,0.12)', color: canAfford ? '#00f2ff' : '#4b5563', fontSize: '13px', fontWeight: 900, cursor: canAfford ? 'pointer' : 'not-allowed', border: canAfford ? '1px solid rgba(0,242,255,0.35)' : '1px solid rgba(255,255,255,0.05)' } },
            canAfford ?
            lang === 'ar' ? '🛒 شراء' : '🛒 Buy' :
            lang === 'ar' ? '❌ رصيد غير كافٍ' : '❌ Not enough'
            )
            )

            )
            )
            ));

        })(),
        document.body
      )
      ));

  };


  // ─── Reclaim Sent Packets Component ───
  var ReclaimSentPackets = ({ user, userData, lang, sentPackets, setSentPackets, loadingSent, setLoadingSent }) => {
    var [loaded, setLoaded] = React.useState(false);

    var loadSent = async () => {
      if (!user || loadingSent) return;
      setLoadingSent(true);
      try {
        var snap = await redPacketsCollection.
        where('senderId', '==', user.uid).
        where('status', '==', 'active').
        limit(10).
        get();
        var packets = snap.docs.
        map((d) => ({ id: d.id, ...d.data() })).
        filter((p) => (p.claimedBy || []).length === 0);
        setSentPackets(packets);
        setLoaded(true);
      } catch (e) {}
      setLoadingSent(false);
    };

    if (!loaded) return (/*#__PURE__*/
      React.createElement("button", { onClick: loadSent, disabled: loadingSent, style: { padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', width: '100%' } },
      loadingSent ? '⏳ ...' : `🔄 ${lang === 'ar' ? 'عرض المغلفات المرسلة (استرداد)' : 'Show Sent Packets (Reclaim)'}`
      ));


    if (sentPackets.length === 0) return (/*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', fontSize: '10px', color: '#4b5563', padding: '6px' } },
      lang === 'ar' ? 'لا مغلفات مرسلة بانتظار الاستلام' : 'No sent packets awaiting claim'
      ));


    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '2px' } }, "\uD83D\uDD04 ",
      lang === 'ar' ? 'مغلفات مرسلة — يمكنك استردادها' : 'Sent Packets — Reclaim if unclaimed'
      ),
      sentPackets.map((sp) => {
        var RPC = typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
        var cfg = RPC.find((r) => r.id === sp.configId || sp.configId?.startsWith(r.id));
        var color = cfg?.color || '#ef4444';
        return (/*#__PURE__*/
          React.createElement("div", { key: sp.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '22px' } }, "\uD83E\uDDE7"), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color } }, sp.amount?.toLocaleString(), " \uD83E\uDDE0"), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', marginTop: '1px' } },
          lang === 'ar' ? 'لـ:' : 'To:', " ", sp.targetType === 'family' ? lang === 'ar' ? 'شات القبيلة' : 'Family Chat' : sp.targetName || 'DM'
          )
          ), /*#__PURE__*/
          React.createElement("button", { onClick: async () => {
              try {
                // Mark as reclaimed so no one can claim it anymore
                await redPacketsCollection.doc(sp.id).update({
                  status: 'reclaimed',
                  remaining: 0,
                  maxClaims: 0,
                  reclaimedAt: TS()
                });
                var uniqueId = (sp.configId || 'rp_600') + '_' + Date.now();
                await usersCollection.doc(user.uid).update({
                  'inventory.red_packets': firebase.firestore.FieldValue.arrayUnion(uniqueId)
                });
                setSentPackets((prev) => prev.filter((p) => p.id !== sp.id));
              } catch (e) {}
            }, style: { padding: '5px 12px', borderRadius: '8px', background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(185,28,28,0.15))', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', fontSize: '10px', fontWeight: 800, cursor: 'pointer', flexShrink: 0 } }, "\u21A9 ",
          lang === 'ar' ? 'استرداد' : 'Reclaim'
          )
          ));

      })
      ));

  };

  // ═══════════════════════════════════════════════════════════════
  // 📦  INVENTORY MODAL — Premium Dark Collection Viewer
  // ═══════════════════════════════════════════════════════════════
  var InventoryModal = ({ show, onClose, userData, lang, onEquip, onUnequip, onSendGift, friendsData, isLoggedIn, currentUserData, user, coupleData, onOpenCoupleCard, onPropose }) => {
    var t = TRANSLATIONS[lang];
    var [activeTab, setActiveTab] = useState('frames');
    var [rpSendTarget, setRpSendTarget] = useState(null); // 'self' | 'family' | friendUID
    var [rpSendModal, setRpSendModal] = useState(null); // { ...rpConfig, inventoryId }
    var [sentPackets, setSentPackets] = useState([]); // reclaim list
    var [loadingSent, setLoadingSent] = useState(false);
    var [selectedGift, setSelectedGift] = useState(null);
    var [showGiftPreview, setShowGiftPreview] = useState(false);
    // ✅ FIX 2: item details popup
    var [detailItem, setDetailItem] = useState(null);

    if (!show) return null;

    var inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [], rings: [] };
    var equipped = userData?.equipped || {};
    var giftCounts = inventory.giftCounts || {};
    var myRings = inventory.rings || [];
    var expiry = inventory.expiry || {}; // { itemId: timestampMs }

    var getOwnedItems = (type) => {
      var ownedIds = inventory[type] || [];
      if (type === 'gifts') {
        return SHOP_ITEMS[type]?.filter((item) => ownedIds.includes(item.id) && (giftCounts[item.id] || 0) > 0) || [];
      }
      if (type === 'rings') {
        var uniqueIds = [...new Set(ownedIds)];
        return (typeof RINGS_DATA !== 'undefined' ? RINGS_DATA : []).filter((r) => uniqueIds.includes(r.id));
      }
      return SHOP_ITEMS[type]?.filter((item) => ownedIds.includes(item.id)) || [];
    };

    var isEquipped = (item) => {
      if (item.type === 'badges') {var eb = equipped.badges || [];return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id;}
      return equipped[item.type] === item.id;
    };
    var getEquippedBadgeCount = () => {var eb = equipped.badges || [];return Array.isArray(eb) ? eb.length : equipped.badges ? 1 : 0;};

    // ✅ FIX 2: days remaining helper
    var getDaysLeft = (itemId) => {
      var exp = expiry[itemId];
      if (!exp) return null;
      var ms = exp - Date.now();
      if (ms <= 0) return 0;
      return Math.ceil(ms / 86400000);
    };

    var renderPreview = (item) => {
      if (item.type === 'frames') return item.preview.startsWith('http') ? /*#__PURE__*/
      React.createElement("img", { src: item.preview, alt: item.name_en, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', background: item.preview } });
      if (item.type === 'badges') return item.imageUrl ? /*#__PURE__*/React.createElement("img", { src: item.imageUrl, alt: item.name_en, style: { width: '34px', height: '34px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '26px' } }, item.preview);
      if (item.type === 'titles') return item.imageUrl ? /*#__PURE__*/React.createElement("img", { src: item.imageUrl, alt: item.name_en, style: { width: '30px', height: '30px', objectFit: 'contain', background: 'transparent !important', border: 'none' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '24px' } }, item.preview);
      if (item.type === 'gifts') return item.imageUrl ? /*#__PURE__*/React.createElement("img", { src: item.imageUrl, alt: item.name_en, style: { width: '34px', height: '34px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '26px' } }, item.emoji);
      if (item.type === 'profileEffects') {
        var src = typeof item.particles === 'string' && item.particles.startsWith('http') ? item.particles : item.imageUrl || null;
        return src ? /*#__PURE__*/React.createElement("img", { src: src, alt: item.name_en, style: { width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '28px', lineHeight: 1 } }, item.preview);
      }
      return /*#__PURE__*/React.createElement("span", { style: { fontSize: '24px' } }, "\uD83C\uDFA8");
    };

    // ✅ FIX 2: Item Details Popup Component
    var ItemDetailPopup = ({ item, onClose: closePopup }) => {
      if (!item) return null;
      var daysLeft = getDaysLeft(item.id);
      var desc = lang === 'ar' ? item.desc_ar || item.description_ar || '' : item.desc_en || item.description_en || '';
      var name = lang === 'ar' ? item.name_ar : item.name_en;
      return (/*#__PURE__*/
        React.createElement("div", { onClick: closePopup, style: {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: Z.TOOLTIP, padding: '20px'
          } }, /*#__PURE__*/
        React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "animate-pop", style: {
            background: 'linear-gradient(160deg,#0d1225,#0a0e1f)',
            border: '1px solid rgba(0,242,255,0.18)',
            borderRadius: '18px', padding: '18px',
            width: '100%', maxWidth: '300px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
          } }, /*#__PURE__*/

        React.createElement("div", { style: { textAlign: 'center', marginBottom: '12px' } },
        renderPreview(item), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '14px', fontWeight: 900, color: '#f1f5f9', marginTop: '8px' } }, name)
        ),

        desc && /*#__PURE__*/
        React.createElement("div", { style: {
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '10px 12px', marginBottom: '10px',
            fontSize: '11px', color: '#9ca3af', lineHeight: 1.6, textAlign: 'center'
          } }, desc),


        daysLeft !== null && /*#__PURE__*/
        React.createElement("div", { style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '9px', marginBottom: '10px',
            background: daysLeft <= 3 ? 'rgba(239,68,68,0.1)' : daysLeft <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(74,222,128,0.08)',
            border: daysLeft <= 3 ? '1px solid rgba(239,68,68,0.3)' : daysLeft <= 7 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(74,222,128,0.22)'
          } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '14px' } }, daysLeft === 0 ? '❌' : daysLeft <= 3 ? '⚠️' : daysLeft <= 7 ? '⏳' : '✅'), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: daysLeft === 0 ? '#f87171' : daysLeft <= 3 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : '#4ade80' } },
        daysLeft === 0 ?
        lang === 'ar' ? 'انتهت الصلاحية' : 'Expired' :
        lang === 'ar' ?
        `تنتهي بعد ${daysLeft} يوم` :
        `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
        )
        ),

        daysLeft === null && /*#__PURE__*/
        React.createElement("div", { style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '6px 10px', borderRadius: '8px', marginBottom: '10px',
            background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)'
          } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '12px' } }, "\u267E\uFE0F"), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '10px', color: '#a78bfa', fontWeight: 600 } },
        lang === 'ar' ? 'دائم — لا ينتهي' : 'Permanent — never expires'
        )
        ), /*#__PURE__*/


        React.createElement("button", { onClick: closePopup, style: {
            width: '100%', padding: '9px', borderRadius: '10px', border: 'none',
            background: 'rgba(255,255,255,0.06)', color: '#9ca3af',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer'
          } },
        lang === 'ar' ? 'إغلاق' : 'Close'
        )
        )
        ));

    };

    var TABS = [
    { id: 'red_packets', icon: '🧧', label_ar: 'مغلفاتي', label_en: 'Packets' },
    { id: 'frames', icon: '🖼️', label_ar: 'إطارات', label_en: 'Frames' },
    { id: 'titles', icon: '🏷️', label_ar: 'ألقاب', label_en: 'Titles' },
    { id: 'badges', icon: '🏅', label_ar: 'شارات', label_en: 'Badges' },
    { id: 'profileEffects', icon: '✨', label_ar: 'تأثيرات', label_en: 'Effects' },
    { id: 'gifts', icon: '🎁', label_ar: 'هدايا', label_en: 'Gifts' },
    { id: 'rings', icon: '💍', label_ar: 'خواتم', label_en: 'Rings' }];

    var ownedItems = getOwnedItems(activeTab);

    return (/*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { backdropFilter: 'blur(6px)' } }, /*#__PURE__*/
      React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
          background: 'linear-gradient(160deg,#0a0e1f 0%,#0d1225 55%,#080c1a 100%)',
          border: '1px solid rgba(0,242,255,0.1)',
          borderRadius: '20px',
          width: '96vw', maxWidth: '440px',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 70px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative'
        } }, /*#__PURE__*/

      React.createElement("div", { style: { position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: 'linear-gradient(90deg,transparent,#00f2ff,#7c3aed,transparent)', zIndex: 2 } }), /*#__PURE__*/


      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,rgba(0,242,255,0.05) 0%,rgba(112,0,255,0.05) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          padding: '14px 16px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          width: '38px', height: '38px', borderRadius: '11px',
          background: 'linear-gradient(135deg,rgba(0,242,255,0.11),rgba(112,0,255,0.11))',
          border: '1px solid rgba(0,242,255,0.17)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', flexShrink: 0
        } }, "\uD83C\uDF92"), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '15px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.2px' } },
      t.myInventory || (lang === 'ar' ? 'مخزوني' : 'My Inventory')
      ),
      activeTab === 'badges' && /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#9ca3af', marginTop: '1px' } }, /*#__PURE__*/
      React.createElement("span", { style: { color: '#00f2ff', fontWeight: 700 } }, getEquippedBadgeCount()), /*#__PURE__*/
      React.createElement("span", { style: { color: '#374151' } }, " / ", MAX_BADGES, " ", lang === 'ar' ? 'شارة مفعّلة' : 'equipped')
      )

      )
      ), /*#__PURE__*/
      React.createElement("button", { onClick: onClose,
        style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.065)', color: '#6b7280', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
        onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.13)';e.currentTarget.style.color = '#f87171';},
        onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.04)';e.currentTarget.style.color = '#6b7280';} },
      "\u2715")
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', overflowX: 'auto', gap: '3px', padding: '10px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.048)', scrollbarWidth: 'none', flexShrink: 0, background: 'rgba(0,0,0,0.13)' } },
      TABS.map((tab) => {
        var active = activeTab === tab.id;
        var cnt = tab.id === 'rings' ? myRings.length : getOwnedItems(tab.id).length;
        return (/*#__PURE__*/
          React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), style: {
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '5px 10px 7px', borderRadius: '10px 10px 0 0',
              fontSize: '9px', fontWeight: active ? 800 : 500, cursor: 'pointer', border: 'none',
              background: active ? 'rgba(0,242,255,0.085)' : 'transparent',
              color: active ? '#00f2ff' : '#4b6070',
              borderBottom: active ? '2px solid #00f2ff' : '2px solid transparent',
              transition: 'all 0.18s', minWidth: '44px'
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '15px', lineHeight: 1, position: 'relative' } },
          tab.icon,
          cnt > 0 && /*#__PURE__*/React.createElement("span", { style: { position: 'absolute', top: '-4px', right: '-6px', background: active ? '#00f2ff' : '#1f2937', color: active ? '#000' : '#9ca3af', borderRadius: '8px', fontSize: '7px', fontWeight: 900, padding: '0 3px', lineHeight: '12px', minWidth: '12px', textAlign: 'center' } }, cnt)
          ), /*#__PURE__*/
          React.createElement("span", null, lang === 'ar' ? tab.label_ar : tab.label_en)
          ));

      })
      ), /*#__PURE__*/


      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '12px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,242,255,0.18) transparent' } },


      activeTab === 'red_packets' && (() => {
        var myPackets = userData?.inventory?.red_packets || [];
        var RPC = typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
        // Support both old IDs (rp_600) and new unique IDs (rp_600_1234567890)
        var findRpConfig = (rpId) => RPC.find((r) => rpId === r.id || rpId.startsWith(r.id + '_'));
        var myFamilyId = userData?.familyId || null;
        return (/*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', textAlign: 'center', marginBottom: '4px' } },
          lang === 'ar' ? 'مغلفاتك الجاهزة للإرسال' : 'Your packets ready to send', /*#__PURE__*/
          React.createElement("span", { style: { color: '#fbbf24', marginRight: '6px', marginLeft: '6px', fontWeight: 700 } }, myPackets.length > 0 ? `(${myPackets.length})` : '')
          ),
          myPackets.length === 0 && /*#__PURE__*/
          React.createElement("div", { style: { textAlign: 'center', padding: '32px', color: '#4b5563' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '32px', marginBottom: '8px' } }, "\uD83E\uDDE7"), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '12px' } }, lang === 'ar' ? 'لا مغلفات بعد — اشتري من المتجر' : 'No packets yet — buy from shop')
          ),

          myPackets.map((rpId, idx) => {
            var rp = findRpConfig(rpId);
            if (!rp) return null;
            return (/*#__PURE__*/
              React.createElement("div", { key: rpId + '-' + idx, style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: rp.bg, border: `1px solid ${rp.border}`, boxSizing: 'border-box' } },
              rp.imageURL ? /*#__PURE__*/
              React.createElement("img", { src: rp.imageURL, alt: "", style: { width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 } }) : /*#__PURE__*/
              React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '10px', background: `${rp.color}20`, border: `1px solid ${rp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 } }, "\uD83E\uDDE7"), /*#__PURE__*/
              React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: rp.color } }, lang === 'ar' ? rp.name_ar : rp.name_en), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } }, rp.amount.toLocaleString(), " \uD83E\uDDE0 \xB7 ", rp.maxClaims, " ", lang === 'ar' ? 'استلام' : 'claims')
              ), /*#__PURE__*/
              React.createElement("button", { onClick: () => setRpSendModal({ ...rp, inventoryId: rpId }),
                style: { padding: '7px 12px', borderRadius: '10px', background: `${rp.color}20`, border: `1px solid ${rp.color}44`, color: rp.color, fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 } }, "\uD83D\uDCE4 ",
              lang === 'ar' ? 'إرسال' : 'Send'
              )
              ));

          }),


          user && /*#__PURE__*/
          React.createElement(ReclaimSentPackets, {
            user: user, userData: userData, lang: lang,
            sentPackets: sentPackets, setSentPackets: setSentPackets,
            loadingSent: loadingSent, setLoadingSent: setLoadingSent }
          ),



          rpSendModal && /*#__PURE__*/
          React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: Z.TOOLTIP, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } }, /*#__PURE__*/
          React.createElement("div", { style: { background: 'linear-gradient(160deg,#0e0e22,#13122a)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '340px' }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#ef4444', marginBottom: '14px', textAlign: 'center' } }, "\uD83E\uDDE7 ", lang === 'ar' ? 'إرسال المغلف لمين؟' : 'Send Packet To?'), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto' } }, /*#__PURE__*/

          React.createElement("button", { onClick: async () => {
              if (!user) return;
              try {
                // 🛡️ SECURITY: Red Packet Self-Reclaim
                if (window.SecurityService) {
                  await window.SecurityService.applyCurrencyTransaction(user.uid, rpSendModal.amount, `Red Packet Reclaim (Self)`);
                } else {
                  await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(rpSendModal.amount) });
                }
                await usersCollection.doc(user.uid).update({
                  'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId)
                });
                setRpSendModal(null);
              } catch (e) {}
            }, style: { padding: '11px', borderRadius: '12px', background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', color: '#00f2ff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } }, "\uD83D\uDC64 ",
          lang === 'ar' ? 'أرسل لنفسي (استلم الرصيد)' : 'Send to myself (get coins)'
          ),

          myFamilyId && /*#__PURE__*/
          React.createElement("button", { onClick: async () => {
              if (!user || !myFamilyId) return;
              try {
                var famCol = typeof familiesCollection !== 'undefined' ?
                familiesCollection :
                db.collection('artifacts').doc(typeof appId !== 'undefined' ? appId : 'prospy').collection('public').doc('data').collection('families');
                var rpRef = await redPacketsCollection.add({
                  configId: rpSendModal.id, amount: rpSendModal.amount,
                  senderId: user.uid, senderName: userData?.displayName || 'User', senderPhoto: userData?.photoURL || null,
                  targetType: 'family', targetId: myFamilyId,
                  claimedBy: [], maxClaims: rpSendModal.maxClaims || 5,
                  remaining: rpSendModal.amount, createdAt: TS(), status: 'active'
                });
                await usersCollection.doc(user.uid).update({ 'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId) });
                await famCol.doc(myFamilyId).collection('messages').add({
                  type: 'red_packet', rpId: rpRef.id, rpAmount: rpSendModal.amount,
                  rpConfigId: rpSendModal.id, maxClaims: rpSendModal.maxClaims || 5,
                  senderId: user.uid, senderName: userData?.displayName || 'User', senderPhoto: userData?.photoURL || null,
                  text: '🧧 ' + rpSendModal.amount, timestamp: TS()
                });
                setRpSendModal(null);
              } catch (e) {console.error('Family RP send error', e);}
            }, style: { padding: '11px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' } }, "\uD83C\uDFE0 ",
          lang === 'ar' ? 'أرسل لشات القبيلة' : 'Send to Family Chat'
          ),


          (friendsData || []).slice(0, 6).map((friend) => {
            var fid = friend.id || friend.uid;
            return (/*#__PURE__*/
              React.createElement("button", { key: fid, onClick: async () => {
                  if (!user || !fid) return;
                  try {
                    var rpRef = await redPacketsCollection.add({
                      configId: rpSendModal.id, amount: rpSendModal.amount,
                      senderId: user.uid, senderName: userData?.displayName || 'User', senderPhoto: userData?.photoURL || null,
                      targetType: 'dm', targetId: fid, targetName: friend.displayName || 'User',
                      claimedBy: [], maxClaims: 1, remaining: rpSendModal.amount,
                      createdAt: TS(), status: 'active'
                    });
                    await usersCollection.doc(user.uid).update({ 'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId) });
                    var chatId = [user.uid, fid].sort().join('_');
                    await chatsCollection.doc(chatId).collection('messages').add({
                      type: 'red_packet', rpId: rpRef.id, rpAmount: rpSendModal.amount,
                      rpConfigId: rpSendModal.id, senderId: user.uid,
                      senderName: userData?.displayName || 'User', senderPhoto: userData?.photoURL || null,
                      text: '🧧 ' + rpSendModal.amount, timestamp: TS(), maxClaims: 1
                    });
                    setRpSendModal(null);
                  } catch (e) {}
                }, style: { padding: '9px 12px', borderRadius: '12px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } },
              friend.photoURL && /*#__PURE__*/React.createElement("img", { src: friend.photoURL, alt: "", style: { width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' } }), /*#__PURE__*/
              React.createElement("span", null, friend.displayName)
              ));

          })
          ), /*#__PURE__*/
          React.createElement("button", { onClick: () => setRpSendModal(null), style: { width: '100%', marginTop: '12px', padding: '9px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', cursor: 'pointer' } }, "\u2715 ", lang === 'ar' ? 'إلغاء' : 'Cancel')
          )
          )

          ));

      })(),


      activeTab === 'rings' && /*#__PURE__*/
      React.createElement("div", null,
      myRings.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px 20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '44px', marginBottom: '12px' } }, "\uD83D\uDC8D"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', color: '#374151', fontWeight: 600 } }, lang === 'ar' ? 'لا خواتم في مخزونك' : 'No rings in your inventory'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#1f2937', marginTop: '4px' } }, lang === 'ar' ? 'اشتر خواتم من متجر الخواتم' : 'Buy rings from the Rings shop')
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      [...new Set(myRings)].map((rid) => {
        var rd = typeof RINGS_DATA !== 'undefined' ? RINGS_DATA.find((r) => r.id === rid) : null;
        if (!rd) return null;
        var count = myRings.filter((id) => id === rid).length;
        return (/*#__PURE__*/
          React.createElement("div", { key: rid, style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: `linear-gradient(135deg,${rd.color}0f,${rd.color}05)`, border: `1px solid ${rd.color}32`, transition: 'all 0.15s' },
            onMouseEnter: (e) => {e.currentTarget.style.background = `linear-gradient(135deg,${rd.color}1a,${rd.color}08)`;},
            onMouseLeave: (e) => {e.currentTarget.style.background = `linear-gradient(135deg,${rd.color}0f,${rd.color}05)`;} }, /*#__PURE__*/

          React.createElement("div", { style: { flexShrink: 0, width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${rd.color}10`, borderRadius: '12px', border: `1px solid ${rd.color}22` } },
          rd.imageURL ? /*#__PURE__*/React.createElement("img", { src: rd.imageURL, alt: "", style: { width: '34px', height: '34px', objectFit: 'contain', filter: `drop-shadow(0 0 6px ${rd.glow})` } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '26px', filter: `drop-shadow(0 0 6px ${rd.glow})` } }, rd.emoji)
          ), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: rd.color } }, lang === 'ar' ? rd.name_ar : rd.name_en), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', color: '#4b5563', marginTop: '2px' } }, rd.rarity),
          count > 1 && /*#__PURE__*/React.createElement("div", { style: { fontSize: '10px', color: '#fcd34d', marginTop: '2px', fontWeight: 700 } }, "\xD7", count, " ", lang === 'ar' ? 'نسخ' : 'copies')
          ), /*#__PURE__*/
          React.createElement("button", { onClick: () => {if (coupleData) {onOpenCoupleCard && onOpenCoupleCard();} else {onPropose && onPropose(rd);}},
            style: { padding: '7px 14px', borderRadius: '10px', border: `1px solid ${rd.color}40`, background: `${rd.color}13`, color: rd.color, fontSize: '11px', fontWeight: 800, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' },
            onMouseEnter: (e) => {e.currentTarget.style.background = `${rd.color}26`;},
            onMouseLeave: (e) => {e.currentTarget.style.background = `${rd.color}13`;} },

          coupleData ? lang === 'ar' ? '💍 أهدِ' : '💍 Gift' : lang === 'ar' ? '📤 استخدم' : '📤 Use'
          )
          ));

      })
      )

      ),



      activeTab !== 'rings' && (
      ownedItems.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px 20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '10px' } }, "\uD83D\uDCE6"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#374151', fontWeight: 600 } }, t.owned, ": 0")
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: '8px' } },
      ownedItems.map((item) => {
        var equippedItem = isEquipped(item);
        var daysLeft = getDaysLeft(item.id);
        var isExpired = daysLeft === 0;
        /* Gift items */
        if (activeTab === 'gifts') {
          var cnt = giftCounts[item.id] || 0;
          return (/*#__PURE__*/
            React.createElement("div", { key: item.id, style: { position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '12px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: 'all 0.15s', opacity: isExpired ? 0.5 : 1 },
              onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.04)';e.currentTarget.style.transform = 'scale(1.04)';},
              onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.02)';e.currentTarget.style.transform = 'scale(1)';} },

            cnt > 0 && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '4px', right: '4px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', fontWeight: 900, fontSize: '8px', padding: '1px 5px', borderRadius: '8px', boxShadow: '0 0 6px rgba(124,58,237,0.45)', zIndex: 1 } }, "\xD7", cnt), /*#__PURE__*/

            React.createElement("div", { onClick: () => setDetailItem(item), style: { position: 'absolute', top: '4px', left: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(0,242,255,0.18)', border: '1px solid rgba(0,242,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '8px', color: '#00f2ff', fontWeight: 900, zIndex: 2 } }, "i"),

            daysLeft !== null && daysLeft > 0 && /*#__PURE__*/
            React.createElement("div", { style: { position: 'absolute', bottom: '28px', left: '2px', background: daysLeft <= 3 ? 'rgba(239,68,68,0.9)' : daysLeft <= 7 ? 'rgba(245,158,11,0.9)' : 'rgba(74,222,128,0.8)', borderRadius: '4px', padding: '1px 4px', fontSize: '7px', fontWeight: 800, color: '#fff', zIndex: 2 } },
            daysLeft, "d"
            ), /*#__PURE__*/

            React.createElement("div", { style: { marginTop: '4px' } }, renderPreview(item)), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#d1d5db', textAlign: 'center', lineHeight: 1.3, maxWidth: '84px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, lang === 'ar' ? item.name_ar : item.name_en), /*#__PURE__*/
            React.createElement("button", { onClick: () => {setSelectedGift(item);setShowGiftPreview(true);},
              disabled: isExpired,
              style: { width: '100%', padding: '4px 0', borderRadius: '6px', background: isExpired ? 'rgba(100,100,100,0.1)' : 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))', border: isExpired ? '1px solid rgba(100,100,100,0.2)' : '1px solid rgba(251,191,36,0.26)', color: isExpired ? '#4b5563' : '#fbbf24', fontSize: '9px', fontWeight: 800, cursor: isExpired ? 'not-allowed' : 'pointer', transition: 'all 0.12s' },
              onMouseEnter: (e) => {if (!isExpired) e.currentTarget.style.background = 'linear-gradient(135deg,rgba(251,191,36,0.22),rgba(245,158,11,0.12))';},
              onMouseLeave: (e) => {if (!isExpired) e.currentTarget.style.background = 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))';} },
            isExpired ? lang === 'ar' ? 'منتهي' : 'Expired' : t.sendGiftToFriend)
            ));

        }
        /* Equippable items */
        return (/*#__PURE__*/
          React.createElement("div", { key: item.id, style: {
              position: 'relative',
              background: equippedItem ? 'linear-gradient(145deg,rgba(0,242,255,0.075),rgba(8,10,28,0.98))' : 'rgba(255,255,255,0.02)',
              border: equippedItem ? '1.5px solid rgba(0,242,255,0.38)' : '1px solid rgba(255,255,255,0.065)',
              boxShadow: equippedItem ? '0 0 12px rgba(0,242,255,0.13)' : 'none',
              borderRadius: '12px', padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
              opacity: isExpired ? 0.5 : 1
            },
            onMouseEnter: (e) => {e.currentTarget.style.transform = 'scale(1.04)';},
            onMouseLeave: (e) => {e.currentTarget.style.transform = 'scale(1)';} },

          equippedItem && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', borderRadius: '50%', background: '#00f2ff', boxShadow: '0 0 6px #00f2ff' } }), /*#__PURE__*/

          React.createElement("div", { onClick: () => setDetailItem(item), style: { position: 'absolute', top: '4px', left: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(0,242,255,0.14)', border: '1px solid rgba(0,242,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '8px', color: '#00f2ff', fontWeight: 900, zIndex: 2 } }, "i"),

          daysLeft !== null && daysLeft > 0 && /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', bottom: '28px', left: '2px', background: daysLeft <= 3 ? 'rgba(239,68,68,0.9)' : daysLeft <= 7 ? 'rgba(245,158,11,0.9)' : 'rgba(74,222,128,0.8)', borderRadius: '4px', padding: '1px 4px', fontSize: '7px', fontWeight: 800, color: '#fff', zIndex: 2 } },
          daysLeft, "d"
          ), /*#__PURE__*/

          React.createElement("div", { style: { marginTop: '4px' } }, renderPreview(item)), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: equippedItem ? '#00f2ff' : '#d1d5db', textAlign: 'center', lineHeight: 1.3, maxWidth: '84px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          lang === 'ar' ? item.name_ar : item.name_en
          ),
          isExpired ? /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '8px', color: '#f87171', fontWeight: 700, textAlign: 'center' } }, "\u274C ",
          lang === 'ar' ? 'منتهي' : 'Expired'
          ) :
          equippedItem ? /*#__PURE__*/
          React.createElement("button", { onClick: () => onUnequip(item.type, item.id),
            style: { width: '100%', padding: '4px 0', borderRadius: '6px', background: 'rgba(239,68,68,0.11)', border: '1px solid rgba(239,68,68,0.28)', color: '#f87171', fontSize: '8px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.12s' },
            onMouseEnter: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.2)';},
            onMouseLeave: (e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.11)';} },
          t.unequip) : /*#__PURE__*/

          React.createElement("button", { onClick: () => onEquip(item),
            disabled: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES,
            style: {
              width: '100%', padding: '4px 0', borderRadius: '6px',
              background: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES ? 'rgba(255,255,255,0.03)' : 'rgba(74,222,128,0.11)',
              border: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES ? '1px solid rgba(255,255,255,0.055)' : '1px solid rgba(74,222,128,0.28)',
              color: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES ? '#1f2937' : '#4ade80',
              fontSize: '8px', fontWeight: 800,
              cursor: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES ? 'not-allowed' : 'pointer',
              opacity: activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES ? 0.45 : 1,
              transition: 'all 0.12s'
            },
            onMouseEnter: (e) => {if (!(activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES)) e.currentTarget.style.background = 'rgba(74,222,128,0.2)';},
            onMouseLeave: (e) => {if (!(activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES)) e.currentTarget.style.background = 'rgba(74,222,128,0.11)';} },
          t.equip)

          ));

      })
      ))


      )
      )
      ),


      detailItem && /*#__PURE__*/React.createElement(ItemDetailPopup, { item: detailItem, onClose: () => setDetailItem(null) }),


      showGiftPreview && selectedGift && ReactDOM.createPortal(
        (() => {
          var GPM = getGiftPreviewModal();
          if (!GPM) {
            console.warn('GiftPreviewModal not yet available in window');
            return null;
          }
          return (/*#__PURE__*/
            React.createElement(GPM, {
              show: showGiftPreview,
              onClose: () => setShowGiftPreview(false),
              gift: selectedGift,
              lang: lang,
              onBuy: () => {},
              currency: userData?.currency || 0,
              isFromInventory: true,
              onSendFromInventory: onSendGift,
              friendsData: friendsData,
              currentUserData: currentUserData,
              user: user }
            ));

        })(),
        document.body
      )
      ));

  };

  // 👤 USER PROFILE MODAL - WITH GIFT LOG
  // Blocked User Item Component

  // ── Exports ──
  window.ShopModal = ShopModal;
  window.InventoryModal = InventoryModal;
  window.ReclaimSentPackets = ReclaimSentPackets;
})();
