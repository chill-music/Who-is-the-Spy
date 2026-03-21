/**
 * FamilyShop Component
 * Displays the family shop with items purchasable via Family Coins.
 */
var FamilyShop = ({ 
    family, 
    currentUID, 
    lang, 
    onNotification, 
    S 
}) => {
    if (!family) return null;

    const coins = family.familyCoins || 0;
    const purchases = family.shopPurchases || {};
    const RARITY_COLORS = { rare: '#60a5fa', epic: '#a78bfa', legendary: '#ffd700' };
    const FALLBACK_COINS_SYMBOL = '🏅';

    const handleBuy = async (item) => {
        if (window.FamilyService && window.FamilyService.buyShopItem) {
            await window.FamilyService.buyShopItem({
                currentUID,
                family,
                item,
                lang,
                onNotification
            });
        }
    };

    const shopItems = (typeof window.FAMILY_SHOP_ITEMS !== 'undefined') 
        ? window.FAMILY_SHOP_ITEMS 
        : [];
        
    const coinsSymbol = (typeof window.FAMILY_COINS_SYMBOL !== 'undefined')
        ? window.FAMILY_COINS_SYMBOL
        : FALLBACK_COINS_SYMBOL;

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Header with Balance */}
            <div style={{ ...S.card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0f0f23, #1a1a32)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        {lang === 'ar' ? 'رصيد العائلة' : 'Family Balance'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#a78bfa', fontStyle: 'italic' }}>
                        {coins} {coinsSymbol}
                    </div>
                </div>
                <div style={{ fontSize: '32px' }}>💰</div>
            </div>

            <div style={{...S.sectionTitle, marginTop: '8px'}}>🏅 {lang === 'ar' ? 'المتجر الحصري' : 'Exclusive Store'}</div>

            {/* Shop Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {shopItems.map(item => {
                    const key = `${currentUID}_${item.id}`;
                    const owned = purchases[key];
                    const canAfford = coins >= item.cost;
                    const rColor = RARITY_COLORS[item.rarity] || '#9ca3af';
                    
                    return (
                        <div key={item.id} style={{
                            ...S.card,
                            padding: '14px 12px',
                            border: `1px solid ${owned ? 'rgba(16,185,129,0.4)' : canAfford ? rColor + '44' : 'rgba(255,255,255,0.07)'}`,
                            background: owned ? 'rgba(16,185,129,0.06)' : canAfford ? `${rColor}08` : 'rgba(255,255,255,0.02)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s', position: 'relative',
                        }}>
                            {/* Rarity badge */}
                            <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '8px', fontWeight: 800, color: rColor, background: `${rColor}20`, padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>{item.rarity}</div>
                            <div style={{ fontSize: '32px', lineHeight: 1, filter: owned ? 'none' : `drop-shadow(0 0 6px ${rColor}88)` }}>{item.emoji}</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: owned ? '#10b981' : canAfford ? 'white' : '#6b7280', marginBottom: '2px' }}>
                                    {lang === 'ar' ? item.name_ar : item.name_en}
                                </div>
                                <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: 1.3, marginBottom: '4px' }}>
                                    {lang === 'ar' ? item.desc_ar : item.desc_en}
                                </div>
                            </div>
                            <button
                                onClick={() => !owned && handleBuy(item)}
                                disabled={owned || !canAfford}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 800, cursor: owned || !canAfford ? 'not-allowed' : 'pointer',
                                    background: owned ? 'rgba(16,185,129,0.2)' : canAfford ? `linear-gradient(135deg,${rColor},${rColor}cc)` : 'rgba(255,255,255,0.05)',
                                    color: owned ? '#10b981' : canAfford ? 'white' : '#4b5563',
                                    width: '100%',
                                }}>
                                {owned ? `✅ ${lang === 'ar' ? 'مشتري' : 'Owned'}` : `${item.cost}${coinsSymbol}`}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div style={{ height: '12px' }} />
        </div>
    );
};

window.FamilyShop = FamilyShop;

