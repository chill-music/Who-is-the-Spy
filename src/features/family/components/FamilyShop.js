/**
 * FamilyShop Component
 * Displays the family shop with items purchasable via Family Coins.
 * Supports: badge | title | frame | profileEffect (time-limited, re-purchasable)
 */
var FamilyShop = ({
    family,
    currentUID,
    currentUserData,
    lang,
    onNotification,
    S
}) => {
    if (!family) return null;

    var [activeType, setActiveType] = React.useState('all');
    var [buying, setBuying] = React.useState(null);

    var coins = family.familyCoins || 0;
    var purchases = family.shopPurchases || {};
    var userInventory = currentUserData?.inventory || {};

    var RARITY_COLORS = {
        uncommon:  '#34d399',
        rare:      '#60a5fa',
        epic:      '#a78bfa',
        legendary: '#ffd700',
    };
    var coinsSymbol = (typeof window.FAMILY_COINS_SYMBOL !== 'undefined')
        ? window.FAMILY_COINS_SYMBOL
        : '🏅';

    // ── Ownership logic ───────────────────────────────────────────────────────
    var isOwned = (item) => {
        var key = `${currentUID}_${item.id}`;
        if (!purchases[key]) return false;
        // Time-limited items: check if still active in inventory.expiry
        if (item.durationDays) {
            var expiry = userInventory?.expiry?.[item.id];
            if (!expiry) return false;           // never granted or already wiped
            return Date.now() < expiry;          // still active
        }
        return true; // permanent
    };

    var getExpiryLabel = (item) => {
        if (!item.durationDays) return null;
        var expiry = userInventory?.expiry?.[item.id];
        if (!expiry || Date.now() >= expiry) return null;
        var daysLeft = Math.ceil((expiry - Date.now()) / 86400000);
        return lang === 'ar' ? `${daysLeft}د متبقية` : `${daysLeft}d left`;
    };

    var handleBuy = async (item) => {
        if (buying) return;
        setBuying(item.id);
        try {
            if (window.FamilyService?.buyShopItem) {
                await window.FamilyService.buyShopItem({
                    currentUID,
                    family,
                    item,
                    lang,
                    onNotification,
                });
            }
        } finally {
            setBuying(null);
        }
    };

    // ── Type tabs ─────────────────────────────────────────────────────────────
    var shopItems = (typeof window.FAMILY_SHOP_ITEMS !== 'undefined')
        ? window.FAMILY_SHOP_ITEMS
        : [];

    var TABS = [
        { key: 'all',           label_en: 'All',     label_ar: 'الكل',    icon: '🏪' },
        { key: 'badge',         label_en: 'Badges',  label_ar: 'شارات',   icon: '🎖️' },
        { key: 'title',         label_en: 'Titles',  label_ar: 'ألقاب',   icon: '🏷️' },
        { key: 'frame',         label_en: 'Frames',  label_ar: 'إطارات',  icon: '🖼️' },
        { key: 'profileEffect', label_en: 'Effects', label_ar: 'تأثيرات', icon: '✨' },
    ];

    var filtered = activeType === 'all'
        ? shopItems
        : shopItems.filter(i => i.type === activeType);

    var localS = S || {
        card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' },
        sectionTitle: { fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '10px', borderLeft: '3px solid #00f2ff', marginBottom: '12px' },
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Balance Header */}
            <div style={{ ...localS.card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(15,15,35,0.9),rgba(26,26,50,0.9))', border: '1px solid rgba(167,139,250,0.25)' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        {lang === 'ar' ? 'رصيد العائلة' : 'Family Balance'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#a78bfa', fontStyle: 'italic' }}>
                        {coins} {coinsSymbol}
                    </div>
                </div>
                <div style={{ fontSize: '36px' }}>💰</div>
            </div>

            {/* Type Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {TABS.map(tab => {
                    var active = activeType === tab.key;
                    var count = tab.key === 'all' ? shopItems.length : shopItems.filter(i => i.type === tab.key).length;
                    return (
                        <button key={tab.key} onClick={() => setActiveType(tab.key)} style={{
                            padding: '6px 12px', borderRadius: '20px', border: active ? '1.5px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                            background: active ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                            color: active ? '#a78bfa' : '#9ca3af', fontSize: '10px', fontWeight: active ? 800 : 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        }}>
                            {tab.icon} {lang === 'ar' ? tab.label_ar : tab.label_en}
                            <span style={{ background: active ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 5px', fontSize: '9px' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ ...localS.sectionTitle, marginTop: '4px' }}>
                🏅 {lang === 'ar' ? 'المتجر الحصري' : 'Exclusive Store'}
            </div>

            {/* Shop Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {filtered.map(item => {
                    var owned = isOwned(item);
                    var expiryLabel = getExpiryLabel(item);
                    // For timed items that were purchased but expired, allow re-buy
                    var purchasedButExpired = !owned && purchases[`${currentUID}_${item.id}`] && item.durationDays;
                    var canAfford = coins >= item.cost;
                    var rColor = RARITY_COLORS[item.rarity] || '#9ca3af';
                    var isBuying = buying === item.id;

                    // For timed items: button is active even if previously purchased (allows renewal)
                    var canBuy = !owned && canAfford && !isBuying;

                    return (
                        <div key={item.id} style={{
                            ...localS.card,
                            padding: '14px 12px',
                            border: `1px solid ${owned ? 'rgba(16,185,129,0.4)' : canAfford ? rColor + '44' : 'rgba(255,255,255,0.07)'}`,
                            background: owned ? 'rgba(16,185,129,0.06)' : canAfford ? `${rColor}08` : 'rgba(255,255,255,0.02)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s', position: 'relative',
                        }}>
                            {/* Rarity badge */}
                            <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '8px', fontWeight: 800, color: rColor, background: `${rColor}20`, padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                {item.rarity}
                            </div>

                            {/* Duration badge for timed items */}
                            {item.durationDays && (
                                <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '8px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                                    {item.durationDays}{lang === 'ar' ? 'ي' : 'd'}
                                </div>
                            )}

                            <div style={{ fontSize: '32px', lineHeight: 1, marginTop: item.durationDays ? '8px' : '0', filter: owned ? 'none' : `drop-shadow(0 0 6px ${rColor}88)` }}>
                                {item.emoji}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: owned ? '#10b981' : canAfford ? 'white' : '#6b7280', marginBottom: '2px' }}>
                                    {lang === 'ar' ? item.name_ar : item.name_en}
                                </div>
                                <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: 1.3, marginBottom: '4px' }}>
                                    {lang === 'ar' ? item.desc_ar : item.desc_en}
                                </div>
                                {/* Expiry countdown */}
                                {expiryLabel && (
                                    <div style={{ fontSize: '9px', color: '#34d399', fontWeight: 700 }}>
                                        ⏰ {expiryLabel}
                                    </div>
                                )}
                                {/* Expired — show renew hint */}
                                {purchasedButExpired && (
                                    <div style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 700 }}>
                                        {lang === 'ar' ? '🔄 تجديد' : '🔄 Renew'}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => canBuy && handleBuy(item)}
                                disabled={!canBuy}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 800,
                                    cursor: canBuy ? 'pointer' : 'not-allowed',
                                    background: owned
                                        ? 'rgba(16,185,129,0.2)'
                                        : canAfford
                                            ? `linear-gradient(135deg,${rColor},${rColor}cc)`
                                            : 'rgba(255,255,255,0.05)',
                                    color: owned ? '#10b981' : canAfford ? 'white' : '#4b5563',
                                    width: '100%',
                                    opacity: isBuying ? 0.6 : 1,
                                }}
                            >
                                {isBuying
                                    ? '...'
                                    : owned
                                        ? `✅ ${lang === 'ar' ? 'مفعّل' : 'Active'}`
                                        : purchasedButExpired
                                            ? `🔄 ${item.cost}${coinsSymbol}`
                                            : `${item.cost}${coinsSymbol}`
                                }
                            </button>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</div>
                    <div style={{ fontSize: '12px' }}>{lang === 'ar' ? 'لا عناصر في هذه الفئة' : 'No items in this category'}</div>
                </div>
            )}

            <div style={{ height: '12px' }} />
        </div>
    );
};

window.FamilyShop = FamilyShop;
