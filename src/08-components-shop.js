const ShopModal = ({ show, onClose, userData, lang, onPurchase, onEquip, onUnequip }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    if (!show) return null;

    const currency = userData?.currency || 0;
    const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || {};
    const vipLevel = getVIPLevel(userData);

    const isOwned = (item) => inventory[item.type]?.includes(item.id);
    const isEquipped = (item) => { if (item.type === 'badges') { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id; } return equipped[item.type] === item.id; };
    const getEquippedBadgeCount = () => { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.length : (equipped.badges ? 1 : 0); };

    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview.startsWith('http') ? <img src={item.preview} alt={item.name_en} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full" style={{ background: item.preview }}></div>;
        if (item.type === 'badges') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-6 h-6 object-contain" /> : <span className="text-xl">{item.preview}</span>;
        if (item.type === 'gifts' || item.type === 'gifts_vip') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.emoji}</span>;
        if (item.type === 'profileEffects') return <span style={{fontSize:'26px',lineHeight:1}}>{item.preview}</span>;
        return <span className="text-xl">🎨</span>;
    };

    const tabs = ['frames', 'titles', 'badges', 'profileEffects', 'gifts'];
    // Add VIP gifts tab if user is VIP 2+
    if (hasVIPExclusiveGifts(userData)) tabs.push('gifts_vip');

    // Filter: exclude hidden items
    const getTabItems = (tab) => (SHOP_ITEMS[tab] || []).filter(item => !item.hidden);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '85vh' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.shop}</h2>
                    <div className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-xs">🧠 {currency.toLocaleString()}</span><ModalCloseBtn onClose={onClose} /></div>
                </div>
                <div className="modal-body" style={{ padding: '8px' }}>
                    <div className="shop-tabs-container" style={{ margin: '4px', marginBottom: 0 }}>
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>
                                {tab === 'gifts_vip' ? '👑 VIP' : t[tab]}
                            </button>
                        ))}
                    </div>
                    <div className="p-2">
                        <div className="inventory-grid">
                            {getTabItems(activeTab)?.map(item => {
                                const owned = isOwned(item);
                                const equippedItem = isEquipped(item);
                                const isEventItem = item.isEvent;
                                const isLimitedItem = item.limitedTime;
                                const isEventOnly = item.eventOnly;

                                if (activeTab === 'gifts' || activeTab === 'gifts_vip') {
                                    const rKey = getGiftRarity(item.cost);
                                    const rarity = RARITY_CONFIG[rKey];
                                    return (
                                        <div key={item.id} className="gift-card" onClick={() => { if (!isEventOnly) { setSelectedItem(item); setShowPreview(true); } }}
                                            style={{ border: `1.5px solid ${rarity.border}`, background: rarity.bg, boxShadow: rarity.glow && rKey === 'Mythic' ? `0 0 14px rgba(255,0,85,0.7), 0 0 30px rgba(255,0,85,0.3)` : rarity.glow ? `0 0 8px ${rarity.color}55` : 'none', position:'relative', animation: rKey==='Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none', opacity: isEventOnly ? 0.7 : 1 }}
                                        >
                                            <span className="gift-rarity-badge" style={{ background: rarity.color }}>{rarity.icon}</span>
                                            {isEventItem && <span className="shop-event-tag">⚡ EVENT</span>}
                                            {isLimitedItem && <span className="shop-limited-tag">⏳ LIMITED</span>}
                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="gift-icon-img" /> : <div className="text-xl mb-1">{item.emoji}</div>}
                                            <div className="gift-details">
                                                <div className="text-[9px] font-bold mb-0.5" style={{color: rarity.color}}>{lang === 'ar' ? rarity.name_ar : rarity.name_en}</div>
                                                <div className="text-[10px] font-bold text-yellow-400">{item.cost}🧠</div>
                                                <div className="gift-charisma">+{formatCharisma(item.charisma)} ⭐</div>
                                            </div>
                                            {isEventOnly && (
                                                <div className="shop-event-only-overlay">
                                                    <span className="shop-event-only-lock">🔒</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                const rKey2 = getItemRarity(item);
                                const rarity2 = RARITY_CONFIG[rKey2];
                                return (
                                    <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}
                                        style={{ border: `1.5px solid ${rarity2.border}`, background: rarity2.bg, boxShadow: rarity2.glow ? `0 0 8px ${rarity2.color}44` : 'none', position:'relative', opacity: item.eventOnly ? 0.7 : 1 }}
                                        onClick={() => { if (!item.eventOnly) { setSelectedItem(item); setShowPreview(true); } }}
                                    >
                                        <span className="gift-rarity-badge" style={{ background: rarity2.color }}>{rarity2.icon}</span>
                                        {item.isEvent && <span className="shop-event-tag">⚡ EVENT</span>}
                                        {item.limitedTime && <span className="shop-limited-tag">⏳ LIMITED</span>}
                                        <div className="inventory-item-preview">{renderPreview(item)}</div>
                                        <div className="inventory-item-name" style={{fontSize:'9px'}}>{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                        <div style={{fontSize:'8px', color: rarity2.color, fontWeight:700, marginBottom:'2px'}}>{lang==='ar'?rarity2.name_ar:rarity2.name_en}</div>
                                        {item.eventOnly ? (
                                            <div style={{fontSize:'8px', color:'#7c3aed', fontWeight:700}}>🔒 Event Only</div>
                                        ) : owned ? (
                                            equippedItem ? <button onClick={(e) => { e.stopPropagation(); onUnequip(item.type, item.id); }} className="btn-unequip w-full">{t.unequip}</button>
                                            : <button onClick={(e) => { e.stopPropagation(); onEquip(item); }} className="btn-success w-full text-[10px] py-0.5 rounded">{t.equip}</button>
                                        ) : (<div className="text-yellow-400 font-bold text-xs">{item.cost}🧠</div>)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {showPreview && selectedItem && (
                    <GiftPreviewModal
                        show={showPreview}
                        onClose={() => setShowPreview(false)}
                        gift={selectedItem}
                        lang={lang}
                        onBuy={(item, target) => {
                            if (currency >= item.cost) {
                                onPurchase(item, target);
                                setShowPreview(false);
                            }
                        }}
                        currency={currency}
                        friendsData={[]}
                        user={{ uid: userData?.uid }}
                        currentUserData={userData}
                    />
                )}
            </div>
        </div>
    );
};

// 📦 INVENTORY MODAL
const InventoryModal = ({ show, onClose, userData, lang, onEquip, onUnequip, onSendGift, friendsData, isLoggedIn, currentUserData, user }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedGift, setSelectedGift] = useState(null);
    const [showGiftPreview, setShowGiftPreview] = useState(false);

    if (!show) return null;

    const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || {};
    const getOwnedItems = (type) => { const ownedIds = inventory[type] || []; return SHOP_ITEMS[type]?.filter(item => ownedIds.includes(item.id)) || []; };
    const isEquipped = (item) => { if (item.type === 'badges') { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id; } return equipped[item.type] === item.id; };
    const getEquippedBadgeCount = () => { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.length : (equipped.badges ? 1 : 0); };

    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview.startsWith('http') ? <img src={item.preview} alt={item.name_en} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full" style={{ background: item.preview }}></div>;
        if (item.type === 'badges') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-6 h-6 object-contain" /> : <span className="text-xl">{item.preview}</span>;
        if (item.type === 'gifts') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.emoji}</span>;
        if (item.type === 'profileEffects') return <span style={{fontSize:'26px',lineHeight:1}}>{item.preview}</span>;
        return <span className="text-xl">🎨</span>;
    };

    const tabs = ['frames', 'titles', 'badges', 'profileEffects', 'gifts'];
    const ownedItems = getOwnedItems(activeTab);

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '85vh' }}>
                    <div className="modal-header">
                        <h2 className="modal-title">{t.myInventory}</h2>
                        {activeTab === 'badges' && <span className="text-[10px] text-gray-400">{getEquippedBadgeCount()}/{MAX_BADGES}</span>}
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    <div className="modal-body" style={{ padding: '8px' }}>
                        <div className="shop-tabs-container" style={{ margin: '4px', marginBottom: 0 }}>{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>{t[tab]} ({getOwnedItems(tab).length})</button>)}</div>
                        <div className="p-2">
                            {ownedItems.length === 0 ? <div className="text-center py-6 text-gray-400"><div className="text-3xl mb-2">📦</div><p>{t.owned}: 0</p></div> : (
                                <div className="inventory-grid">
                                    {ownedItems.map(item => {
                                        const equippedItem = isEquipped(item);
                                        if (activeTab === 'gifts') return (
                                            <div key={item.id} className="inventory-item">
                                                <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedGift(item);
                                                        setShowGiftPreview(true);
                                                    }}
                                                    className="btn-gold w-full text-[10px] py-0.5 rounded mt-1"
                                                >
                                                    {t.sendGiftToFriend}
                                                </button>
                                            </div>
                                        );
                                        return (
                                            <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}>
                                                <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                {equippedItem ?
                                                    <button onClick={() => onUnequip(item.type, item.id)} className="btn-unequip w-full">{t.unequip}</button> :
                                                    <button
                                                        onClick={() => onEquip(item)}
                                                        disabled={activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES}
                                                        className={`btn-success w-full text-[10px] py-0.5 rounded ${(activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {t.equip}
                                                    </button>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showGiftPreview && selectedGift && (
                <GiftPreviewModal
                    show={showGiftPreview}
                    onClose={() => setShowGiftPreview(false)}
                    gift={selectedGift}
                    lang={lang}
                    onBuy={() => {}}
                    currency={userData?.currency || 0}
                    isFromInventory={true}
                    onSendFromInventory={onSendGift}
                    friendsData={friendsData}
                    currentUserData={currentUserData}
                    user={user}
                />
            )}
        </>
    );
};

// 👤 USER PROFILE MODAL - WITH GIFT LOG
// Blocked User Item Component
