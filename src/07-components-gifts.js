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
    const isGiftItem = gift?.type === 'gifts';

    useEffect(() => {
        if (show && gift) {
            setSelectedFriend(directTarget || null);
            setSendMode(directTarget ? 'direct' : 'self');
            setShowFriendSelect(false);
            // Generate preview bonus
            if (gift.minBonus && gift.maxBonus) {
                setPreviewBonus(generateRandomBonus(gift.minBonus, gift.maxBonus));
            }
        }
    }, [show, gift, directTarget]);

    if(!show || !gift) return null;

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
        if (directTarget) {
            onSendFromInventory(gift, directTarget);
            onClose();
        } else if (sendMode === 'self') {
            onSendFromInventory(gift, { uid: user?.uid || 'self', displayName: currentUserData?.displayName || 'Me', photoURL: currentUserData?.photoURL });
            onClose();
        } else if (selectedFriend) {
            onSendFromInventory(gift, selectedFriend);
            onClose();
        }
    };

    const handleBuy = () => {
        if (!onBuy) return;
        if (directTarget) {
            onBuy(gift, directTarget);
        } else if (sendMode === 'self') {
            onBuy(gift, { uid: 'self', displayName: currentUserData?.displayName || 'Me' });
        } else if (selectedFriend) {
            onBuy(gift, selectedFriend);
        }
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
                                disabled={currency < gift.cost || (!directTarget && sendMode === 'others' && !selectedFriend && isGiftItem)}
                                className={`flex-1 py-1.5 rounded text-xs font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isGiftItem && !directTarget && sendMode === 'self'
                                    ? `🎒 ${lang === 'ar' ? 'أضف للمخزون' : 'Add to Inventory'} (${gift.cost}🧠)`
                                    : `${isSending || directTarget ? t.sendGift : t.buy} (${gift.cost}🧠)`
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

    if(!show) return null;

    // Determine if we have a direct target (from profile)
    const hasDirectTarget = targetUser && targetUser.uid !== 'self';

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2 className="modal-title">{t.sendGift}</h2><ModalCloseBtn onClose={onClose} /></div>
                    <div className="modal-body py-3">
                        {hasDirectTarget && (
                            <div className="flex items-center gap-2 mb-2 p-1.5 bg-white/5 rounded">
                                <AvatarWithFrame photoURL={targetUser.photoURL} equipped={targetUser.equipped} size="sm" />
                                <div><div className="font-bold text-xs">{targetUser.displayName}</div><div className="text-[9px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div></div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 text-[10px] text-yellow-400"><span>🧠 {currency} {CURRENCY_NAME}</span></div>
                        <div className="grid grid-cols-5 gap-1 max-h-[180px] overflow-y-auto">
                            {SHOP_ITEMS.gifts.map(gift => {
                                const rKey = getGiftRarity(gift.cost);
                                const rarity = RARITY_CONFIG[rKey];
                                return (
                                    <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost}
                                        className="flex flex-col items-center p-1 rounded transition"
                                        style={{ border: `1.5px solid ${currency >= gift.cost ? rarity.border : 'rgba(255,255,255,0.05)'}`, background: currency >= gift.cost ? rarity.bg : 'transparent', opacity: currency < gift.cost ? 0.4 : 1, cursor: currency < gift.cost ? 'not-allowed' : 'pointer', position: 'relative' }}
                                    >
                                        <span style={{fontSize:'18px'}}>{gift.emoji}</span>
                                        <span style={{fontSize:'8px', fontWeight:'bold', color: rarity.color}}>{lang === 'ar' ? rarity.name_ar : rarity.name_en}</span>
                                        <span style={{fontSize:'9px', fontWeight:'bold', color:'#facc15'}}>{gift.cost}</span>
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
                onBuy={(gift, target) => { onSendGift(gift, target); onClose(); }}
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
