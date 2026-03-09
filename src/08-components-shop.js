const ShopModal = ({ show, onClose, userData, lang, onPurchase, onEquip, onUnequip, onBuyVIP }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    if (!show) return null;

    const currency     = userData?.currency || 0;
    const inventory    = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped     = userData?.equipped  || {};
    const vipLevel     = getVIPLevel(userData);
    const vipXpInfo    = getVIPXPProgress(userData?.vip?.xp || 0);

    const isOwned  = (item) => inventory[item.type]?.includes(item.id);
    const isEquipped = (item) => {
        if (item.type === 'badges') {
            const eb = equipped.badges || [];
            return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id;
        }
        return equipped[item.type] === item.id;
    };

    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview?.startsWith('http')
            ? <img src={item.preview} alt="" style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover'}} />
            : <div style={{width:'32px',height:'32px',borderRadius:'50%',background:item.preview}} />;
        if (item.type === 'badges') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain'}} />
            : <span style={{fontSize:'22px'}}>{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'24px',height:'24px',objectFit:'contain'}} />
            : <span style={{fontSize:'18px'}}>{item.preview}</span>;
        if (item.type === 'gifts' || item.type === 'gifts_vip') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'26px',height:'26px',objectFit:'contain'}} />
            : <span style={{fontSize:'22px'}}>{item.emoji}</span>;
        if (item.type === 'profileEffects') return <span style={{fontSize:'22px'}}>{item.preview}</span>;
        return <span style={{fontSize:'18px'}}>🎨</span>;
    };

    // Tabs — تبويبات الشوب
    const tabs = [
        { id: 'vip',           label: '👑 VIP',   icon: '👑' },
        { id: 'gifts',         label: t.gifts,    icon: '🎁' },
        { id: 'frames',        label: t.frames,   icon: '🖼️' },
        { id: 'titles',        label: t.titles,   icon: '🏷️' },
        { id: 'badges',        label: t.badges,   icon: '🏅' },
        { id: 'profileEffects',label: lang === 'ar' ? 'تأثيرات' : 'Effects', icon: '✨' },
    ];
    if (hasVIPExclusiveGifts(userData)) {
        tabs.splice(2, 0, { id: 'gifts_vip', label: '🎁 VIP', icon: '💎' });
    }

    const getTabItems = (tab) => (SHOP_ITEMS[tab] || []).filter(item => !item.hidden);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content animate-pop"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '520px', width: '96vw', maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">🛒 {t.shop}</h2>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        {/* VIP XP mini */}
                        {vipLevel > 0 && (
                            <div style={{
                                display:'flex',alignItems:'center',gap:'4px',
                                background:'rgba(112,0,255,0.15)',
                                border:'1px solid rgba(112,0,255,0.3)',
                                borderRadius:'8px',padding:'2px 8px'
                            }}>
                                <span style={{fontSize:'10px',color:'#c4b5fd',fontWeight:700}}>
                                    VIP {vipLevel}
                                </span>
                                <span style={{fontSize:'9px',color:'#7c3aed'}}>
                                    {vipXpInfo.progress}%
                                </span>
                            </div>
                        )}
                        <span style={{color:'#fbbf24',fontWeight:700,fontSize:'12px'}}>🧠 {currency.toLocaleString()}</span>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display:'flex',overflowX:'auto',gap:'4px',padding:'8px 8px 0',
                    borderBottom:'1px solid rgba(255,255,255,0.06)',
                    scrollbarWidth:'none'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flexShrink:0, padding:'5px 10px', borderRadius:'8px 8px 0 0',
                                fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none',
                                background: activeTab === tab.id
                                    ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.04)',
                                color: activeTab === tab.id ? '#00f2ff' : '#6b7280',
                                borderBottom: activeTab === tab.id
                                    ? '2px solid #00f2ff' : '2px solid transparent',
                                transition:'all 0.15s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="modal-body" style={{padding:'10px', overflowY:'auto'}}>

                    {/* ════ VIP TAB ════ */}
                    {activeTab === 'vip' && (
                        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>

                            {/* Mini XP bar */}
                            <div style={{
                                background:'linear-gradient(135deg,rgba(112,0,255,0.12),rgba(15,15,26,0.97))',
                                border:'1px solid rgba(112,0,255,0.3)',
                                borderRadius:'12px', padding:'14px'
                            }}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                                    <span style={{fontWeight:800,fontSize:'14px',color:'#c4b5fd'}}>
                                        👑 {lang==='ar'?'مستوى VIP الحالي':'Current VIP Level'}
                                    </span>
                                    <span style={{
                                        background:'rgba(112,0,255,0.3)',color:'#c4b5fd',
                                        fontWeight:900,padding:'3px 10px',borderRadius:'6px',fontSize:'13px'
                                    }}>
                                        VIP {vipLevel}
                                    </span>
                                </div>
                                <div style={{height:'8px',borderRadius:'4px',background:'rgba(255,255,255,0.06)',overflow:'hidden',marginBottom:'5px'}}>
                                    <div style={{
                                        width:`${vipXpInfo.progress}%`,height:'100%',borderRadius:'4px',
                                        background:'linear-gradient(90deg,#7c3aed,#c4b5fd)',
                                        transition:'width 0.5s ease'
                                    }}/>
                                </div>
                                <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#6b7280'}}>
                                    <span>{(userData?.vip?.xp||0).toLocaleString()} XP</span>
                                    {vipLevel < 10 && <span>{lang==='ar'?'التالي':'Next'}: {VIP_XP_THRESHOLDS[vipLevel+1]?.toLocaleString()} XP</span>}
                                </div>
                            </div>

                            {/* VIP 1 Purchase Card */}
                            <div style={{
                                background:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(15,15,26,0.97))',
                                border:'1.5px solid rgba(239,68,68,0.35)',
                                borderRadius:'14px', padding:'16px',
                                position:'relative', overflow:'hidden'
                            }}>
                                {/* Glow top strip */}
                                <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#ef4444,transparent)'}}/>

                                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                                    <div style={{fontSize:'40px',lineHeight:1}}>👑</div>
                                    <div>
                                        <div style={{fontWeight:900,fontSize:'16px',color:'#ef4444'}}>
                                            {lang==='ar'?'احصل على VIP 1':'Get VIP 1'}
                                        </div>
                                        <div style={{fontSize:'11px',color:'#9ca3af',marginTop:'2px'}}>
                                            {lang==='ar'
                                                ? 'ابدأ رحلة VIP وارتقِ عبر إرسال الهدايا!'
                                                : 'Start your VIP journey — level up by sending gifts!'}
                                        </div>
                                    </div>
                                </div>

                                {/* Features list */}
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginBottom:'14px'}}>
                                    {[
                                        {icon:'⭐',ar:'اسم أحمر مميز',en:'Red VIP Name'},
                                        {icon:'⚡',ar:'مضاعف XP × 1.2',en:'1.2× XP Multiplier'},
                                        {icon:'🏅',ar:'بادج VIP حصري',en:'Exclusive VIP Badge'},
                                        {icon:'🔥',ar:'ارتقِ للمستوى 10',en:'Level up to VIP 10'},
                                    ].map((f,i) => (
                                        <div key={i} style={{
                                            display:'flex',alignItems:'center',gap:'5px',
                                            fontSize:'10px',color:'#d1d5db',
                                            background:'rgba(255,255,255,0.03)',
                                            borderRadius:'6px',padding:'5px 8px'
                                        }}>
                                            <span>{f.icon}</span>
                                            <span>{lang==='ar'?f.ar:f.en}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* XP gain info */}
                                <div style={{
                                    background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',
                                    borderRadius:'8px',padding:'8px 10px',marginBottom:'12px',
                                    fontSize:'10px',color:'#fca5a5',textAlign:'center'
                                }}>
                                    🎁 {lang==='ar'
                                        ? 'كل هدية ترسلها تمنحك VIP XP — كلما أرسلت أكثر كلما ارتفع مستواك!'
                                        : 'Every gift you send gives VIP XP — the more you give, the higher you level!'}
                                </div>

                                {/* Price + Buy button */}
                                {vipLevel >= 1 ? (
                                    <div style={{
                                        display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                                        padding:'10px',borderRadius:'10px',
                                        background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)'
                                    }}>
                                        <span style={{color:'#4ade80',fontWeight:800,fontSize:'14px'}}>
                                            ✅ {lang==='ar'?'لديك VIP بالفعل!':'You already have VIP!'}
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onBuyVIP}
                                        disabled={currency < 50000}
                                        style={{
                                            width:'100%',padding:'12px',borderRadius:'10px',
                                            background: currency >= 50000
                                                ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                                                : 'rgba(100,100,100,0.2)',
                                            border: currency >= 50000
                                                ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            color: currency >= 50000 ? '#fff' : '#6b7280',
                                            fontWeight:900, fontSize:'14px', cursor: currency >= 50000 ? 'pointer' : 'default',
                                            boxShadow: currency >= 50000 ? '0 0 20px rgba(239,68,68,0.4)' : 'none',
                                            transition:'all 0.2s'
                                        }}
                                    >
                                        {currency >= 50000
                                            ? `👑 ${lang==='ar'?'اشترِ VIP 1':'Buy VIP 1'} — 50,000 🧠`
                                            : `❌ ${lang==='ar'?'تحتاج':'Need'} 50,000 🧠 (${lang==='ar'?'لديك':'Have'}: ${currency.toLocaleString()})`
                                        }
                                    </button>
                                )}
                            </div>

                            {/* VIP Levels Table */}
                            <div style={{
                                background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.06)',
                                borderRadius:'12px',overflow:'hidden'
                            }}>
                                <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:'11px',fontWeight:700,color:'#9ca3af'}}>
                                    📊 {lang==='ar'?'جدول مستويات VIP':'VIP Level Table'}
                                </div>
                                {VIP_CONFIG.map(cfg => {
                                    const isCurrentLevel = vipLevel === cfg.level;
                                    const isPassed = vipLevel > cfg.level;
                                    return (
                                        <div key={cfg.level} style={{
                                            display:'flex',alignItems:'center',gap:'8px',
                                            padding:'7px 12px',
                                            borderBottom:'1px solid rgba(255,255,255,0.04)',
                                            background: isCurrentLevel ? `${cfg.nameColor}11` : 'transparent',
                                        }}>
                                            <span style={{
                                                minWidth:'36px',fontWeight:900,fontSize:'11px',
                                                color: isCurrentLevel ? cfg.nameColor : isPassed ? '#4ade80' : '#6b7280'
                                            }}>
                                                {isPassed ? '✅' : isCurrentLevel ? '▶' : ''} VIP {cfg.level}
                                            </span>
                                            <div style={{flex:1,height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
                                                <div style={{
                                                    width: isPassed ? '100%' : isCurrentLevel ? `${vipXpInfo.progress}%` : '0%',
                                                    height:'100%',background:cfg.nameColor,transition:'width 0.5s'
                                                }}/>
                                            </div>
                                            <span style={{fontSize:'9px',color:'#6b7280',minWidth:'60px',textAlign:'right'}}>
                                                {VIP_XP_THRESHOLDS[cfg.level].toLocaleString()} XP
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ════ ITEMS GRID ════ */}
                    {activeTab !== 'vip' && (
                        <div style={{
                            display:'grid',
                            gridTemplateColumns: (activeTab === 'gifts' || activeTab === 'gifts_vip')
                                ? 'repeat(auto-fill, minmax(80px, 1fr))'
                                : 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap:'8px'
                        }}>
                            {getTabItems(activeTab)?.map(item => {
                                const owned       = isOwned(item);
                                const equippedItem = isEquipped(item);
                                const isEventItem = item.isEvent;
                                const isLimited   = item.limitedTime;
                                const isEventOnly = item.eventOnly;

                                if (activeTab === 'gifts' || activeTab === 'gifts_vip') {
                                    const rKey   = getGiftRarity(item.cost);
                                    const rarity = RARITY_CONFIG[rKey];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => { if (!isEventOnly) { setSelectedItem(item); setShowPreview(true); } }}
                                            style={{
                                                position:'relative', cursor: isEventOnly ? 'default' : 'pointer',
                                                border:`1.5px solid ${rarity.border}`,
                                                background: rarity.bg,
                                                boxShadow: rarity.glow && rKey==='Mythic'
                                                    ? '0 0 14px rgba(255,0,85,0.7)'
                                                    : rarity.glow ? `0 0 8px ${rarity.color}55` : 'none',
                                                borderRadius:'10px', padding:'8px 4px',
                                                display:'flex',flexDirection:'column',
                                                alignItems:'center',justifyContent:'center',
                                                minHeight:'80px',
                                                opacity: isEventOnly ? 0.65 : 1,
                                                animation: rKey==='Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none',
                                                transition:'transform 0.15s',
                                            }}
                                            onMouseEnter={e => { if (!isEventOnly) e.currentTarget.style.transform='scale(1.04)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
                                        >
                                            <span style={{position:'absolute',top:'2px',left:'2px',fontSize:'8px'}}>{rarity.icon}</span>
                                            {isEventItem && <span className="shop-event-tag">⚡</span>}
                                            {isLimited   && <span className="shop-limited-tag">⏳</span>}
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain',marginBottom:'3px'}}/>
                                                : <span style={{fontSize:'24px',lineHeight:1,marginBottom:'3px'}}>{item.emoji}</span>
                                            }
                                            <div style={{fontSize:'9px',fontWeight:700,color:'#fbbf24'}}>{item.cost.toLocaleString()}🧠</div>
                                            <div style={{fontSize:'8px',color:'#9ca3af'}}>+{formatCharisma(item.charisma)}⭐</div>
                                            {/* VIP XP gain */}
                                            <div style={{fontSize:'7px',color:'#7c3aed',fontWeight:700,marginTop:'1px'}}>
                                                +{getGiftVIPXP(item)} VXP
                                            </div>
                                            {isEventOnly && (
                                                <div style={{
                                                    position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',
                                                    borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'
                                                }}>
                                                    <span style={{fontSize:'18px'}}>🔒</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Non-gift items
                                const rKey2   = getItemRarity(item);
                                const rarity2 = RARITY_CONFIG[rKey2];
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { if (!item.eventOnly) { setSelectedItem(item); setShowPreview(true); } }}
                                        style={{
                                            position:'relative', cursor: item.eventOnly ? 'default' : 'pointer',
                                            border:`1.5px solid ${equippedItem ? '#00f2ff' : rarity2.border}`,
                                            background: equippedItem ? 'rgba(0,242,255,0.08)' : rarity2.bg,
                                            boxShadow: equippedItem ? '0 0 10px rgba(0,242,255,0.3)' : rarity2.glow ? `0 0 8px ${rarity2.color}44` : 'none',
                                            borderRadius:'10px', padding:'8px 6px',
                                            display:'flex',flexDirection:'column',
                                            alignItems:'center', gap:'4px',
                                            opacity: item.eventOnly ? 0.65 : 1,
                                            transition:'transform 0.15s',
                                        }}
                                        onMouseEnter={e => { if (!item.eventOnly) e.currentTarget.style.transform='scale(1.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
                                    >
                                        <span style={{position:'absolute',top:'2px',left:'2px',fontSize:'8px'}}>{rarity2.icon}</span>
                                        {item.isEvent    && <span className="shop-event-tag">⚡</span>}
                                        {item.limitedTime && <span className="shop-limited-tag">⏳</span>}
                                        <div style={{marginTop:'4px'}}>{renderPreview(item)}</div>
                                        <div style={{fontSize:'9px',fontWeight:700,color:equippedItem?'#00f2ff':'#d1d5db',textAlign:'center',lineHeight:1.2}}>
                                            {lang==='ar' ? item.name_ar : item.name_en}
                                        </div>
                                        {item.eventOnly ? (
                                            <div style={{fontSize:'8px',color:'#7c3aed',fontWeight:700}}>🔒 Event</div>
                                        ) : owned ? (
                                            equippedItem
                                                ? <button onClick={e=>{e.stopPropagation();onUnequip(item.type,item.id);}} style={{width:'100%',fontSize:'8px',padding:'3px',borderRadius:'4px',background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',color:'#f87171',cursor:'pointer'}}>{t.unequip}</button>
                                                : <button onClick={e=>{e.stopPropagation();onEquip(item);}} style={{width:'100%',fontSize:'8px',padding:'3px',borderRadius:'4px',background:'rgba(74,222,128,0.2)',border:'1px solid rgba(74,222,128,0.4)',color:'#4ade80',cursor:'pointer'}}>{t.equip}</button>
                                        ) : (
                                            <div style={{fontSize:'9px',color:'#fbbf24',fontWeight:700}}>{item.cost.toLocaleString()}🧠</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Gift Preview Modal */}
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
