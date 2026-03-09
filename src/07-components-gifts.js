const GiftLog = ({ show, onClose, targetUID, lang, onOpenProfile, isOwnProfile }) => {
    const t = TRANSLATIONS[lang];
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wall'); // 'wall', 'badge', 'received'
    const [giftCounts, setGiftCounts] = useState({});
    const [lastSenders, setLastSenders] = useState({});
    const [totalGifts, setTotalGifts] = useState(0);
    const [rotatingGiftIndex, setRotatingGiftIndex] = useState(0);

    // Fetch gifts without orderBy to avoid index requirement
    useEffect(() => {
        if (!show || !targetUID) return;
        setLoading(true);

        const unsub = giftsLogCollection
            .where('receiverId', '==', targetUID)
            .limit(50)
            .onSnapshot(snap => {
                const giftsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort in memory instead of query
                giftsData.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setGifts(giftsData);
                setTotalGifts(giftsData.length);

                // Calculate gift counts and last senders
                const counts = {};
                const senders = {};
                giftsData.forEach(gift => {
                    const giftId = gift.giftId;
                    counts[giftId] = (counts[giftId] || 0) + 1;
                    if (!senders[giftId]) {
                        senders[giftId] = {
                            name: gift.senderName,
                            photo: gift.senderPhoto,
                            uid: gift.senderId
                        };
                    }
                });
                setGiftCounts(counts);
                setLastSenders(senders);
                setLoading(false);
            }, error => {
                setLoading(false);
            });

        return unsub;
    }, [show, targetUID]);

    // Auto-rotate gifts in the mini display
    useEffect(() => {
        if (gifts.length === 0) return;
        const interval = setInterval(() => {
            setRotatingGiftIndex(prev => (prev + 1) % Math.min(3, gifts.length));
        }, 2000);
        return () => clearInterval(interval);
    }, [gifts.length]);

    if (!show) return null;

    // Get last 3 gifts for mini display
    const lastThreeGifts = gifts.slice(0, 3);

    // Get unique gifts for Gift Wall
    const uniqueGifts = SHOP_ITEMS.gifts.map(gift => ({
        ...gift,
        count: giftCounts[gift.id] || 0,
        lastSender: lastSenders[gift.id] || null,
        received: giftCounts[gift.id] > 0
    }));

    return (
        <div className="gift-log-container-v2">
            {/* Mini Gift Display - Shows rotating gifts */}
            <div className="gift-mini-display" onClick={() => setActiveTab('wall')}>
                <div className="gift-mini-images">
                    {lastThreeGifts.length > 0 ? (
                        lastThreeGifts.map((gift, idx) => (
                            <div
                                key={gift.id}
                                className={`gift-mini-item ${idx === rotatingGiftIndex && lastThreeGifts.length > 1 ? 'active' : ''}`}
                            >
                                {gift.giftImageUrl ? (
                                    <img src={gift.giftImageUrl} alt={gift.giftName} className="gift-mini-img" />
                                ) : (
                                    <span className="gift-mini-emoji">{gift.giftEmoji}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="gift-mini-empty">🎁</div>
                    )}
                </div>
                <div className="gift-mini-info">
                    <span className="gift-mini-count">{totalGifts}</span>
                    <span className="gift-mini-label">{t.receivedGiftsCount}</span>
                </div>
            </div>

            {/* Tab Buttons */}
            <div className="gift-log-tabs">
                <button
                    className={`gift-log-tab ${activeTab === 'wall' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wall')}
                >
                    🎁 {t.giftWall}
                </button>
                <button
                    className={`gift-log-tab ${activeTab === 'badge' ? 'active' : ''}`}
                    onClick={() => setActiveTab('badge')}
                >
                    🏅 {t.giftBadge}
                </button>
                <button
                    className={`gift-log-tab ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    📬 {t.giftLog}
                </button>
            </div>

            {/* Tab Content */}
            <div className="gift-log-content">
                {loading ? (
                    <div className="gift-log-loading">{t.loading}</div>
                ) : activeTab === 'wall' ? (
                    /* GIFT WALL - All gifts with received indicator */
                    <div className="gift-wall-grid">
                        {uniqueGifts.map(gift => (
                            <div
                                key={gift.id}
                                className={`gift-wall-item ${gift.received ? 'received' : 'not-received'}`}
                                onClick={() => gift.lastSender && onOpenProfile && onOpenProfile(gift.lastSender.uid)}
                            >
                                {gift.imageUrl ? (
                                    <img src={gift.imageUrl} alt={gift.name_en} className="gift-wall-img" />
                                ) : (
                                    <span className="gift-wall-emoji">{gift.emoji}</span>
                                )}
                                {gift.received && (
                                    <>
                                        <span className="gift-wall-count">×{gift.count}</span>
                                        {gift.lastSender && (
                                            <img
                                                src={gift.lastSender.photo || `https://ui-avatars.com/api/?name=${gift.lastSender.name}&background=random`}
                                                alt={gift.lastSender.name}
                                                className="gift-wall-sender"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'badge' ? (
                    /* GIFT BADGE - Coming Soon */
                    <div className="gift-badge-section">
                        <div className="coming-soon-badge">
                            <span className="coming-soon-icon">🏅</span>
                            <span className="coming-soon-text">{t.comingSoon}</span>
                        </div>
                    </div>
                ) : (
                    /* RECEIVED GIFTS - Last 10 */
                    <div className="gift-log-list">
                        {gifts.length === 0 ? (
                            <div className="gift-log-empty">{t.giftLogEmpty}</div>
                        ) : (
                            gifts.slice(0, 10).map(gift => (
                                <div
                                    key={gift.id}
                                    className="gift-log-item"
                                    onClick={() => onOpenProfile && onOpenProfile(gift.senderId)}
                                >
                                    <img
                                        src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${gift.senderName}&background=random`}
                                        alt={gift.senderName}
                                        className="gift-log-item-avatar"
                                    />
                                    <div className="gift-log-item-content">
                                        <div className="gift-log-item-sender">{gift.senderName}</div>
                                        <div className="gift-log-item-details">
                                            {gift.giftImageUrl ? (
                                                <img src={gift.giftImageUrl} alt={gift.giftName} className="gift-log-item-img" />
                                            ) : (
                                                <span className="gift-log-item-emoji">{gift.giftEmoji}</span>
                                            )}
                                            <span className="gift-log-item-name">{lang === 'ar' ? gift.giftNameAr : gift.giftNameEn}</span>
                                        </div>
                                    </div>
                                    <div className="gift-log-item-stats">
                                        <span className="gift-log-item-charisma">+{formatCharisma(gift.charisma)}</span>
                                        {gift.bonus > 0 && <span className="gift-log-item-bonus">+{gift.bonus} 💰</span>}
                                        <span className="gift-log-item-time">{formatTime(gift.timestamp)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// 🏆 ACHIEVEMENTS DISPLAY COMPONENT

const EmojiPicker = ({ show, onClose, onSelect, lang, inline = false }) => {
    const t = TRANSLATIONS[lang];
    const [activeCategory, setActiveCategory] = useState('smiles');

    if (!show) return null;

    const categories = [
        { id: 'smiles',   icon: '😀', label_ar: 'وجوه',   label_en: 'Faces' },
        { id: 'gestures', icon: '👋', label_ar: 'إيماءات', label_en: 'Gestures' },
        { id: 'hearts',   icon: '❤️', label_ar: 'قلوب',   label_en: 'Hearts' },
        { id: 'objects',  icon: '🎉', label_ar: 'أشياء',   label_en: 'Objects' },
        { id: 'nature',   icon: '🌸', label_ar: 'طبيعة',  label_en: 'Nature' },
    ];

    const wrapperStyle = inline ? {} : undefined;

    return (
        <div className={inline ? '' : 'emoji-picker-modal animate-slide-up'} style={wrapperStyle}>
            {!inline && (
                <div className="emoji-picker-header">
                    <span className="emoji-picker-title">{t.selectEmojis || 'Emoji'}</span>
                    <button className="emoji-picker-close" onClick={onClose}>✕</button>
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

// 🎁 GIFT PREVIEW MODAL - IMPROVED
// Shows details for both sender and receiver
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false, isFromInventory = false, onSendFromInventory, friendsData, sendToSelf = false, currentUserData, user, directTarget = null }) => {
    const t = TRANSLATIONS[lang];
    const [showFriendSelect, setShowFriendSelect] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [sendMode, setSendMode] = useState(directTarget ? 'direct' : 'self');
    const [previewBonus, setPreviewBonus] = useState(0);
    // ✅ Quantity system
    const [selectedQty, setSelectedQty] = useState(1);
    // ✅ Combo system
    const [comboCount, setComboCount] = useState(0);
    const [comboActive, setComboActive] = useState(false);
    const comboTimerRef = React.useRef(null);
    const isGiftItem = gift?.type === 'gifts' || gift?.type === 'gifts_vip';

    useEffect(() => {
        if (show && gift) {
            setSelectedFriend(directTarget || null);
            setSendMode(directTarget ? 'direct' : 'self');
            setShowFriendSelect(false);
            setSelectedQty(1);
            setComboCount(0);
            setComboActive(false);
            if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
            if (gift.minBonus && gift.maxBonus) {
                setPreviewBonus(generateRandomBonus(gift.minBonus, gift.maxBonus));
            }
        }
        return () => { if (comboTimerRef.current) clearTimeout(comboTimerRef.current); };
    }, [show, gift, directTarget]);

    if(!show || !gift) return null;

    // ── Combo hit handler ──
    const handleComboHit = () => {
        const target = directTarget || (sendMode === 'self' ? { uid: 'self' } : selectedFriend);
        if (!target) return;
        if (currency < gift.cost) return;
        // Trigger 1 gift immediately
        if (onBuy) onBuy(gift, target, 1);
        setComboCount(prev => {
            const next = prev + 1;
            return next;
        });
        setComboActive(true);
        // Reset combo after 1.8s of no taps
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
            setComboActive(false);
            setComboCount(0);
        }, 1800);
    };

    // ── Quantity buy handler ──
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

    // ── Profile Effect special view ──
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
                        <div style={{
                            width:'100%', height:'140px', borderRadius:'12px', marginBottom:'12px',
                            background: rarity.bg, border: `2px solid ${rarity.border}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            position:'relative', overflow:'hidden',
                            boxShadow: rarity.glow ? `0 0 20px ${rarity.color}55` : 'none'
                        }}>
                            {gift.imageUrl && gift.imageUrl.trim() !== '' ? (
                                <img src={gift.imageUrl} alt={gift.name_en} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'10px'}} />
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
                        <h3 style={{fontSize:'15px',fontWeight:800,color:'white',marginBottom:'6px'}}>{lang==='ar'?gift.name_ar:gift.name_en}</h3>
                        {/* Details */}
                        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px',textAlign:'right',direction:'ltr'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                <span>💰 {lang==='ar'?'السعر':'Price'}</span>
                                <span style={{color:'#facc15',fontWeight:700}}>{gift.cost} 🧠</span>
                            </div>
                            {gift.particles && gift.particles.length > 0 && (
                                <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                    <span>✨ {lang==='ar'?'الجزيئات':'Particles'}</span>
                                    <span style={{color:'white',fontWeight:700}}>{gift.particles.map(p=>`${p.emoji}×${p.count}`).join(' ')}</span>
                                </div>
                            )}
                            {gift.hasGlow && (
                                <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#9ca3af',padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'8px'}}>
                                    <span>🌟 {lang==='ar'?'توهج خاص':'Special Glow'}</span>
                                    <span style={{color:'#00f2ff',fontWeight:700}}>✓ {lang==='ar'?'نعم':'Yes'}</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer py-2">
                            <div className="flex gap-2">
                                <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{lang==='ar'?'إغلاق':'Close'}</button>
                                <button
                                    onClick={() => onBuy && onBuy(gift, null)}
                                    disabled={!owned}
                                    style={{flex:1,padding:'8px',borderRadius:'8px',background: owned ? rarity.color : 'rgba(100,100,100,0.2)',color: owned ? '#000' : '#6b7280',border:'none',fontWeight:800,fontSize:'12px',cursor: owned ? 'pointer' : 'not-allowed'}}
                                >
                                    {owned ? `${lang==='ar'?'شراء':'Buy'} (${gift.cost}🧠)` : (lang==='ar'?'إنتل غير كافٍ':'Not enough Intel')}
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
                                    🍀 {lang === 'ar' ? 'مفاجأة!' : 'Surprise!'}
                                </div>
                            </div>
                            {/* VIP Required */}
                            {gift.vipMinLevel > 0 && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">👑 {lang === 'ar' ? 'يتطلب' : 'Requires'}</div>
                                    <div className="gift-preview-stat-value" style={{color: VIP_CONFIG[gift.vipMinLevel - 1]?.nameColor || '#ef4444', fontWeight:800}}>
                                        VIP {gift.vipMinLevel}+
                                    </div>
                                </div>
                            )}
                            {/* Event */}
                            {gift.isEvent && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">⚡ {lang === 'ar' ? 'نوع' : 'Type'}</div>
                                    <div className="gift-preview-stat-value" style={{color:'#a78bfa', fontWeight:800}}>
                                        {lang === 'ar' ? '🎉 إيفنت' : '🎉 Event'}
                                    </div>
                                </div>
                            )}
                            {/* Limited Time */}
                            {gift.limitedTime && (
                                <div className="gift-preview-stat">
                                    <div className="gift-preview-stat-label">⏳ {lang === 'ar' ? 'متاح' : 'Available'}</div>
                                    <div className="gift-preview-stat-value" style={{color:'#f97316', fontWeight:800}}>
                                        {lang === 'ar' ? 'لوقت محدود' : 'Limited Time'}
                                    </div>
                                </div>
                            )}
                            {/* Price */}
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">💰 {lang === 'ar' ? 'السعر' : 'Price'}</div>
                                <div className="gift-preview-stat-value" style={{color:'#fbbf24', fontWeight:800}}>
                                    {gift.cost.toLocaleString()} 🧠
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Show target info if direct target */}
                    {directTarget && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/10 rounded-lg">
                            <AvatarWithFrame photoURL={directTarget.photoURL} equipped={directTarget.equipped} size="sm" />
                            <div className="text-left">
                                <div className="font-bold text-xs">{lang === 'ar' ? 'إرسال إلى' : 'Sending to'}</div>
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
                                🎁 {t.sendToSelf}
                            </button>
                            <button
                                onClick={() => { setSendMode('others'); setShowFriendSelect(true); }}
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${sendMode === 'others' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}
                            >
                                👥 {t.sendToOthers}
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
                                        {selectedFriend?.id === friend.id && <span className="text-primary">✓</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-gray-400 text-xs">{t.noFriendsToSend}</div>
                            )}
                        </div>
                    )}
                </div>
                {/* ✅ QUANTITY SELECTOR — يظهر فقط لو maxSendOptions موجودة */}
                {isGiftItem && isSending && gift.maxSendOptions && gift.maxSendOptions.length > 0 && (
                    <div style={{
                        padding:'8px 14px',
                        borderTop:'1px solid rgba(255,255,255,0.06)',
                        display:'flex', flexDirection:'column', gap:'6px'
                    }}>
                        <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:600, textAlign:'center' }}>
                            {lang === 'ar' ? '📦 كم هدية عايز تبعت؟' : '📦 How many to send?'}
                        </div>
                        <div style={{ display:'flex', gap:'5px', justifyContent:'center' }}>
                            {gift.maxSendOptions.map(qty => (
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
                                    ×{qty}
                                </button>
                            ))}
                        </div>
                        {selectedQty > 1 && (
                            <div style={{ textAlign:'center', fontSize:'10px', color:'#facc15', fontWeight:700 }}>
                                💰 {(gift.cost * selectedQty).toLocaleString()} 🧠
                                {' · '}⭐ +{formatCharisma(gift.charisma * selectedQty)}
                            </div>
                        )}
                    </div>
                )}
                {/* ✅ COMBO BUTTON — يظهر فقط لو hasDirectTarget (من البروفايل) والهدية قابلة للإرسال */}
                {isGiftItem && isSending && directTarget && (
                    <div style={{
                        padding:'8px 14px',
                        borderTop:'1px solid rgba(255,255,255,0.06)',
                        display:'flex', flexDirection:'column', gap:'5px', alignItems:'center'
                    }}>
                        <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:600 }}>
                            {lang === 'ar' ? '⚡ كومبو — اضغط بسرعة لإرسال متتالي' : '⚡ Combo — tap fast for rapid send'}
                        </div>
                        {comboCount > 0 && (
                            <div style={{
                                fontSize:'22px', fontWeight:900,
                                color: comboCount >= 10 ? '#f59e0b' : comboCount >= 5 ? '#a78bfa' : '#00d4ff',
                                animation: 'mythic-pulse 0.5s ease-in-out',
                                textShadow: `0 0 20px currentColor`,
                            }}>
                                ×{comboCount} COMBO!
                            </div>
                        )}
                        <button
                            onPointerDown={e => { e.preventDefault(); handleComboHit(); }}
                            disabled={currency < gift.cost}
                            style={{
                                padding:'10px 24px',
                                borderRadius:'12px',
                                fontSize:'14px', fontWeight:900,
                                border:'none', cursor: currency >= gift.cost ? 'pointer' : 'not-allowed',
                                background: comboActive
                                    ? 'linear-gradient(135deg,#f59e0b,#dc2626)'
                                    : currency >= gift.cost
                                    ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                                    : 'rgba(100,100,100,0.2)',
                                color: currency >= gift.cost ? '#fff' : '#6b7280',
                                boxShadow: comboActive ? '0 0 24px rgba(245,158,11,0.7)' : '0 0 14px rgba(124,58,237,0.4)',
                                transform: comboActive ? 'scale(0.95)' : 'scale(1)',
                                transition:'all 0.1s',
                                userSelect:'none',
                                WebkitUserSelect:'none',
                                touchAction:'manipulation',
                            }}
                        >
                            🎁 {lang === 'ar' ? 'اضغط!' : 'TAP!'}
                        </button>
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
                                    ? `🎒 ${lang === 'ar' ? 'أضف للمخزون' : 'Add to Inventory'} (${(gift.cost * selectedQty).toLocaleString()}🧠)`
                                    : `${isSending || directTarget ? t.sendGift : t.buy}${selectedQty > 1 ? ` ×${selectedQty}` : ''} (${(gift.cost * selectedQty).toLocaleString()}🧠)`
                                }
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 🎁 SEND GIFT MODAL - IMPROVED WITH DIRECT TARGET
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency, friendsData }) => {
    const t = TRANSLATIONS[lang];
    const [selectedGift, setSelectedGift] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [activeGiftTab, setActiveGiftTab] = useState('all');

    if(!show) return null;

    const hasDirectTarget = targetUser && targetUser.uid !== 'self';
    const vipLevel = currentUser ? (getVIPLevel ? getVIPLevel(currentUser) : 0) : 0;

    // All gifts combined: regular + VIP (sorted by cost)
    const regularGifts = (SHOP_ITEMS.gifts || []).filter(g => !g.hidden && !g.eventOnly);
    const vipGifts     = (SHOP_ITEMS.gifts_vip || []).filter(g => !g.hidden);
    const allGifts     = activeGiftTab === 'vip' ? vipGifts : activeGiftTab === 'regular' ? regularGifts : [...regularGifts, ...vipGifts];

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{maxWidth:'400px', width:'96vw'}}>
                    <div className="modal-header">
                        <h2 className="modal-title">{t.sendGift}</h2>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    <div className="modal-body py-3">
                        {hasDirectTarget && (
                            <div className="flex items-center gap-2 mb-2 p-1.5 bg-white/5 rounded">
                                <AvatarWithFrame photoURL={targetUser.photoURL} equipped={targetUser.equipped} size="sm" />
                                <div>
                                    <div className="font-bold text-xs">{targetUser.displayName}</div>
                                    <div className="text-[9px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 text-[10px] text-yellow-400">
                            <span>🧠 {currency} {CURRENCY_NAME}</span>
                        </div>
                        {/* Gift type tabs */}
                        <div style={{display:'flex', gap:'4px', marginBottom:'8px'}}>
                            {[
                                {id:'all',     label: lang==='ar' ? '🎁 الكل' : '🎁 All'},
                                {id:'regular', label: lang==='ar' ? '🎀 عادية' : '🎀 Regular'},
                                {id:'vip',     label: lang==='ar' ? '👑 VIP' : '👑 VIP'},
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveGiftTab(tab.id)}
                                    style={{
                                        flex:1, padding:'4px 6px', borderRadius:'6px', fontSize:'10px',
                                        fontWeight:700, cursor:'pointer', border:'none',
                                        background: activeGiftTab === tab.id ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: activeGiftTab === tab.id ? '#00f2ff' : '#6b7280',
                                        borderBottom: activeGiftTab === tab.id ? '2px solid #00f2ff' : '2px solid transparent'
                                    }}
                                >{tab.label}</button>
                            ))}
                        </div>
                        {/* Gifts grid — 5 columns, scrollable */}
                        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'5px', maxHeight:'260px', overflowY:'auto'}}>
                            {allGifts.map(gift => {
                                const isVIPGift   = gift.type === 'gifts_vip';
                                const vipRequired = gift.vipMinLevel || 0;
                                const isVIPLocked = isVIPGift && vipLevel < vipRequired;
                                const canAfford   = currency >= gift.cost;
                                const glowType    = gift.vipGlowType;
                                const rKey        = getGiftRarity(gift.cost);
                                const rarity      = RARITY_CONFIG[rKey];
                                const vipCfg      = vipRequired > 0 ? VIP_CONFIG[vipRequired - 1] : null;
                                const vipColor    = vipCfg ? vipCfg.nameColor : '#7c3aed';
                                return (
                                    <button key={gift.id}
                                        onClick={() => { if (!isVIPLocked) { setSelectedGift(gift); setShowPreview(true); } }}
                                        disabled={!canAfford && !isVIPLocked}
                                        className={glowType && !isVIPLocked ? `glow-${glowType}` : ''}
                                        style={{
                                            display:'flex', flexDirection:'column', alignItems:'center',
                                            padding:'5px 3px', borderRadius:'8px', cursor: isVIPLocked ? 'default' : 'pointer',
                                            border: isVIPGift ? `1.5px solid ${vipColor}77` : `1.5px solid ${canAfford ? rarity.border : 'rgba(255,255,255,0.05)'}`,
                                            background: isVIPGift ? `linear-gradient(135deg,${vipColor}11,rgba(15,15,26,0.97))` : (canAfford ? rarity.bg : 'transparent'),
                                            opacity: (!canAfford && !isVIPLocked) ? 0.35 : isVIPLocked ? 0.6 : 1,
                                            position:'relative', transition:'transform 0.12s',
                                        }}
                                        onMouseEnter={e => { if(!isVIPLocked) e.currentTarget.style.transform='scale(1.07)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
                                    >
                                        {/* VIP badge */}
                                        {isVIPGift && (
                                            <span style={{
                                                position:'absolute', top:'2px', right:'2px',
                                                fontSize:'6px', fontWeight:900, background:vipColor, color:'#000',
                                                padding:'1px 3px', borderRadius:'3px', lineHeight:1.2
                                            }}>VIP{vipRequired}</span>
                                        )}
                                        {/* Event/Limited tags */}
                                        {gift.isEvent && !isVIPGift && <span style={{position:'absolute',top:'2px',left:'2px',fontSize:'7px',color:'#a78bfa'}}>⚡</span>}
                                        {gift.limitedTime && !isVIPGift && <span style={{position:'absolute',top:'2px',left:'2px',fontSize:'7px',color:'#f97316'}}>⏳</span>}
                                        <span style={{fontSize:'20px', lineHeight:1}}>{gift.emoji}</span>
                                        <span style={{fontSize:'7px', fontWeight:700, color:'#fbbf24', marginTop:'2px'}}>{gift.cost >= 1000 ? `${(gift.cost/1000).toFixed(gift.cost%1000===0?0:1)}k` : gift.cost}</span>
                                        {/* VIP lock overlay */}
                                        {isVIPLocked && (
                                            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',borderRadius:'7px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1px'}}>
                                                <span style={{fontSize:'10px'}}>🔒</span>
                                                <span style={{fontSize:'6px',color:vipColor,fontWeight:800}}>VIP{vipRequired}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <GiftPreviewModal
                show={showPreview}
                onClose={() => setShowPreview(false)}
                gift={selectedGift}
                lang={lang}
                onBuy={(gift, target, qty) => { onSendGift(gift, target, qty || 1); if (qty === undefined || qty === 1) onClose(); }}
                currency={currency}
                isSending={true}
                directTarget={hasDirectTarget ? targetUser : null}
                friendsData={friendsData}
                user={{ uid: currentUser?.uid }}
                currentUserData={currentUser}
            />
        </>
    );
};

// 🛒 SHOP MODAL
