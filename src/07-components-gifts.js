var mojiPicker = ({ show, onClose, onSelect, lang, inline = false }) => {
    const t = TRANSLATIONS[lang];
    const [activeCategory, setActiveCategory] = useState('smiles');

    if (!show) return null;

    const categories = [
        { id: 'smiles',   icon: '�', label_ar: '�ج��',   label_en: 'Faces' },
        { id: 'gestures', icon: '�', label_ar: 'إ��اءات', label_en: 'Gestures' },
        { id: 'hearts',   icon: '❤️', label_ar: '���ب',   label_en: 'Hearts' },
        { id: 'objects',  icon: '�', label_ar: 'أش�اء',   label_en: 'Objects' },
        { id: 'nature',   icon: '�', label_ar: 'طب�عة',  label_en: 'Nature' },
    ];

    const wrapperStyle = inline ? {} : undefined;

    return (
        <div className={inline ? '' : 'emoji-picker-modal animate-slide-up'} style={wrapperStyle}>
            {!inline && (
                <div className="emoji-picker-header">
                    <span className="emoji-picker-title">{t.selectEmojis || 'Emoji'}</span>
                    <button className="emoji-picker-close" onClick={onClose}>�</button>
                </div>
            )}
            <div className="emoji-categories" style={{marginBottom:'6px'}}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`emoji-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        title={lang==='ar'?cat.label_ar:cat.label_en}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>
            <div className="emoji-picker-grid">
                {(EMOJI_CATEGORIES[activeCategory] || []).map((emoji, i) => (
                    <button
                        key={i}
                        className="emoji-picker-item"
                        onClick={() => { onSelect(emoji); }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="emoji-categories">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`emoji-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        title={cat.label}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

// �� GIFT PREVIEW MODAL - IMPROVED
// Shows details for both sender and receiver
var GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false, isFromInventory = false, onSendFromInventory, friendsData, sendToSelf = false, currentUserData, user, directTarget = null }) => {
    const t = TRANSLATIONS[lang];
    const [showFriendSelect, setShowFriendSelect] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [sendMode, setSendMode] = useState(directTarget ? 'direct' : 'self');
    const [previewBonus, setPreviewBonus] = useState(0);
    // � Quantity system
    const [selectedQty, setSelectedQty] = useState(1);
    const isGiftItem = gift?.type === 'gifts' || gift?.type === 'gifts_vip';

    useEffect(() => {
        if (show && gift) {
            setSelectedFriend(directTarget || null);
            setSendMode(directTarget ? 'direct' : 'self');
            setShowFriendSelect(false);
            setSelectedQty(1);
            if (gift.minBonus && gift.maxBonus) {
                setPreviewBonus(generateRandomBonus(gift.minBonus, gift.maxBonus));
            }
        }
    }, [show, gift, directTarget]);

    if (!show || !gift) return null;

    // �� Quantity buy handler ��
    const handleBuyWithQty = (qty) => {
        if (!onBuy) return;
        const target = directTarget
            ? directTarget
            : sendMode === 'self'
            ? { uid: 'self', displayName: currentUserData?.displayName || 'Me' }
            : selectedFriend;
        if (!target) return;
        onBuy(gift, target, qty || selectedQty);
    };

    const handleBuy = () => handleBuyWithQty(selectedQty);

    // �� Profile Effect special view ��
    if (gift.type === 'profileEffects') {
        const rKey = gift.rarity || 'Common';
        const rarity = RARITY_CONFIG[rKey] || RARITY_CONFIG.Common;
        const owned = currency >= gift.cost;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{maxWidth:'340px'}}>
                    <div className="modal-header">
                        <h2 className="modal-title">{lang === 'ar' ? gift.name_ar : gift.name_en}</h2>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    <div className="modal-body text-center py-3">
                        {/* Effect Preview Box */}
                        {(() => {
                            // � Support: particles as URL, imageUrl, or emoji preview
                            const effectSrc = (typeof gift.particles === 'string' && gift.particles.startsWith('http'))
                                ? gift.particles
                                : (gift.imageUrl && gift.imageUrl.trim() !== '' ? gift.imageUrl : null);
                            return (
                                <div style={{
                                    width:'100%', height:'160px', borderRadius:'12px', marginBottom:'12px',
                                    background: rarity.bg, border: `2px solid ${rarity.border}`,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    position:'relative', overflow:'hidden',
                                    boxShadow: rarity.glow ? `0 0 20px ${rarity.color}55` : 'none'
                                }}>
                                    {effectSrc ? (
                                        <img
                                            src={effectSrc}
                                            alt={gift.name_en}
                                            style={{
                                                width:'100%', height:'100%',
                                                objectFit:'contain', borderRadius:'10px',
                                            }}
                                        />
                                    ) : (
                                        <span style={{fontSize:'56px'}}>{gift.preview}</span>
                                    )}
                                    {gift.hasGlow && (
                                        <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at center, rgba(0,242,255,0.25), transparent 70%)',pointerEvents:'none'}} />
                                    )}
                                    {/* Rarity badge */}
                                    <div style={{position:'absolute',top:'8px',right:'8px',background:rarity.color,color:'#000',fontSize:'9px',fontWeight:800,padding:'2px 7px',borderRadius:'8px'}}>
                                        {rarity.icon} {lang==='ar'?rarity.name_ar:rarity.name_en}
                                    </div>
                                </div>
                            );
                        })()}
                        <h3 style={{fontSize:'15px',fontWeight:800,color:'white',marginBottom:'6px'}}>{lang==='ar'?gift.name_ar:gift.name_en}</h3>
                        {/* Details */}
                        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px',textAlign:'right',direction:'ltr'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                <span>� {lang==='ar'?'ا�سعر':'Price'}</span>
                                <span style={{color:'#facc15',fontWeight:700}}>{gift.cost} �</span>
                            </div>
                            {Array.isArray(gift.particles) && gift.particles.length > 0 && (
                                <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                    <span>� {lang==='ar'?'ا�جز�ئات':'Particles'}</span>
                                    <span style={{color:'white',fontWeight:700}}>{gift.particles.map(p=>`${p.emoji}�${p.count}`).join(' ')}</span>
                                </div>
                            )}
                            {gift.hasGlow && (
                                <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                    <span>� {lang==='ar'?'ت��ج خاص':'Special Glow'}</span>
                                    <span style={{color:'#00f2ff',fontWeight:700}}>� {lang==='ar'?'�ع�':'Yes'}</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer py-2">
                            <div className="flex gap-2">
                                <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{lang==='ar'?'إغ�ا�':'Close'}</button>
                                <button
                                    onClick={() => onBuy && onBuy(gift, null)}
                                    disabled={!owned}
                                    style={{flex:1,padding:'8px',borderRadius:'8px',background: owned ? rarity.color : 'rgba(100,100,100,0.2)',color: owned ? '#000' : '#6b7280',border:'none',fontWeight:800,fontSize:'12px',cursor: owned ? 'pointer' : 'not-allowed'}}
                                >
                                    {owned ? `${lang==='ar'?'شراء':'Buy'} (${gift.cost}�)` : (lang==='ar'?'إ�ت� غ�ر �افٍ':'Not enough Intel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderGiftIcon = () => {
        if (gift.type === 'frames') { return gift.preview.startsWith('http') ? <img src={gift.preview} alt={gift.name_en} className="w-14 h-14 rounded-full object-cover mx-auto" /> : <div className="w-14 h-14 rounded-full mx-auto" style={{ background: gift.preview }}></div>; }
        if (gift.type === 'badges') { return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="w-12 h-12 object-contain mx-auto" /> : <div className="text-4xl mb-2">{gift.preview}</div>; }
        if (gift.type === 'titles') { return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="h-8 object-contain mx-auto" /> : <div className="text-3xl mb-2">{gift.preview}</div>; }
        return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="w-12 h-12 object-contain mx-auto" /> : <div className="text-4xl mb-2">{gift.emoji}</div>;
    };

    const handleSendFromInventory = () => {
        if (!onSendFromInventory) return;
        const target = directTarget
            ? directTarget
            : sendMode === 'self'
            ? { uid: user?.uid || 'self', displayName: currentUserData?.displayName || 'Me', photoURL: currentUserData?.photoURL }
            : selectedFriend;
        if (!target) return;
        onSendFromInventory(gift, target);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                <div className="modal-header"><h2 className="modal-title">{isGiftItem ? t.giftPreview : (lang === 'ar' ? gift.name_ar : gift.name_en)}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center py-3">
                    {renderGiftIcon()}
                    <h3 className="text-base font-bold text-white mb-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</h3>
                    {isGiftItem && (gift.desc_ar || gift.desc_en) && <p className="text-[10px] text-gray-400 mb-2">{lang === 'ar' ? gift.desc_ar : gift.desc_en}</p>}

                    {isGiftItem && (
                        <div className="gift-preview-details">
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">{t.giftCharisma}</div>
                                <div className="gift-preview-stat-value charisma">+{formatCharisma(gift.charisma)}</div>
                            </div>
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">{t.luckyBonus}</div>
                                <div className="gift-preview-stat-value bonus" style={{color:'#facc15', fontStyle:'italic'}}>
                                    �� {lang === 'ar' ? '�فاجأة!' : 'Surprise!'}
                                </div>
                            </div>
                            {/* VIP Required */}
                            {gift.vipMinLevel > 0 && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">� {lang === 'ar' ? '�تط�ب' : 'Requires'}</div>
                                    <div className="gift-preview-stat-value" style={{color: VIP_CONFIG[gift.vipMinLevel - 1]?.nameColor || '#ef4444', fontWeight:800}}>
                                        VIP {gift.vipMinLevel}+
                                    </div>
                                </div>
                            )}
                            {/* Event */}
                            {gift.isEvent && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">� {lang === 'ar' ? '��ع' : 'Type'}</div>
                                    <div className="gift-preview-stat-value" style={{color:'#a78bfa', fontWeight:800}}>
                                        {lang === 'ar' ? '� إ�ف�ت' : '� Event'}
                                    </div>
                                </div>
                            )}
                            {/* Limited Time */}
                            {gift.limitedTime && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">⏳ {lang === 'ar' ? '�تاح' : 'Available'}</div>
                                    <div className="gift-preview-stat-value" style={{color:'#f97316', fontWeight:800}}>
                                        {lang === 'ar' ? '���ت �حد�د' : 'Limited Time'}
                                    </div>
                                </div>
                            )}
                            {/* � FIX 4: Duration days info */}
                            {gift.durationDays && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">⏳ {lang === 'ar' ? 'ت�ت�� بعد' : 'Expires in'}</div>
                                    <div className="gift-preview-stat-value" style={{color:'#f59e0b', fontWeight:800}}>
                                        {gift.durationDays} {lang === 'ar' ? '���' : 'days'}
                                    </div>
                                </div>
                            )}
                            {/* Price */}
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">� {lang === 'ar' ? 'ا�سعر' : 'Price'}</div>
                                <div className="gift-preview-stat-value" style={{color:'#fbbf24', fontWeight:800}}>
                                    {gift.cost.toLocaleString()} �
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show target info if direct target */}
                    {directTarget && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/10 rounded-lg">
                            <AvatarWithFrame photoURL={directTarget.photoURL} equipped={directTarget.equipped} size="sm" />
                            <div className="text-left">
                                <div className="font-bold text-xs">{lang === 'ar' ? 'إرسا� إ��' : 'Sending to'}</div>
                                <div className="text-[10px] text-primary">{directTarget.displayName}</div>
                            </div>
                        </div>
                    )}

                    {/* Only show self/others toggle if no direct target */}
                    {isGiftItem && !directTarget && (
                        <div className="flex gap-1 mb-2">
                            <button
                                onClick={() => setSendMode('self')}
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${sendMode === 'self' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}
                            >
                                �� {t.sendToSelf}
                            </button>
                            <button
                                onClick={() => { setSendMode('others'); setShowFriendSelect(true); }}
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${sendMode === 'others' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}
                            >
                                � {t.sendToOthers}
                            </button>
                        </div>
                    )}

                    {sendMode === 'others' && showFriendSelect && !directTarget && (
                        <div className="friend-select-list">
                            <div className="text-[10px] text-gray-400 p-2 border-b border-white/5">{t.selectFriend}</div>
                            {friendsData && friendsData.length > 0 ? (
                                friendsData.map(friend => (
                                    <div
                                        key={friend.id}
                                        onClick={() => setSelectedFriend(friend)}
                                        className={`friend-select-item ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
                                    >
                                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                        <div className="friend-select-info">
                                            <div className="friend-select-name">{friend.displayName}</div>
                                            <div className={`friend-select-status ${friend.isOnline ? 'online' : ''}`}>
                                                {friend.isOnline ? t.online : t.offline}
                                            </div>
                                        </div>
                                        {selectedFriend?.id === friend.id && <span className="text-primary">�</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-gray-400 text-xs">{t.noFriendsToSend}</div>
                            )}
                        </div>
                    )}
                </div>
                {/* � QUANTITY SELECTOR � �ظ�ر ف�ط ���دا�ا ا�ت� maxSendOptions ��ست null */}
                {isGiftItem && isSending && gift?.maxSendOptions !== null && gift?.maxSendOptions !== undefined && (
                    <div style={{
                        padding:'8px 14px',
                        borderTop:'1px solid rgba(255,255,255,0.06)',
                        display:'flex', flexDirection:'column', gap:'6px'
                    }}>
                        <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:600, textAlign:'center' }}>
                            {lang === 'ar' ? '� �� �د�ة عا�ز تبعت�' : '� How many to send?'}
                        </div>
                        <div style={{ display:'flex', gap:'5px', justifyContent:'center' }}>
                            {[1, 3, 5, 10].map(qty => (
                                <button
                                    key={qty}
                                    onClick={() => setSelectedQty(qty)}
                                    disabled={currency < gift.cost * qty}
                                    style={{
                                        padding:'5px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:800,
                                        border: selectedQty === qty ? 'none' : '1px solid rgba(255,255,255,0.12)',
                                        background: selectedQty === qty
                                            ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
                                            : 'rgba(255,255,255,0.05)',
                                        color: selectedQty === qty ? '#fff' : currency >= gift.cost * qty ? '#e2e8f0' : '#4b5563',
                                        cursor: currency >= gift.cost * qty ? 'pointer' : 'not-allowed',
                                        boxShadow: selectedQty === qty ? '0 0 10px rgba(167,139,250,0.5)' : 'none',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    �{qty}
                                </button>
                            ))}
                        </div>
                        {selectedQty > 1 && (
                            <div style={{ textAlign:'center', fontSize:'10px', color:'#facc15', fontWeight:700 }}>
                                � {(gift.cost * selectedQty).toLocaleString()} �
                                {' · '}⭐ +{formatCharisma(gift.charisma * selectedQty)}
                            </div>
                        )}
                    </div>
                )}
                <div className="modal-footer py-2">
                    {isFromInventory ? (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{t.close}</button>
                            <button
                                onClick={handleSendFromInventory}
                                disabled={!directTarget && sendMode === 'others' && !selectedFriend}
                                className={`flex-1 py-1.5 rounded text-xs font-bold ${!directTarget && sendMode === 'others' && !selectedFriend ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-gold'}`}
                            >
                                {t.sendGift}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{t.reportCancel}</button>
                            <button
                                onClick={handleBuy}
                                disabled={currency < gift.cost * selectedQty || (!directTarget && sendMode === 'others' && !selectedFriend && isGiftItem)}
                                className={`flex-1 py-1.5 rounded text-xs font-bold ${currency >= gift.cost * selectedQty ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isGiftItem && !directTarget && sendMode === 'self'
                                    ? `� ${lang === 'ar' ? 'أضف ���خز��' : 'Add to Inventory'} (${(gift.cost * selectedQty).toLocaleString()}�)`
                                    : `${isSending || directTarget ? t.sendGift : t.buy}${selectedQty > 1 ? ` �${selectedQty}` : ''} (${(gift.cost * selectedQty).toLocaleString()}�)`
                                }
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// �� SEND GIFT MODAL � New Design v3 (All fixes applied)
var SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency, friendsData }) => {
    const t = TRANSLATIONS[lang];

    // �� ALL HOOKS FIRST � no early returns before hooks ��
    const [activeTab, setActiveTab]           = useState('gifts');
    const [selectedGift, setSelectedGift]     = useState(null);
    const [comboOverlay, setComboOverlay]     = useState(null);
    const [qty, setQty]                       = useState(1);
    const [isPublic, setIsPublic]             = useState(true);
    const [showGiftDetail, setShowGiftDetail] = useState(false);
    const tabsRef            = useRef(null);
    const scrollIntervalRef  = useRef(null);

    const scrollTabs = (dir) => {
        if (!tabsRef.current) return;
        tabsRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' });
    };
    const startScroll = (dir) => { scrollTabs(dir); scrollIntervalRef.current = setInterval(() => scrollTabs(dir), 220); };
    const stopScroll  = () => clearInterval(scrollIntervalRef.current);

    // fix #1/#6: combo check BEFORE show guard so state is never lost on unmount
    if (comboOverlay) {
        return (
            <PortalModal>
                <ComboSendOverlay
                    gift={comboOverlay.gift}
                    target={comboOverlay.target}
                    currency={currency}
                    onSend={(g, tgt, q) => onSendGift(g, tgt, q)}
                    onClose={() => { setComboOverlay(null); onClose(); }}
                    lang={lang}
                />
            </PortalModal>
        );
    }

    if (!show) return null;

    const hasDirectTarget = targetUser && targetUser.uid !== 'self';
    const vipLevel  = currentUser ? (getVIPLevel ? getVIPLevel(currentUser) : 0) : 0;
    const inventory = currentUser?.inventory || {};
    // fix #9: only require familyId � ignore level requirement
    const hasFamilyId = !!(currentUser?.familyId);

    const TABS = [
        { id: 'inventory', icon: '�', label_ar: 'ا�ف�تر�',      label_en: 'Inventory' },
        { id: 'gifts',     icon: '��', label_ar: '�دا�ا',         label_en: 'Gifts'    },
        { id: 'family',    icon: '���', label_ar: '�دا�ا ا��ب��ة', label_en: 'Family'   },
        { id: 'special',   icon: '�', label_ar: 'سب�ش�ا�',       label_en: 'Special'  },
        { id: 'flag',      icon: '�', label_ar: 'أع�ا�',          label_en: 'Flag'     },
        { id: 'vip',       icon: '�', label_ar: 'VIP',            label_en: 'VIP'      },
    ];

    const getGiftsForTab = () => {
        switch (activeTab) {
            case 'inventory': {
                const invGiftIds = inventory.gifts || [];
                const pool = [
                    ...(SHOP_ITEMS.gifts||[]), ...(SHOP_ITEMS.gifts_vip||[]),
                    ...(SHOP_ITEMS.gifts_family||[]), ...(SHOP_ITEMS.gifts_special||[]),
                ];
                return invGiftIds.map(gid => {
                    const g = pool.find(x => x.id === gid);
                    if (!g) return null;
                    const expiryTs = inventory.expiry?.[gid];
                    const daysLeft = expiryTs ? Math.max(0, Math.ceil((expiryTs - Date.now()) / 86400000)) : null;
                    return { ...g, fromInventory: true, daysLeft, qty: inventory.giftCounts?.[gid] || 1 };
                }).filter(Boolean);
            }
            case 'gifts':   return (SHOP_ITEMS.gifts||[]).filter(g => !g.hidden && !g.eventOnly);
            case 'family':  return (SHOP_ITEMS.gifts_family||[]);
            case 'special': return (SHOP_ITEMS.gifts_special||[]);
            case 'flag':    return (SHOP_ITEMS.gifts_flag||[]);
            case 'vip':     return (SHOP_ITEMS.gifts_vip||[]).filter(g => !g.hidden);
            default:        return [];
        }
    };
    const gifts = getGiftsForTab();

    const getGiftTag = (gift) => {
        if (gift.specialType === 'lottery' || gift.isEvent)        return { label: lang==='ar'?'�ا�ص�ب':'Lottery',           bg:'#8b5cf6' };
        if (gift.limitedTime)                                       return { label: lang==='ar'?'�حد�د':'Limited',             bg:'#f97316' };
        if (gift.type === 'gifts_vip' || gift.vipExclusive)        return { label: 'VIP',                                      bg:'#f59e0b' };
        if (gift.type === 'gifts_family')                           return { label: lang==='ar'?'�ب��ة':'Family',               bg:'#10b981' };
        if ((gift.charisma||0) >= 400 || (gift.cost||0) >= 2000)   return { label: lang==='ar'?'�فاجأة ا�ذ�ب':'Golds Surprise', bg:'#ef4444' };
        return null;
    };

    const handleSend = (gift, sendQty) => {
        const target = hasDirectTarget ? targetUser : null;
        if (!gift) return;
        onSendGift(gift, target, sendQty || qty, { isPublic });
        const allowsMulti = gift?.maxSendOptions != null && (sendQty || qty) === 1;
        if (allowsMulti && target && target.uid !== 'self') {
            setComboOverlay({ gift, target });
        } else {
            onClose();
        }
    };

    const charismaForBar = selectedGift ? (selectedGift.charisma||0) * qty : 0;
    const maxGoldForBar  = selectedGift ? (selectedGift.maxBonus||0) * qty : 0;
    const showInfoBar    = !!(selectedGift && (charismaForBar > 0 || maxGoldForBar > 0));

    // fix #7: gift detail popup component
    const GiftDetailPopup = () => {
        if (!showGiftDetail || !selectedGift) return null;
        const g = selectedGift;
        const rKey = getGiftRarity(g.cost || 0);
        const rarity = RARITY_CONFIG[rKey] || RARITY_CONFIG.Common;
        return (
            <div style={{ position:'fixed', inset:0, zIndex: Z.TOOLTIP, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
                onClick={() => setShowGiftDetail(false)}>
                <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'300px', background:'linear-gradient(160deg,#0e0e22,#13122a)', border:`1px solid ${rarity.border}`, borderRadius:'18px', padding:'20px', boxShadow:`0 20px 60px rgba(0,0,0,0.9)` }}>
                    <div style={{ textAlign:'center', marginBottom:'14px' }}>
                        {g.imageUrl && g.imageUrl.trim() !== ''
                            ? <img src={g.imageUrl} alt="" style={{ width:'80px', height:'80px', objectFit:'contain', borderRadius:'12px' }} />
                            : <span style={{ fontSize:'52px', lineHeight:1 }}>{g.emoji||'��'}</span>
                        }
                    </div>
                    <div style={{ fontSize:'15px', fontWeight:900, color:'white', textAlign:'center', marginBottom:'4px' }}>{lang==='ar'?(g.name_ar||g.name_en):g.name_en}</div>
                    {(g.desc_ar||g.desc_en) && <div style={{ fontSize:'11px', color:'#9ca3af', textAlign:'center', marginBottom:'12px', lineHeight:1.5 }}>{lang==='ar'?(g.desc_ar||g.desc_en):(g.desc_en||g.desc_ar)}</div>}
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px' }}>
                        {!g.fromInventory && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}><span style={{ color:'#9ca3af' }}>� {lang==='ar'?'ا�سعر':'Price'}</span><span style={{ color:'#facc15', fontWeight:800 }}>{(g.cost||0).toLocaleString()} �</span></div>}
                        {(g.charisma||0) > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}><span style={{ color:'#9ca3af' }}>⭐ {lang==='ar'?'�ار�ز�ا':'Charisma'}</span><span style={{ color:'#fbbf24', fontWeight:800 }}>+{formatCharisma(g.charisma||0)}</span></div>}
                        {(g.maxBonus||0) > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}><span style={{ color:'#9ca3af' }}>�� {lang==='ar'?'�رد�د أ�ص�':'Max Bonus'}</span><span style={{ color:'#4ade80', fontWeight:800 }}>+{(g.maxBonus||0).toLocaleString()} �</span></div>}
                        {g.specialType === 'lottery' && (g.possibleRewards||[]).length > 0 && (
                            <div style={{ padding:'8px 10px', background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:'8px' }}>
                                <div style={{ fontSize:'10px', fontWeight:800, color:'#a78bfa', marginBottom:'6px' }}>� {lang==='ar'?'ج�ائز ����ة':'Possible Rewards'}</div>
                                {(g.possibleRewards||[]).map((r, i) => (
                                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#d1d5db', marginBottom:'3px' }}>
                                        <span>{lang==='ar'?(r.desc_ar||r.desc_en):(r.desc_en||r.desc_ar)}</span>
                                        <span style={{ color:'#a78bfa', fontWeight:700 }}>{r.chance}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {g.durationDays && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 10px', background:'rgba(255,255,255,0.04)', borderRadius:'8px' }}><span style={{ color:'#9ca3af' }}>⏳ {lang==='ar'?'ت�ت�� بعد':'Expires in'}</span><span style={{ color:'#f59e0b', fontWeight:800 }}>{g.durationDays} {lang==='ar'?'���':'days'}</span></div>}
                        {g.isEvent && <div style={{ fontSize:'10px', color:'#a78bfa', textAlign:'center', padding:'4px', background:'rgba(139,92,246,0.08)', borderRadius:'6px' }}>� {lang==='ar'?'�د�ة إ�ف�ت':'Event Gift'}</div>}
                        {g.limitedTime && <div style={{ fontSize:'10px', color:'#f97316', textAlign:'center', padding:'4px', background:'rgba(249,115,22,0.08)', borderRadius:'6px' }}>⏰ {lang==='ar'?'���ت �حد�د':'Limited Time'}</div>}
                    </div>
                    <button onClick={() => setShowGiftDetail(false)} style={{ width:'100%', padding:'10px', borderRadius:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>{lang==='ar'?'إغ�ا�':'Close'}</button>
                </div>
            </div>
        );
    };

    return (
        <>
        <PortalModal>
            <div style={{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
                <div style={{ width:'100%', maxWidth:'480px', background:'linear-gradient(180deg,#111122 0%,#0a0a18 100%)', borderRadius:'22px 22px 0 0', border:'1px solid rgba(255,255,255,0.1)', borderBottom:'none', overflow:'hidden', maxHeight:'88vh', display:'flex', flexDirection:'column', boxShadow:'0 -10px 60px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>

                    {/* �� Header �� */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
                        {hasDirectTarget && (
                            <>
                                <img src={targetUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.displayName||'U')}&background=6366f1&color=fff`} alt="" style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(0,242,255,0.3)', flexShrink:0 }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:'11px', color:'#9ca3af' }}>{lang==='ar'?'إرسا� إ��':'Send to'}</div>
                                    <div style={{ fontSize:'14px', fontWeight:800, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{targetUser.displayName}</div>
                                </div>
                            </>
                        )}
                        {!hasDirectTarget && <div style={{ flex:1, fontSize:'15px', fontWeight:900, color:'white' }}>{lang==='ar'?'إرسا� �د�ة':'Send Gift'}</div>}
                        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af', fontSize:'14px', flexShrink:0 }}>�</button>
                    </div>

                    {/* �� Tabs with scroll arrows (fix #3) �� */}
                    <div style={{ display:'flex', alignItems:'center', padding:'8px 0 0', flexShrink:0, gap:0 }}>
                        <button onMouseDown={() => startScroll(-1)} onMouseUp={stopScroll} onMouseLeave={stopScroll} onTouchStart={() => startScroll(-1)} onTouchEnd={stopScroll}
                            style={{ flexShrink:0, width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', marginLeft:'8px' }}>�</button>
                        <div ref={tabsRef} style={{ flex:1, display:'flex', overflowX:'auto', gap:'4px', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', padding:'0 4px' }}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedGift(null); setQty(1); setShowGiftDetail(false); }}
                                    style={{ flexShrink:0, padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:800, whiteSpace:'nowrap', background: activeTab===tab.id?'rgba(0,242,255,0.18)':'rgba(255,255,255,0.06)', color: activeTab===tab.id?'#00f2ff':'#9ca3af', borderBottom: activeTab===tab.id?'2px solid #00f2ff':'2px solid transparent', transition:'all 0.15s' }}
                                >{tab.icon} {lang==='ar'?tab.label_ar:tab.label_en}</button>
                            ))}
                        </div>
                        <button onMouseDown={() => startScroll(1)} onMouseUp={stopScroll} onMouseLeave={stopScroll} onTouchStart={() => startScroll(1)} onTouchEnd={stopScroll}
                            style={{ flexShrink:0, width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', marginRight:'8px' }}>�</button>
                    </div>

                    {/* �� Info bar (fix #7: ? opens detail popup) �� */}
                    <div style={{ padding:'8px 12px 0', flexShrink:0 }}>
                        {showInfoBar && (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 14px', margin:'0 0 4px', background:'rgba(255,215,0,0.07)', borderRadius:'10px', border:'1px solid rgba(255,215,0,0.18)', fontSize:'11px' }}>
                                <span style={{ color:'#d1d5db', flex:1 }}>
                                    {lang==='ar'?'�ار�ز�ا ا��ست��':"Receiver's Charm"}{' '}
                                    <span style={{ color:'#facc15', fontWeight:800 }}>+{formatCharisma(charismaForBar)}</span>
                                    {maxGoldForBar > 0 && <span style={{ color:'#9ca3af', marginLeft:'6px' }}>{lang==='ar'?`حص� ع�� �ا �ص� إ�� ${maxGoldForBar.toLocaleString()} �`:`Gain up to ${maxGoldForBar.toLocaleString()} Intel �`}</span>}
                                    {selectedGift?.specialType==='lottery' && <span style={{ color:'#a78bfa', marginLeft:'6px' }}>�</span>}
                                </span>
                                <button onClick={() => setShowGiftDetail(true)} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50%', width:'22px', height:'22px', color:'#e2e8f0', fontSize:'12px', fontWeight:800, cursor:'pointer', lineHeight:1, flexShrink:0 }}>?</button>
                            </div>
                        )}
                    </div>

                    {/* �� Family locked notice (fix #9) �� */}
                    {activeTab==='family' && !hasFamilyId && (
                        <div style={{ margin:'8px 12px', padding:'10px 14px', borderRadius:'10px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', fontSize:'11px', color:'#34d399', textAlign:'center', flexShrink:0 }}>
                            ��� {lang==='ar'?'�جب أ� ت��� ف� �ب��ة �استخدا� �دا�ا ا��ب��ة':'You must be in a family to use Family Gifts'}
                        </div>
                    )}

                    {/* �� Gift grid (fix #2 fixed name, fix #4 expiry, fix #8 GIF/img support) �� */}
                    <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', alignContent:'start' }}>
                        {gifts.length === 0 ? (
                            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'#4b5563', fontSize:'12px' }}>
                                {activeTab==='inventory'?(lang==='ar'?'�ا ت�جد �دا�ا ف� ا�إ�ف�تر�':'No gifts in inventory'):(lang==='ar'?'�ا ت�جد �دا�ا':'No gifts available')}
                            </div>
                        ) : gifts.map(gift => {
                            const tag        = getGiftTag(gift);
                            const rKey       = getGiftRarity(gift.cost || 0);
                            const rarity     = RARITY_CONFIG[rKey] || RARITY_CONFIG.Common;
                            const vipRequired = gift.vipMinLevel || 0;
                            const isVIPLocked = gift.type==='gifts_vip' && vipLevel < vipRequired;
                            const isFamLocked = gift.type==='gifts_family' && !hasFamilyId; // fix #9
                            const isSelected  = selectedGift?.id === gift.id;
                            const canAfford   = gift.fromInventory ? true : (currency >= (gift.cost||0));
                            return (
                                <button key={gift.id}
                                    onClick={() => { if (isVIPLocked||isFamLocked) return; setSelectedGift(isSelected?null:gift); setQty(1); setShowGiftDetail(false); }}
                                    style={{
                                        // fix #2: fixed total height � nothing shifts
                                        display:'flex', flexDirection:'column', alignItems:'center',
                                        height:'112px', padding:'0',
                                        borderRadius:'12px',
                                        cursor: (isVIPLocked||isFamLocked)?'default':'pointer',
                                        border: isSelected?'2px solid #00f2ff':`1px solid ${canAfford&&!isVIPLocked?rarity.border:'rgba(255,255,255,0.07)'}`,
                                        background: isSelected?'rgba(0,242,255,0.08)':(canAfford&&!isVIPLocked?rarity.bg:'rgba(255,255,255,0.03)'),
                                        opacity: (isVIPLocked||isFamLocked||(!canAfford&&!gift.fromInventory))?0.45:1,
                                        position:'relative', overflow:'hidden',
                                        transition:'transform 0.12s, border 0.12s',
                                        boxShadow: isSelected?'0 0 12px rgba(0,242,255,0.3)':'none',
                                    }}
                                    onMouseEnter={e => { if (!isVIPLocked&&!isFamLocked) e.currentTarget.style.transform='scale(1.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
                                >
                                    {tag && <div style={{ position:'absolute', top:'4px', left:'4px', fontSize:'7px', fontWeight:800, color:'white', background:tag.bg, borderRadius:'6px', padding:'1px 5px', zIndex:2, lineHeight:1.4 }}>{tag.label}</div>}
                                    {/* fix #8: image area � supports GIF + static + emoji */}
                                    <div style={{ width:'100%', flex:1, position:'relative', borderRadius:'10px 10px 0 0', overflow:'hidden', background:'rgba(255,255,255,0.03)' }}>
                                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            {gift.imageUrl && gift.imageUrl.trim()!==''
                                                ? <img src={gift.imageUrl} alt="" style={{ width:'68%', height:'68%', objectFit:'contain' }} />
                                                : <span style={{ fontSize:'26px', lineHeight:1 }}>{gift.emoji||'��'}</span>
                                            }
                                        </div>
                                        {(isVIPLocked||isFamLocked) && (
                                            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px' }}>
                                                <span style={{ fontSize:'14px' }}>�</span>
                                                <span style={{ fontSize:'7px', color:isVIPLocked?'#f59e0b':'#10b981', fontWeight:800 }}>{isVIPLocked?`VIP${vipRequired}+`:(lang==='ar'?'�ب��ة':'Family')}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* fix #2: name ALWAYS fixed 14px height � never displaced */}
                                    <div style={{ fontSize:'9px', fontWeight:700, color:'white', height:'14px', lineHeight:'14px', textAlign:'center', padding:'0 3px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width:'100%', flexShrink:0, marginTop:'3px' }}>
                                        {lang==='ar'?(gift.name_ar||gift.name_en):gift.name_en}
                                    </div>
                                    {/* Price / qty */}
                                    <div style={{ height:'13px', lineHeight:'13px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', gap:'2px', marginBottom:'3px' }}>
                                        {gift.fromInventory
                                            ? <span style={{ fontSize:'8px', color:'#10b981', fontWeight:800 }}>�{gift.qty||1}</span>
                                            : <span style={{ fontSize:'8px', fontWeight:800, color:canAfford?'#facc15':'#6b7280' }}>�{fmtNum(gift.cost||0)}</span>
                                        }
                                    </div>
                                    {/* fix #4: expiry date text below gift in inventory */}
                                    {gift.fromInventory && gift.daysLeft != null && (
                                        <div style={{ position:'absolute', bottom:'2px', left:0, right:0, fontSize:'7px', textAlign:'center', color:'rgba(249,115,22,0.55)', fontWeight:700 }}>
                                            {lang==='ar'?`${gift.daysLeft} ���`:`${gift.daysLeft} days`}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* �� Bottom bar �� */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.4)', flexShrink:0 }}>
                        <div style={{ fontSize:'12px', fontWeight:700, color:'#facc15', flex:1 }}>� {(currency||0).toLocaleString()}</div>
                        {/* fix #5: real Public/Private toggle */}
                        <button onClick={() => setIsPublic(v => !v)}
                            style={{ padding:'7px 12px', borderRadius:'20px', background:isPublic?'rgba(0,242,255,0.12)':'rgba(255,80,80,0.12)', border:`1px solid ${isPublic?'rgba(0,242,255,0.3)':'rgba(255,80,80,0.3)'}`, color:isPublic?'#00f2ff':'#f87171', fontSize:'11px', fontWeight:700, cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}>
                            {isPublic?(lang==='ar'?'� عا�':'� Public'):(lang==='ar'?'� خاص':'� Private')}
                        </button>
                        {/* fix #1: qty uses maxSendOptions from selected gift */}
                        <div style={{ position:'relative', flexShrink:0 }}>
                            <select value={qty} onChange={e => setQty(Number(e.target.value))}
                                style={{ padding:'7px 24px 7px 12px', borderRadius:'20px', background:'rgba(15,15,30,0.9)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer', appearance:'none', WebkitAppearance:'none', outline:'none' }}>
                                {(selectedGift?.maxSendOptions || [1,3,5,10,20,50,99]).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', fontSize:'8px', color:'#9ca3af', pointerEvents:'none' }}>�</span>
                        </div>
                        <button
                            onClick={() => {
                                if (!selectedGift) return;
                                if (selectedGift.fromInventory) { onSendGift(selectedGift, hasDirectTarget?targetUser:null, qty, { isPublic }); onClose(); }
                                else { const cost=(selectedGift.cost||0)*qty; if(currency<cost)return; handleSend(selectedGift,qty); }
                            }}
                            disabled={!selectedGift}
                            style={{ padding:'9px 22px', borderRadius:'50px', flexShrink:0, background:selectedGift?'linear-gradient(135deg,#ec4899,#db2777)':'rgba(255,255,255,0.07)', border:'none', color:selectedGift?'white':'#4b5563', fontSize:'13px', fontWeight:900, cursor:selectedGift?'pointer':'default', boxShadow:selectedGift?'0 4px 14px rgba(236,72,153,0.45)':'none', transition:'all 0.2s' }}>
                            {lang==='ar'?'إرسا�':'Send'}{selectedGift&&qty>1?` �${qty}`:''}
                        </button>
                    </div>
                </div>
            </div>
        </PortalModal>
        {showGiftDetail && selectedGift && <PortalModal><GiftDetailPopup /></PortalModal>}
        </>
    );
}

// ��������������������������������������������������
// � COMBO SEND OVERLAY � bottom-right floating card, no backdrop
// ��������������������������������������������������
var ComboSendOverlay = ({ gift, target, currency, onSend, onClose, lang }) => {
    const COMBO_DURATION = 3000; // � 3 seconds

    // ��� ALL STATE ���
    const [comboCount,    setComboCount]    = useState(0);
    const [ringProgress,  setRingProgress]  = useState(1);
    const [comboActive,   setComboActive]   = useState(true);
    const [totalBonus,    setTotalBonus]    = useState(0);
    const [totalCharisma, setTotalCharisma] = useState(0);
    const [closing,       setClosing]       = useState(false);
    const [showFinalLog,  setShowFinalLog]  = useState(false);

    // ��� ALL REFS � never go stale ���
    const ringIntervalRef  = React.useRef(null);
    const timerRef         = React.useRef(null);
    const ringStartRef     = React.useRef(null);
    const comboCountRef    = React.useRef(0);
    const isClosedRef      = React.useRef(false);   // � guard: prevent double-close
    const onCloseRef       = React.useRef(onClose);
    const currencyRef      = React.useRef(currency);
    useEffect(() => { onCloseRef.current = onClose; },  [onClose]);
    useEffect(() => { currencyRef.current = currency; }, [currency]);

    // ��� CLOSE � called only once ���
    const close = React.useCallback(() => {
        if (isClosedRef.current) return;      // � prevent double-fire
        isClosedRef.current = true;
        clearInterval(ringIntervalRef.current);
        clearTimeout(timerRef.current);
        setClosing(true);
        if (comboCountRef.current > 0) {
            setShowFinalLog(true);
            setTimeout(() => { onCloseRef.current && onCloseRef.current(); }, 1800);
        } else {
            setTimeout(() => { onCloseRef.current && onCloseRef.current(); }, 350);
        }
    }, []); // � empty deps � never recreated, never stale

    // ��� COUNTDOWN ���
    const startCountdown = React.useCallback(() => {
        clearInterval(ringIntervalRef.current);
        clearTimeout(timerRef.current);
        ringStartRef.current = Date.now();
        setRingProgress(1);
        setComboActive(true);
        ringIntervalRef.current = setInterval(() => {
            const elapsed  = Date.now() - ringStartRef.current;
            const progress = 1 - elapsed / COMBO_DURATION;
            if (progress <= 0) {
                clearInterval(ringIntervalRef.current);
                setRingProgress(0);
                setComboActive(false);
            } else {
                setRingProgress(progress);
            }
        }, 40);
        timerRef.current = setTimeout(() => {
            clearInterval(ringIntervalRef.current);
            close();
        }, COMBO_DURATION + 80);
    }, [close]);

    // ��� MOUNT / UNMOUNT ���
    useEffect(() => {
        isClosedRef.current = false;
        startCountdown();
        return () => {
            clearInterval(ringIntervalRef.current);
            clearTimeout(timerRef.current);
        };
    }, []); // � run only once on mount

    // ��� TAP HANDLER � uses refs, never stale ���
    const handleTap = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isClosedRef.current) return;
        if (currencyRef.current < gift.cost) return;
        onSend(gift, target, 1);
        const bonus    = generateRandomBonus(gift.minBonus || 1, gift.maxBonus || Math.floor(gift.cost * 0.1), gift.cost);
        const charisma = gift.charisma || 0;
        setTotalBonus   (prev => prev + bonus);
        setTotalCharisma(prev => prev + charisma);
        comboCountRef.current += 1;
        setComboCount(comboCountRef.current);
        startCountdown(); // � reset timer on every tap
    }, [gift, target, onSend, startCountdown]);

    const RING_R    = 42;
    const RING_C    = 2 * Math.PI * RING_R;
    const ringColor = comboCountRef.current >= 10 ? '#f59e0b'
                    : comboCountRef.current >= 5  ? '#a78bfa'
                    : '#00d4ff';

    // ��� FINAL LOG CARD ���
    if (showFinalLog && comboCountRef.current > 0) {
        return (
            <div style={{
                position:'fixed', bottom:'80px', right:'12px', zIndex:Z.OVERLAY,
                width:'200px',
                background:'linear-gradient(135deg,rgba(20,20,40,0.98),rgba(10,10,25,0.99))',
                border:`1px solid ${ringColor}55`,
                borderRadius:'16px', padding:'14px',
                boxShadow:`0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${ringColor}22`,
                animation:'animate-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                pointerEvents:'none',
            }}>
                <div style={{textAlign:'center',marginBottom:'10px'}}>
                    <div style={{fontSize:'28px',marginBottom:'2px'}}>
                        {gift.imageUrl?<img src={gift.imageUrl} alt="" style={{width:'34px',height:'34px',objectFit:'contain'}}/>:gift.emoji}
                    </div>
                    <div style={{fontSize:'15px',fontWeight:900,color:ringColor,textShadow:`0 0 12px ${ringColor}`}}>
                        �{comboCount} COMBO! �
                    </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                    <div style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.25)',borderRadius:'8px',padding:'6px',textAlign:'center'}}>
                        <div style={{fontSize:'8px',color:'#6b7280',fontWeight:700}}>{lang==='ar'?'ب��ص':'Bonus'}</div>
                        <div style={{fontSize:'13px',fontWeight:900,color:'#4ade80'}}>+{fmtNum(totalBonus)}�</div>
                    </div>
                    <div style={{background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.25)',borderRadius:'8px',padding:'6px',textAlign:'center'}}>
                        <div style={{fontSize:'8px',color:'#6b7280',fontWeight:700}}>{lang==='ar'?'�ج��':'Stars'}</div>
                        <div style={{fontSize:'13px',fontWeight:900,color:'#fbbf24'}}>+{formatCharisma(totalCharisma)}⭐</div>
                    </div>
                </div>
            </div>
        );
    }

    // ��� MAIN COMBO CARD ���
    return (
        <div
            style={{
                position:'fixed', bottom:'80px', right:'12px', zIndex:Z.OVERLAY,
                width:'160px',
                background:'linear-gradient(135deg,rgba(15,15,35,0.97),rgba(8,8,22,0.98))',
                border:`1.5px solid ${ringColor}66`,
                borderRadius:'18px', padding:'14px 12px',
                boxShadow:`0 8px 32px rgba(0,0,0,0.65), 0 0 24px ${ringColor}22`,
                animation: closing
                    ? 'toast-slide-up 0.35s ease forwards'
                    : 'animate-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
            }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            {/* Gift image + name */}
            <div style={{textAlign:'center'}}>
                {gift.imageUrl
                    ? <img src={gift.imageUrl} alt={gift.name_en} style={{width:'48px',height:'48px',objectFit:'contain'}}/>
                    : <span style={{fontSize:'38px',lineHeight:1}}>{gift.emoji||'��'}</span>
                }
                <div style={{fontSize:'10px',fontWeight:800,color:'#f1f5f9',marginTop:'3px'}}>
                    {lang==='ar'?gift.name_ar:gift.name_en}
                </div>
                <div style={{fontSize:'9px',color:'#fbbf24',fontWeight:700}}>
                    {gift.cost} � {lang==='ar'?'��� إرسا�':'each'}
                </div>
            </div>

            {/* Combo counter */}
            {comboCount > 0 && (
                <div style={{
                    fontSize:'16px',fontWeight:900,color:ringColor,
                    textShadow:`0 0 16px ${ringColor}`,
                    animation:comboCount>=5?'mythic-pulse 0.6s ease-in-out infinite':'none',
                }}>
                    �{comboCount} COMBO!
                </div>
            )}

            {/* � FIX: entire 100�100 area tappable � not just the inner button */}
            <div
                onPointerDown={currency >= gift.cost ? handleTap : undefined}
                style={{
                    position:'relative', width:'100px', height:'100px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: currency >= gift.cost ? 'pointer' : 'not-allowed',
                    userSelect:'none', WebkitUserSelect:'none',
                    touchAction:'manipulation',
                    WebkitTapHighlightColor:'transparent',
                }}
            >
                {/* SVG ring � pointer-events none so parent gets all taps */}
                <svg width="100" height="100" style={{position:'absolute',top:0,left:0,transform:'rotate(-90deg)',pointerEvents:'none'}}>
                    <circle cx="50" cy="50" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
                    <circle
                        cx="50" cy="50" r={RING_R} fill="none"
                        stroke={comboActive?ringColor:'rgba(255,255,255,0.15)'}
                        strokeWidth="5"
                        strokeDasharray={RING_C}
                        strokeDashoffset={RING_C*(1-ringProgress)}
                        strokeLinecap="round"
                        style={{filter:comboActive?`drop-shadow(0 0 6px ${ringColor})`:'none',transition:'stroke 0.3s'}}
                    />
                </svg>
                {/* Inner visual button � pointer-events none */}
                <div style={{
                    width:'76px', height:'76px', borderRadius:'50%',
                    background:comboActive
                        ?`linear-gradient(135deg,${ringColor}cc,${ringColor}88)`
                        :'rgba(100,100,100,0.2)',
                    boxShadow:comboActive?`0 0 24px ${ringColor}88`:'none',
                    transition:'background 0.15s,box-shadow 0.15s',
                    pointerEvents:'none',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px',
                }}>
                    <span style={{fontSize:'20px',lineHeight:1}}>{gift.emoji||'��'}</span>
                    <span style={{fontSize:'9px',fontWeight:800,color:'#fff',opacity:0.9}}>
                        {lang==='ar'?'اضغط!':'TAP!'}
                    </span>
                </div>
            </div>

            {totalBonus > 0 && (
                <div style={{fontSize:'10px',fontWeight:800,color:'#4ade80',textAlign:'center'}}>
                    +{fmtNum(totalBonus)} �
                </div>
            )}
        </div>
    );
};


// � SHOP MODAL

