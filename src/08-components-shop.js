// ���������������������������������������������������������������
// �  SHOP MODAL � Premium Dark Gaming Store
// ���������������������������������������������������������������
var ShopModal = ({ show, onClose, userData, lang, onPurchase, onEquip, onUnequip, onBuyVIP, onOpenInventory, onPropose, currentUID, coupleData, onOpenCoupleCard }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    // � Gift filter state
    const [giftSort, setGiftSort] = useState('default');
    const [giftRarityFilter, setGiftRarityFilter] = useState('all');
    const [giftVIPOnly, setGiftVIPOnly] = useState(false);
    const [showGiftFilter, setShowGiftFilter] = useState(false);
    // � VIP confirmation dialog
    const [showVIPConfirm, setShowVIPConfirm] = useState(false);

    if (!show) return null;

    const currency     = userData?.currency || 0;
    const inventory    = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped     = userData?.equipped  || {};
    const vipLevel     = getVIPLevel(userData);
    const vipXpInfo    = getVIPXPProgress(userData?.vip?.xp || 0);
    const hasVIP       = vipLevel >= 1;

    const vipExpiresAt = userData?.vip?.expiresAt;
    const vipDaysLeft = (() => {
        if (!vipExpiresAt) return null;
        const expDate = vipExpiresAt.toDate ? vipExpiresAt.toDate() : new Date(vipExpiresAt);
        const now = new Date();
        const diff = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    })();

    const isOwned    = (item) => inventory[item.type]?.includes(item.id);
    const isEquipped = (item) => {
        if (item.type === 'badges') {
            const eb = equipped.badges || [];
            return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id;
        }
        return equipped[item.type] === item.id;
    };

    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview?.startsWith('http')
            ? <img src={item.preview} alt="" style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover'}} />
            : <div style={{width:'36px',height:'36px',borderRadius:'50%',background:item.preview}} />;
        if (item.type === 'badges') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'32px',height:'32px',objectFit:'contain'}} />
            : <span style={{fontSize:'26px'}}>{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain'}} />
            : <span style={{fontSize:'22px'}}>{item.preview}</span>;
        if (item.type === 'gifts' || item.type === 'gifts_vip') return item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{width:'32px',height:'32px',objectFit:'contain'}} />
            : <span style={{fontSize:'26px'}}>{item.emoji}</span>;
        if (item.type === 'profileEffects') {
            const src = typeof item.particles === 'string' && item.particles.startsWith('http')
                ? item.particles : (item.imageUrl || null);
            return src
                ? <img src={src} alt={item.name_en} style={{width:'32px',height:'32px',objectFit:'contain',borderRadius:'6px'}} />
                : <span style={{fontSize:'26px'}}>{item.preview}</span>;
        }
        return <span style={{fontSize:'22px'}}>�</span>;
    };

    // �� تاب ا��دا�ا أُز�� �� ا�ش�ب � ا��دا�ا �تاحة ف�ط �� ا�بر�فا�� �ا�شاتات
    const tabs = [
        { id: 'red_packets',    icon: '�', label_ar: '�غ�فات',   label_en: 'Packets' },
        { id: 'rings',          icon: '��', label_ar: 'خ�ات�',     label_en: 'Rings'   },
        { id: 'bff_tokens',     icon: '�', label_ar: 'BFF',       label_en: 'BFF'     },
        { id: 'frames',         icon: '�️', label_ar: 'إطارات',   label_en: 'Frames'  },
        { id: 'titles',         icon: '���️', label_ar: 'أ��اب',    label_en: 'Titles'  },
        { id: 'badges',         icon: '��', label_ar: 'شارات',     label_en: 'Badges'  },
        { id: 'profileEffects', icon: '�', label_ar: 'تأث�رات',   label_en: 'Effects' },
    ];

    const getTabItems = (tab) => {
        if (tab === 'red_packets') {
            return typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
        }
        if (tab === 'bff_tokens') {
            // Return BFF_TOKEN_ITEMS from config (not hidden ones)
            return typeof BFF_TOKEN_ITEMS !== 'undefined' ? BFF_TOKEN_ITEMS.filter(t => !t.hidden) : [];
        }
        if (tab === 'gifts') {
            const regular  = (SHOP_ITEMS.gifts     || []).filter(item => !item.hidden);
            const vipGifts = (SHOP_ITEMS.gifts_vip || []).filter(item => !item.hidden && item.vipExclusive !== false);
            let items = giftVIPOnly ? vipGifts : [...regular, ...vipGifts];
            if (giftRarityFilter !== 'all') {
                items = items.filter(item => {
                    const rKey = item.type === 'gifts_vip' ? 'Legendary' : getGiftRarity(item.cost);
                    return rKey === giftRarityFilter;
                });
            }
            if (giftSort === 'price_desc') items = [...items].sort((a,b) => b.cost - a.cost);
            else if (giftSort === 'price_asc') items = [...items].sort((a,b) => a.cost - b.cost);
            else {
                const RARITY_ORDER = ['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
                items = [...items].sort((a,b) => {
                    const rA = RARITY_ORDER.indexOf(a.type==='gifts_vip'?'Legendary':getGiftRarity(a.cost));
                    const rB = RARITY_ORDER.indexOf(b.type==='gifts_vip'?'Legendary':getGiftRarity(b.cost));
                    return rA - rB || a.cost - b.cost;
                });
            }
            return items;
        }
        return (SHOP_ITEMS[tab] || []).filter(item => !item.hidden);
    };

    return (
    <React.Fragment>
        <div className="modal-overlay" onClick={onClose} style={{backdropFilter:'blur(6px)'}}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background:'linear-gradient(160deg,#0a0e1f 0%,#0d1225 55%,#080c1a 100%)',
                    border:'1px solid rgba(0,242,255,0.12)',
                    borderRadius:'20px',
                    width:'96vw', maxWidth:'540px',
                    maxHeight:'92vh',
                    display:'flex', flexDirection:'column',
                    overflow:'hidden',
                    boxShadow:'0 0 80px rgba(0,0,0,0.8),0 0 140px rgba(0,80,255,0.04),inset 0 1px 0 rgba(255,255,255,0.05)',
                    position:'relative',
                }}
            >
                {/* Top accent line */}
                <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:'linear-gradient(90deg,transparent,#00f2ff,#7c3aed,transparent)',zIndex:2}} />

                {/* �� HEADER �� */}
                <div style={{
                    background:'linear-gradient(135deg,rgba(0,242,255,0.055) 0%,rgba(112,0,255,0.055) 100%)',
                    borderBottom:'1px solid rgba(255,255,255,0.06)',
                    padding:'14px 16px 12px',
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    flexShrink:0,
                }}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{
                            width:'38px',height:'38px',borderRadius:'11px',
                            background:'linear-gradient(135deg,rgba(0,242,255,0.14),rgba(112,0,255,0.14))',
                            border:'1px solid rgba(0,242,255,0.2)',
                            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'19px',
                            flexShrink:0,
                        }}>�</div>
                        <div>
                            <div style={{fontSize:'15px',fontWeight:900,color:'#f1f5f9',letterSpacing:'0.2px'}}>
                                {t.shop || (lang==='ar'?'ا��تجر':'Store')}
                            </div>
                            {vipLevel > 0 && (
                                <div style={{fontSize:'9px',color:'#a78bfa',fontWeight:700,marginTop:'1px',display:'flex',alignItems:'center',gap:'4px'}}>
                                    <span style={{background:'rgba(124,58,237,0.22)',borderRadius:'4px',padding:'0 5px',lineHeight:'14px'}}>VIP {vipLevel}</span>
                                    <span style={{color:'#4b5563'}}>{vipXpInfo.progress}% � VIP {vipLevel+1}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                        <div style={{
                            display:'flex',alignItems:'center',gap:'5px',
                            background:'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.05))',
                            border:'1px solid rgba(251,191,36,0.22)',
                            borderRadius:'10px',padding:'5px 10px',
                        }}>
                            <span style={{fontSize:'13px'}}>�</span>
                            <span style={{fontSize:'12px',fontWeight:800,color:'#fbbf24'}}>{currency.toLocaleString()}</span>
                        </div>
                        {onOpenInventory && (
                            <button onClick={() => { onClose(); setTimeout(onOpenInventory,100); }}
                                title={lang==='ar'?'�خز���':'My Inventory'}
                                style={{width:'34px',height:'34px',borderRadius:'10px',background:'rgba(0,242,255,0.07)',border:'1px solid rgba(0,242,255,0.18)',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,242,255,0.17)';e.currentTarget.style.transform='scale(1.06)';}}
                                onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,242,255,0.07)';e.currentTarget.style.transform='scale(1)';}}
                            >�</button>
                        )}
                        <button onClick={onClose}
                            style={{width:'34px',height:'34px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'#6b7280',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.14)';e.currentTarget.style.color='#f87171';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#6b7280';}}
                        >�</button>
                    </div>
                </div>

                {/* �� TAB BAR �� */}
                <div style={{
                    display:'flex',overflowX:'auto',gap:'3px',
                    padding:'10px 10px 0',
                    borderBottom:'1px solid rgba(255,255,255,0.05)',
                    scrollbarWidth:'none',flexShrink:0,
                    background:'rgba(0,0,0,0.14)',
                }}>
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',
                                padding:'6px 12px 8px',borderRadius:'10px 10px 0 0',
                                fontSize:'10px',fontWeight:active?800:500,cursor:'pointer',border:'none',
                                background:active?'rgba(0,242,255,0.09)':'transparent',
                                color:active?'#00f2ff':'#4b6070',
                                borderBottom:active?'2px solid #00f2ff':'2px solid transparent',
                                transition:'all 0.18s',minWidth:'50px',
                            }}>
                                <span style={{fontSize:'16px',lineHeight:1}}>{tab.icon}</span>
                                <span>{lang==='ar'?tab.label_ar:tab.label_en}</span>
                            </button>
                        );
                    })}
                </div>

                {/* �� BODY �� */}
                <div style={{
                    flex:1,overflowY:'auto',padding:'14px',
                    scrollbarWidth:'thin',scrollbarColor:'rgba(0,242,255,0.18) transparent',
                }}>

                    {/* ���� RINGS ���� */}
                    {activeTab === 'rings' && (
                        <RingsShopSection
                            userData={userData} lang={lang} currentUID={currentUID}
                            onPropose={onPropose||(() => {})} coupleData={coupleData}
                            onOpenCoupleCard={onOpenCoupleCard}
                        />
                    )}

                    {/* ���� BFF TOKENS ���� */}
                    {activeTab === 'bff_tokens' && (
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                            {/* Info header */}
                            <div style={{
                                padding:'12px 14px', borderRadius:'14px',
                                background:'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(112,0,255,0.08))',
                                border:'1px solid rgba(167,139,250,0.3)',
                            }}>
                                <div style={{fontSize:'13px',fontWeight:800,color:'#e9d5ff',marginBottom:'4px'}}>
                                    � {lang==='ar'?'ت���ات BFF':'BFF Tokens'}
                                </div>
                                <div style={{fontSize:'11px',color:'#9ca3af',lineHeight:1.5}}>
                                    {lang==='ar'
                                        ? `اشترِ ت��� �إ�شاء ع�ا�ة صدا�ة. �د�� ${BFF_CONFIG.freeSlots} خا�ات �جا��ة.`
                                        : `Buy a token to create a friendship. You have ${BFF_CONFIG.freeSlots} free slots.`}
                                </div>
                            </div>
                            {/* Token grid */}
                            {(typeof BFF_TOKEN_ITEMS !== 'undefined' ? BFF_TOKEN_ITEMS : []).map(token => {
                                const myTokenCount = (userData?.inventory?.bff_tokens || []).filter(t => t === token.id).length;
                                const canAfford = (userData?.currency || 0) >= token.cost;
                                return (
                                    <div key={token.id} style={{
                                        padding:'14px 16px', borderRadius:'16px',
                                        background:`linear-gradient(135deg,${token.color}10,${token.color}05)`,
                                        border:`1px solid ${token.color}35`,
                                        display:'flex', alignItems:'center', gap:'14px',
                                    }}>
                                        {/* Token icon */}
                                        <div style={{
                                            width:'50px', height:'50px', flexShrink:0, borderRadius:'14px',
                                            background:`${token.color}18`, border:`1px solid ${token.color}40`,
                                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px',
                                            boxShadow:`0 0 12px ${token.glow}`,
                                        }}>
                                            {token.imageURL
                                                ? <img src={token.imageURL} alt="" style={{width:'36px',height:'36px',objectFit:'contain'}}/>
                                                : token.emoji}
                                        </div>
                                        {/* Info */}
                                        <div style={{flex:1, minWidth:0}}>
                                            <div style={{fontSize:'13px', fontWeight:800, color:'white', marginBottom:'2px'}}>
                                                {lang==='ar' ? token.name_ar : token.name_en}
                                            </div>
                                            <div style={{fontSize:'9px', color:BFF_RARITY_COLORS?.[token.rarity]||'#9ca3af', fontWeight:700, marginBottom:'3px'}}>{token.rarity}</div>
                                            <div style={{fontSize:'10px', color:'#6b7280'}}>
                                                {lang==='ar' ? token.desc_ar : token.desc_en}
                                            </div>
                                            {myTokenCount > 0 && (
                                                <div style={{fontSize:'9px', color:'#4ade80', fontWeight:700, marginTop:'3px'}}>
                                                    � {lang==='ar'?`�د�� ${myTokenCount} ت���`:`You have ${myTokenCount} token(s)`}
                                                </div>
                                            )}
                                        </div>
                                        {/* Buy button */}
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',flexShrink:0}}>
                                            <div style={{fontSize:'12px', fontWeight:800, color:'#fcd34d'}}>
                                                {token.cost.toLocaleString()} �
                                            </div>
                                            <button
                                                onClick={() => onPurchase && onPurchase(token)}
                                                disabled={!canAfford}
                                                style={{
                                                    padding:'7px 14px', borderRadius:'10px', border:'none', cursor:canAfford?'pointer':'not-allowed',
                                                    background:canAfford?`linear-gradient(135deg,${token.color},${token.color}88)`:'rgba(255,255,255,0.06)',
                                                    color:canAfford?'#000':'#4b5563',
                                                    fontSize:'11px', fontWeight:800,
                                                    boxShadow:canAfford?`0 3px 12px ${token.glow}`:'none',
                                                    transition:'all 0.2s',
                                                }}>
                                                � {lang==='ar'?'شراء':'Buy'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ���� RED PACKETS BUY ���� */}
                    {activeTab === 'red_packets' && (
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                            <div style={{padding:'12px 14px',borderRadius:'14px',background:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(185,28,28,0.06))',border:'1px solid rgba(239,68,68,0.25)'}}>
                                <div style={{fontSize:'13px',fontWeight:800,color:'#fca5a5',marginBottom:'4px'}}>� {lang==='ar'?'�غ�فات ح�راء':'Red Packets'}</div>
                                <div style={{fontSize:'11px',color:'#9ca3af',lineHeight:1.5}}>{lang==='ar'?'اشتر �غ�فا� �أرس�� �أصد�ائ� أ� ف� ا�شات � ��زع ا�رص�د ع�� ا��ست����!':'Buy a packet and send it to friends or in chat � coins split among recipients!'}</div>
                            </div>
                            {(typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map(rp => {
                                const canAfford = (userData?.currency || 0) >= rp.amount;
                                return (
                                    <div key={rp.id} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',borderRadius:'16px',background:rp.bg,border:`1px solid ${rp.border}`}}>
                                        {rp.imageURL
                                            ? <img src={rp.imageURL} alt="" style={{width:'50px',height:'50px',objectFit:'contain',flexShrink:0}}/>
                                            : <div style={{width:'50px',height:'50px',borderRadius:'14px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',flexShrink:0}}>�</div>}
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{fontSize:'13px',fontWeight:800,color:rp.color,marginBottom:'2px'}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                                            <div style={{fontSize:'10px',color:'#9ca3af',marginBottom:'2px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                                            <div style={{fontSize:'10px',color:'#fbbf24',fontWeight:700}}>{(rp.amount||0).toLocaleString()} � · {rp.maxClaims} {lang==='ar'?'است�ا�':'claims'}</div>
                                        </div>
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',flexShrink:0}}>
                                            <div style={{fontSize:'12px',fontWeight:800,color:'#fbbf24'}}>{(rp.amount||0).toLocaleString()} �</div>
                                            <button
                                                onClick={async() => {
                                                    if(!canAfford||!currentUID) return;
                                                    const uniqueId = rp.id + '_' + Date.now();
                                                    try {
                                                        await usersCollection.doc(currentUID).update({
                                                            currency: firebase.firestore.FieldValue.increment(-rp.amount),
                                                            'inventory.red_packets': firebase.firestore.FieldValue.arrayUnion(uniqueId)
                                                        });
                                                    } catch(e) { console.error('Buy RP error', e); }
                                                }}
                                                disabled={!canAfford}
                                                style={{padding:'7px 14px',borderRadius:'10px',border:'none',cursor:canAfford?'pointer':'not-allowed',background:canAfford?`linear-gradient(135deg,${rp.color},${rp.color}88)`:'rgba(255,255,255,0.06)',color:canAfford?'#000':'#4b5563',fontSize:'11px',fontWeight:800,transition:'all 0.2s'}}>
                                                � {lang==='ar'?'شراء':'Buy'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ���� VIP ���� */}
                    {activeTab === 'vip' && (
                        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

                            {/* �� Hero banner �� */}
                            <div style={{
                                borderRadius:'20px', overflow:'hidden', position:'relative',
                                background:'linear-gradient(135deg,#1a0035 0%,#2d0060 40%,#1a0035 100%)',
                                border:'1.5px solid rgba(168,85,247,0.45)',
                                boxShadow:'0 0 60px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
                                padding:'22px 18px 18px',
                            }}>
                                {/* Animated glow orbs */}
                                <div style={{position:'absolute',top:'-30px',right:'-20px',width:'140px',height:'140px',borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.35),transparent 70%)',pointerEvents:'none'}}/>
                                <div style={{position:'absolute',bottom:'-20px',left:'-20px',width:'100px',height:'100px',borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.28),transparent 70%)',pointerEvents:'none'}}/>
                                {/* Top accent */}
                                <div style={{position:'absolute',top:0,left:'10%',right:'10%',height:'2px',background:'linear-gradient(90deg,transparent,#c4b5fd,#a855f7,#c4b5fd,transparent)'}}/>

                                <div style={{position:'relative',zIndex:1}}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                            <div style={{
                                                width:'52px',height:'52px',borderRadius:'16px',
                                                background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                                                display:'flex',alignItems:'center',justifyContent:'center',
                                                fontSize:'28px',boxShadow:'0 4px 20px rgba(124,58,237,0.55)',
                                                border:'2px solid rgba(196,181,253,0.3)',
                                            }}>�</div>
                                            <div>
                                                <div style={{fontSize:'18px',fontWeight:900,color:'#f5f3ff',letterSpacing:'0.5px'}}>VIP</div>
                                                <div style={{fontSize:'11px',color:'#a78bfa',fontWeight:600,marginTop:'1px'}}>
                                                    {lang==='ar'?'�ظا� ا�ت��ز ا�حصر�':'Exclusive Premium System'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            background:'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(168,85,247,0.3))',
                                            border:'1.5px solid rgba(196,181,253,0.4)',
                                            borderRadius:'14px',padding:'6px 14px',
                                            fontSize:'16px',fontWeight:900,color:'#e9d5ff',
                                            boxShadow:'0 0 18px rgba(124,58,237,0.4)',
                                        }}>VIP {vipLevel}</div>
                                    </div>

                                    {/* XP bar */}
                                    <div style={{marginBottom:'10px'}}>
                                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#7c3aed',fontWeight:700,marginBottom:'5px'}}>
                                            <span style={{color:'#a78bfa'}}>{(userData?.vip?.xp||0).toLocaleString()} XP</span>
                                            {vipLevel<10&&<span style={{color:'#6b21a8'}}>{lang==='ar'?`ا��دف: `:'Goal: '}{VIP_XP_THRESHOLDS[vipLevel+1]?.toLocaleString()} XP � VIP {vipLevel+1}</span>}
                                            {vipLevel>=10&&<span style={{color:'#fbbf24',fontWeight:900}}>� MAX LEVEL</span>}
                                        </div>
                                        <div style={{height:'8px',borderRadius:'4px',background:'rgba(255,255,255,0.06)',overflow:'hidden',boxShadow:'inset 0 1px 3px rgba(0,0,0,0.4)'}}>
                                            <div style={{
                                                width:`${vipXpInfo.progress}%`,height:'100%',borderRadius:'4px',
                                                background:'linear-gradient(90deg,#5b21b6,#7c3aed,#a855f7,#c4b5fd)',
                                                transition:'width 0.7s ease',
                                                boxShadow:'0 0 10px rgba(168,85,247,0.7)',
                                                position:'relative',overflow:'hidden',
                                            }}>
                                                <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',animation:'shimmer 1.8s infinite'}}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feature pills */}
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                                        {[
                                            {icon:'�',ar:'اس� ���� ���ز',en:'Colored VIP Name'},
                                            {icon:'�',ar:'�ضاعف XP �1.2',en:'1.2� XP Multiplier'},
                                            {icon:'��',ar:'بادج VIP حصر�',en:'Exclusive VIP Badge'},
                                            {icon:'��',ar:'�دا�ا VIP ��ف�ة',en:'Locked VIP Gifts'},
                                            {icon:'�',ar:'تر��ة حت� VIP 10',en:'Rank up to VIP 10'},
                                            {icon:'�',ar:'�زا�ا حصر�ة ���ست��',en:'Level-exclusive perks'},
                                        ].map((f,i)=>(
                                            <div key={i} style={{
                                                display:'flex',alignItems:'center',gap:'7px',
                                                fontSize:'10px',color:'#e9d5ff',
                                                background:'rgba(124,58,237,0.12)',
                                                border:'1px solid rgba(196,181,253,0.14)',
                                                borderRadius:'9px',padding:'7px 9px',
                                            }}>
                                                <span style={{fontSize:'14px',flexShrink:0}}>{f.icon}</span>
                                                <span style={{fontWeight:600,lineHeight:1.3}}>{lang==='ar'?f.ar:f.en}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* �� Status + Action card �� */}
                            {vipLevel >= 1 ? (
                                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                    {vipDaysLeft !== null && (
                                        <div style={{
                                            borderRadius:'14px', overflow:'hidden',
                                            background: vipDaysLeft<=5
                                                ? 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(10,5,25,0.96))'
                                                : 'linear-gradient(135deg,rgba(74,222,128,0.1),rgba(10,5,25,0.96))',
                                            border: vipDaysLeft<=5 ? '1.5px solid rgba(239,68,68,0.38)' : '1.5px solid rgba(74,222,128,0.28)',
                                            boxShadow: vipDaysLeft<=5 ? '0 0 20px rgba(239,68,68,0.15)' : '0 0 20px rgba(74,222,128,0.12)',
                                        }}>
                                            <div style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                    <div style={{
                                                        width:'38px',height:'38px',borderRadius:'10px',
                                                        background:vipDaysLeft<=5?'rgba(239,68,68,0.18)':'rgba(74,222,128,0.15)',
                                                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',
                                                    }}>{vipDaysLeft<=5?'�️':'�️'}</div>
                                                    <div>
                                                        <div style={{fontSize:'12px',color:vipDaysLeft<=5?'#f87171':'#4ade80',fontWeight:800}}>
                                                            {lang==='ar'?'ا���ت ا��تب��':'Time Remaining'}
                                                        </div>
                                                        <div style={{fontSize:'9px',color:'#6b7280',marginTop:'1px'}}>
                                                            {vipDaysLeft<=5?(lang==='ar'?'� س��ت�� �ر�با�!':'� Expiring soon!'):(lang==='ar'?'� VIP �شط':'� VIP Active')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{textAlign:'center'}}>
                                                    <span style={{
                                                        fontSize:'34px',fontWeight:900,lineHeight:1,fontFamily:'monospace',
                                                        color:vipDaysLeft<=5?'#f87171':'#4ade80',
                                                        textShadow:vipDaysLeft<=5?'0 0 16px rgba(239,68,68,0.6)':'0 0 16px rgba(74,222,128,0.5)',
                                                    }}>{vipDaysLeft}</span>
                                                    <div style={{fontSize:'10px',color:'#9ca3af',fontWeight:700}}>{lang==='ar'?'���':'days'}</div>
                                                </div>
                                            </div>
                                            <div style={{height:'4px',background:'rgba(255,255,255,0.04)'}}>
                                                <div style={{height:'100%',width:`${Math.min(100,(vipDaysLeft/30)*100)}%`,background:vipDaysLeft<=5?'linear-gradient(90deg,#dc2626,#f87171)':'linear-gradient(90deg,#16a34a,#4ade80)',transition:'width 0.6s'}}/>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{
                                        display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                                        padding:'10px',borderRadius:'12px',
                                        background:(vipDaysLeft!==null&&vipDaysLeft>0)?'rgba(74,222,128,0.07)':'rgba(239,68,68,0.07)',
                                        border:(vipDaysLeft!==null&&vipDaysLeft>0)?'1px solid rgba(74,222,128,0.25)':'1px solid rgba(239,68,68,0.22)',
                                    }}>
                                        <span style={{fontSize:'16px'}}>{(vipDaysLeft!==null&&vipDaysLeft>0)?'�':'�'}</span>
                                        <span style={{fontWeight:900,fontSize:'13px',color:(vipDaysLeft!==null&&vipDaysLeft>0)?'#4ade80':'#f87171'}}>
                                            {(vipDaysLeft!==null&&vipDaysLeft>0)?(lang==='ar'?'� VIP �فع��':'� VIP ACTIVE'):(lang==='ar'?'VIP ��ت��':'VIP EXPIRED')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={()=>{ if(currency>=50000) setShowVIPConfirm(true); }}
                                        disabled={currency<50000}
                                        style={{
                                            width:'100%',padding:'13px',borderRadius:'13px',border:'none',
                                            background:currency>=50000?'linear-gradient(135deg,#5b21b6,#7c3aed,#a855f7)':'rgba(100,100,100,0.12)',
                                            color:currency>=50000?'#fff':'#4b5563',fontWeight:900,fontSize:'14px',
                                            cursor:currency>=50000?'pointer':'not-allowed',
                                            boxShadow:currency>=50000?'0 6px 24px rgba(124,58,237,0.45)':'none',
                                            transition:'all 0.2s',letterSpacing:'0.3px',
                                            position:'relative',overflow:'hidden',
                                        }}
                                    >
                                        {currency>=50000&&<div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)',animation:'shimmer 2s infinite'}}/>}
                                        <span style={{position:'relative'}}>
                                            {currency>=50000
                                                ?`� ${lang==='ar'?'تجد�د +30 ���':'Renew +30 days'} � 50,000 �`
                                                :`� ${lang==='ar'?'تحتاج':'Need'} 50,000 �`}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                    <div style={{
                                        borderRadius:'14px',padding:'14px',
                                        background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.18)',
                                        fontSize:'11px',color:'#fca5a5',textAlign:'center',lineHeight:1.6,
                                    }}>
                                        �� {lang==='ar'
                                            ?'�� �د�ة ترس��ا ت��ح� VIP XP � ���ا أرس�ت أ�ثر ارتفع �ست�ا�!'
                                            :'Every gift you send earns VIP XP � the more you give, the higher you level!'}
                                    </div>
                                    <button
                                        onClick={()=>{ if(currency>=50000) setShowVIPConfirm(true); }}
                                        disabled={currency<50000}
                                        style={{
                                            width:'100%',padding:'14px',borderRadius:'13px',border:'none',
                                            background:currency>=50000?'linear-gradient(135deg,#b91c1c,#ef4444,#f87171)':'rgba(100,100,100,0.12)',
                                            color:currency>=50000?'#fff':'#4b5563',fontWeight:900,fontSize:'15px',
                                            cursor:currency>=50000?'pointer':'not-allowed',
                                            boxShadow:currency>=50000?'0 6px 24px rgba(239,68,68,0.4)':'none',
                                            transition:'all 0.2s',position:'relative',overflow:'hidden',
                                        }}
                                    >
                                        {currency>=50000&&<div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)',animation:'shimmer 2s infinite'}}/>}
                                        <span style={{position:'relative'}}>
                                            {currency>=50000
                                                ?`� ${lang==='ar'?'اشترِ VIP 1':'Buy VIP 1'} � 50,000 �`
                                                :`� ${lang==='ar'?'تحتاج':'Need'} 50,000 � (${lang==='ar'?'�د��':'Have'}: ${currency.toLocaleString()})`}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* �� Level table �� */}
                            <div style={{borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(124,58,237,0.2)',background:'rgba(0,0,0,0.22)'}}>
                                <div style={{
                                    padding:'11px 16px',borderBottom:'1px solid rgba(124,58,237,0.15)',
                                    fontSize:'11px',fontWeight:700,color:'#7c3aed',
                                    display:'flex',alignItems:'center',gap:'7px',
                                    background:'rgba(124,58,237,0.06)',
                                }}>
                                    � {lang==='ar'?'جد�� �ست��ات VIP':'VIP Level Table'}
                                </div>
                                {VIP_CONFIG.map(cfg => {
                                    const isCurrentLevel = vipLevel===cfg.level;
                                    const isPassed       = vipLevel>cfg.level;
                                    return (
                                        <div key={cfg.level} style={{
                                            display:'flex',alignItems:'center',gap:'10px',
                                            padding:'9px 16px',
                                            borderBottom:'1px solid rgba(255,255,255,0.026)',
                                            background:isCurrentLevel?`${cfg.nameColor}0e`:'transparent',
                                        }}>
                                            <span style={{
                                                minWidth:'46px',fontWeight:900,fontSize:'11px',
                                                color:isCurrentLevel?cfg.nameColor:isPassed?'#4ade80':'#2d3748',
                                            }}>
                                                {isPassed?'�':isCurrentLevel?'�':''} VIP {cfg.level}
                                            </span>
                                            <div style={{flex:1,height:'5px',borderRadius:'3px',background:'rgba(255,255,255,0.04)',overflow:'hidden'}}>
                                                <div style={{
                                                    width:isPassed?'100%':isCurrentLevel?`${vipXpInfo.progress}%`:'0%',
                                                    height:'100%',background:cfg.nameColor,
                                                    transition:'width 0.5s',
                                                    boxShadow:isCurrentLevel?`0 0 6px ${cfg.nameColor}`:'none',
                                                    borderRadius:'3px',
                                                }}/>
                                            </div>
                                            <span style={{fontSize:'9px',color:'#374151',minWidth:'66px',textAlign:'right'}}>
                                                {VIP_XP_THRESHOLDS[cfg.level].toLocaleString()} XP
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ���� ITEMS GRID ���� */}
                    {activeTab !== 'vip' && activeTab !== 'rings' && activeTab !== 'bff_tokens' && activeTab !== 'red_packets' && (
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>

                            {/* Gift filters */}
                            {activeTab === 'gifts' && (
                                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                        <button onClick={() => setShowGiftFilter(p=>!p)} style={{
                                            display:'flex',alignItems:'center',gap:'5px',
                                            padding:'5px 11px',borderRadius:'8px',fontSize:'10px',fontWeight:700,
                                            background:showGiftFilter?'rgba(0,242,255,0.09)':'rgba(255,255,255,0.04)',
                                            border:showGiftFilter?'1px solid rgba(0,242,255,0.28)':'1px solid rgba(255,255,255,0.07)',
                                            color:showGiftFilter?'#00f2ff':'#4b6070',cursor:'pointer',transition:'all 0.15s',
                                        }}>
                                            �� {lang==='ar'?'ف�تر':'Filter'}
                                            {(giftRarityFilter!=='all'||giftVIPOnly||giftSort!=='default')&&(
                                                <span style={{background:'#ef4444',color:'#fff',borderRadius:'50%',width:'14px',height:'14px',fontSize:'8px',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>!</span>
                                            )}
                                        </button>
                                        {['default','price_asc','price_desc'].map(s=>(
                                            <button key={s} onClick={()=>setGiftSort(s)} style={{
                                                padding:'5px 9px',borderRadius:'7px',fontSize:'9px',fontWeight:700,
                                                background:giftSort===s?'rgba(251,191,36,0.1)':'rgba(255,255,255,0.04)',
                                                border:giftSort===s?'1px solid rgba(251,191,36,0.32)':'1px solid rgba(255,255,255,0.06)',
                                                color:giftSort===s?'#fbbf24':'#4b6070',cursor:'pointer',transition:'all 0.15s',
                                            }}>
                                                {s==='default'?(lang==='ar'?'افتراض�':'Default'):s==='price_asc'?'� '+(lang==='ar'?'سعر':'Price'):'� '+(lang==='ar'?'سعر':'Price')}
                                            </button>
                                        ))}
                                    </div>
                                    {showGiftFilter && (
                                        <div style={{background:'rgba(0,0,0,0.28)',border:'1px solid rgba(255,255,255,0.065)',borderRadius:'12px',padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
                                            <div>
                                                <div style={{fontSize:'9px',color:'#4b6070',fontWeight:700,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                                                    {lang==='ar'?'� ا��ادر�ة':'� Rarity'}
                                                </div>
                                                <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                                                    {['all','Common','Uncommon','Rare','Epic','Legendary','Mythic'].map(r=>{
                                                        const rc=RARITY_CONFIG[r]||{};
                                                        return (
                                                            <button key={r} onClick={()=>setGiftRarityFilter(r)} style={{
                                                                padding:'3px 9px',borderRadius:'6px',fontSize:'9px',fontWeight:700,cursor:'pointer',transition:'all 0.12s',
                                                                background:giftRarityFilter===r?(rc.bg||'rgba(0,242,255,0.13)'):'rgba(255,255,255,0.03)',
                                                                border:giftRarityFilter===r?`1px solid ${rc.border||'#00f2ff'}`:'1px solid rgba(255,255,255,0.06)',
                                                                color:giftRarityFilter===r?(rc.color||'#00f2ff'):'#4b6070',
                                                            }}>
                                                                {r==='all'?(lang==='ar'?'ا���':'All'):(rc.icon||'')+' '+(lang==='ar'?(RARITY_CONFIG[r]?.name_ar||r):(RARITY_CONFIG[r]?.name_en||r))}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                                                <button onClick={()=>setGiftVIPOnly(p=>!p)} style={{
                                                    padding:'4px 10px',borderRadius:'7px',fontSize:'10px',fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                                                    background:giftVIPOnly?'rgba(239,68,68,0.09)':'rgba(255,255,255,0.04)',
                                                    border:giftVIPOnly?'1px solid rgba(239,68,68,0.3)':'1px solid rgba(255,255,255,0.06)',
                                                    color:giftVIPOnly?'#ef4444':'#4b6070',
                                                }}>
                                                    � {lang==='ar'?'�دا�ا VIP ف�ط':'VIP Gifts Only'}
                                                </button>
                                                {(giftRarityFilter!=='all'||giftVIPOnly||giftSort!=='default')&&(
                                                    <button onClick={()=>{setGiftRarityFilter('all');setGiftVIPOnly(false);setGiftSort('default');}} style={{
                                                        padding:'4px 9px',borderRadius:'6px',fontSize:'9px',fontWeight:700,cursor:'pointer',
                                                        background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.22)',color:'#f87171',
                                                    }}>
                                                        � {lang==='ar'?'�سح ا�ف�اتر':'Clear'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Grid */}
                            <div style={{
                                display:'grid',
                                gridTemplateColumns:activeTab==='gifts'?'repeat(auto-fill,minmax(82px,1fr))':'repeat(auto-fill,minmax(106px,1fr))',
                                gap:'8px',
                            }}>
                                {getTabItems(activeTab)?.map(item => {
                                    const owned        = isOwned(item);
                                    const equippedItem = isEquipped(item);
                                    const isEventItem  = item.isEvent;
                                    const isLimited    = item.limitedTime;
                                    const isEventOnly  = item.eventOnly;

                                    /* Gift cards */
                                    if (activeTab === 'gifts') {
                                        const isVIPGift    = item.type==='gifts_vip';
                                        const vipRequired  = item.vipMinLevel||0;
                                        const isVIPLocked  = isVIPGift&&vipLevel<vipRequired;
                                        const isVIPMaxGift = isVIPGift&&vipRequired>=10;
                                        const vipGlowType  = item.vipGlowType||null;
                                        const rKey   = getGiftRarity(item.cost);
                                        const rarity = RARITY_CONFIG[rKey];
                                        const vipCfg        = vipRequired>0?VIP_CONFIG[vipRequired-1]:null;
                                        const vipGlowColor  = vipCfg?vipCfg.nameColor:'#7c3aed';
                                        const cardBorder    = isVIPGift?`1.5px solid ${vipGlowColor}66`:`1.5px solid ${rarity.border}`;
                                        const cardBg        = isVIPGift&&!isVIPLocked?`linear-gradient(145deg,${vipGlowColor}0e,rgba(8,10,28,0.98))`:rarity.bg;
                                        const hasSpecialGlow= !isVIPLocked&&vipGlowType;
                                        const cardShadow    = hasSpecialGlow?'none'
                                            :isVIPGift&&!isVIPLocked
                                                ?(isVIPMaxGift?`0 0 16px ${vipGlowColor}99,0 0 30px ${vipGlowColor}44`:`0 0 9px ${vipGlowColor}55`)
                                                :(rarity.glow&&rKey==='Mythic'?'0 0 14px rgba(255,0,85,0.6)':rarity.glow?`0 0 8px ${rarity.color}44`:'none');
                                        const glowClass = hasSpecialGlow?`glow-${vipGlowType}`:'';
                                        const cardAnim  = !hasSpecialGlow&&(
                                            (isVIPMaxGift&&!isVIPLocked)?'mythic-pulse 2s ease-in-out infinite'
                                            :(rKey==='Mythic'?'mythic-pulse 2s ease-in-out infinite':'none')
                                        );
                                        return (
                                            <div key={item.id} className={glowClass}
                                                onClick={()=>{if(!isEventOnly){setSelectedItem(item);setShowPreview(true);}}}
                                                style={{
                                                    position:'relative',cursor:isEventOnly?'default':'pointer',
                                                    border:cardBorder,background:cardBg,boxShadow:cardShadow,
                                                    borderRadius:'12px',padding:'10px 6px',
                                                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                                                    minHeight:'90px',gap:'4px',
                                                    opacity:(isEventOnly||isVIPLocked)?0.58:1,
                                                    animation:cardAnim||'none',transition:'transform 0.14s',
                                                }}
                                                onMouseEnter={e=>{if(!isEventOnly&&!isVIPLocked)e.currentTarget.style.transform='scale(1.06)';}}
                                                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}
                                            >
                                                <span style={{position:'absolute',top:'3px',left:'3px',fontSize:'8px'}}>{rarity.icon}</span>
                                                {isEventItem&&<span className="shop-event-tag">�</span>}
                                                {isLimited  &&<span className="shop-limited-tag">⏳</span>}
                                                {/* � FIX 4: Show timer badge for durationDays gifts */}
                                                {item.durationDays&&!isLimited&&(
                                                    <span style={{position:'absolute',bottom:'3px',left:'3px',fontSize:'6px',fontWeight:900,background:'rgba(245,158,11,0.85)',color:'#000',padding:'1px 3px',borderRadius:'3px'}}>
                                                        {item.durationDays}d
                                                    </span>
                                                )}
                                                {isVIPGift&&(
                                                    <span style={{position:'absolute',top:'3px',right:'3px',fontSize:'7px',fontWeight:900,background:vipGlowColor,color:'#000',padding:'1px 4px',borderRadius:'4px',boxShadow:isVIPMaxGift?`0 0 8px ${vipGlowColor}`:'none',animation:isVIPMaxGift?'mythic-pulse 2s ease-in-out infinite':'none'}}>
                                                        VIP {vipRequired}
                                                    </span>
                                                )}
                                                {item.imageUrl
                                                    ?<img src={item.imageUrl} alt="" style={{width:'32px',height:'32px',objectFit:'contain',marginBottom:'2px'}}/>
                                                    :<span style={{fontSize:'26px',lineHeight:1,marginBottom:'2px'}}>{item.emoji}</span>
                                                }
                                                <div style={{fontSize:'9px',fontWeight:800,color:'#fbbf24'}}>{item.cost.toLocaleString()}�</div>
                                                <div style={{fontSize:'8px',color:'#9ca3af'}}>+{formatCharisma(item.charisma)}⭐</div>
                                                <div style={{fontSize:'7px',color:'#a78bfa',fontWeight:700}}>+{getGiftVIPXP(item)} VXP</div>
                                                {isVIPLocked&&(
                                                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.62)',borderRadius:'10px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px'}}>
                                                        <span style={{fontSize:'16px'}}>�</span>
                                                        <span style={{fontSize:'7px',color:vipGlowColor,fontWeight:800}}>VIP {vipRequired}+</span>
                                                    </div>
                                                )}
                                                {isEventOnly&&!isVIPLocked&&(
                                                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                        <span style={{fontSize:'18px'}}>�</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    /* Non-gift cards */
                                    const rKey2   = getItemRarity(item);
                                    const rarity2 = RARITY_CONFIG[rKey2];
                                    return (
                                        <div key={item.id}
                                            onClick={()=>{if(!item.eventOnly){setSelectedItem(item);setShowPreview(true);}}}
                                            style={{
                                                position:'relative',cursor:item.eventOnly?'default':'pointer',
                                                border:`1.5px solid ${equippedItem?'rgba(0,242,255,0.45)':rarity2.border}`,
                                                background:equippedItem?'linear-gradient(145deg,rgba(0,242,255,0.07),rgba(8,10,28,0.98))':rarity2.bg,
                                                boxShadow:equippedItem?'0 0 14px rgba(0,242,255,0.22)':(rarity2.glow?`0 0 8px ${rarity2.color}33`:'none'),
                                                borderRadius:'12px',padding:'10px 8px',
                                                display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',
                                                opacity:item.eventOnly?0.58:1,
                                                transition:'transform 0.14s',
                                            }}
                                            onMouseEnter={e=>{if(!item.eventOnly)e.currentTarget.style.transform='scale(1.05)';}}
                                            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}
                                        >
                                            <span style={{position:'absolute',top:'3px',left:'3px',fontSize:'8px'}}>{rarity2.icon}</span>
                                            {item.isEvent    &&<span className="shop-event-tag">�</span>}
                                            {item.limitedTime&&<span className="shop-limited-tag">⏳</span>}
                                            {equippedItem&&<div style={{position:'absolute',top:'4px',right:'4px',width:'7px',height:'7px',borderRadius:'50%',background:'#00f2ff',boxShadow:'0 0 6px #00f2ff'}}/>}
                                            <div style={{marginTop:'4px'}}>{renderPreview(item)}</div>
                                            <div style={{fontSize:'9px',fontWeight:700,color:equippedItem?'#00f2ff':'#d1d5db',textAlign:'center',lineHeight:1.3,maxWidth:'90px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                                {lang==='ar'?item.name_ar:item.name_en}
                                            </div>
                                            {item.eventOnly ? (
                                                <div style={{fontSize:'8px',color:'#7c3aed',fontWeight:700}}>� Event</div>
                                            ) : owned ? (
                                                equippedItem
                                                    ?<button onClick={e=>{e.stopPropagation();onUnequip(item.type,item.id);}} style={{width:'100%',fontSize:'8px',padding:'3px 0',borderRadius:'5px',background:'rgba(239,68,68,0.13)',border:'1px solid rgba(239,68,68,0.32)',color:'#f87171',cursor:'pointer',fontWeight:700,transition:'all 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.22)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.13)';}}>{t.unequip}</button>
                                                    :<button onClick={e=>{e.stopPropagation();onEquip(item);}} style={{width:'100%',fontSize:'8px',padding:'3px 0',borderRadius:'5px',background:'rgba(74,222,128,0.13)',border:'1px solid rgba(74,222,128,0.32)',color:'#4ade80',cursor:'pointer',fontWeight:700,transition:'all 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(74,222,128,0.22)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(74,222,128,0.13)';}}>{t.equip}</button>
                                            ) : (
                                                <div style={{fontSize:'9px',color:'#fbbf24',fontWeight:800}}>{item.cost.toLocaleString()}�</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>{/* end body */}
            </div>
        </div>

        {/* �� VIP Confirm Dialog �� */}
        {showVIPConfirm && ReactDOM.createPortal(
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.76)',backdropFilter:'blur(7px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.MODAL_HIGH}}
                onClick={()=>setShowVIPConfirm(false)}>
                <div style={{background:'linear-gradient(135deg,#1a0533,#0d0d2b)',border:'2px solid #a855f7',borderRadius:'20px',padding:'28px',maxWidth:'300px',width:'90%',textAlign:'center',boxShadow:'0 0 60px rgba(168,85,247,0.28)'}}
                    onClick={e=>e.stopPropagation()}>
                    <div style={{fontSize:'44px',marginBottom:'10px'}}>�</div>
                    <div style={{color:'#e9d5ff',fontWeight:900,fontSize:'17px',marginBottom:'8px'}}>
                        {hasVIP?(t.renewVIP||'Renew VIP?'):(t.activateVIP||'Activate VIP?')}
                    </div>
                    <div style={{color:'#a78bfa',fontSize:'12px',marginBottom:'14px',lineHeight:1.6}}>
                        {hasVIP?(t.renewVIPDesc||'Add 30 more days to your VIP status.'):(t.activateVIPDesc||'Get 30 days of VIP perks + 5,000 XP bonus!')}
                    </div>
                    <div style={{color:'#fbbf24',fontWeight:900,fontSize:'18px',marginBottom:'22px',textShadow:'0 0 12px rgba(251,191,36,0.38)'}}>50,000 �</div>
                    <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
                        <button onClick={()=>setShowVIPConfirm(false)} style={{padding:'10px 20px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#9ca3af',fontWeight:600,cursor:'pointer'}}>{t.cancel||'Cancel'}</button>
                        <button onClick={()=>{setShowVIPConfirm(false);onBuyVIP();}} style={{padding:'10px 24px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',fontWeight:800,cursor:'pointer',boxShadow:'0 0 20px rgba(168,85,247,0.45)',fontSize:'14px'}}>{t.confirm||'Confirm'}</button>
                    </div>
                </div>
            </div>,
            document.body
        )}

        {/* �� Gift Preview Modal �� */}
        {showPreview && selectedItem && ReactDOM.createPortal(
            <GiftPreviewModal
                show={showPreview}
                onClose={()=>setShowPreview(false)}
                gift={selectedItem}
                lang={lang}
                onBuy={(item,target)=>{ if(currency>=item.cost){onPurchase(item,target);setShowPreview(false);} }}
                currency={currency}
                friendsData={[]}
                user={{uid:userData?.uid}}
                currentUserData={userData}
            />,
            document.body
        )}
    </React.Fragment>
    );
};


// ��� Reclaim Sent Packets Component ���
var eclaimSentPackets = ({ user, userData, lang, sentPackets, setSentPackets, loadingSent, setLoadingSent }) => {
    const [loaded, setLoaded] = React.useState(false);

    const loadSent = async () => {
        if(!user || loadingSent) return;
        setLoadingSent(true);
        try {
            const snap = await redPacketsCollection
                .where('senderId','==',user.uid)
                .where('status','==','active')
                .limit(10)
                .get();
            const packets = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(p => (p.claimedBy||[]).length === 0);
            setSentPackets(packets);
            setLoaded(true);
        } catch(e) {}
        setLoadingSent(false);
    };

    if (!loaded) return (
        <button onClick={loadSent} disabled={loadingSent} style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.06)',color:'#f87171',fontSize:'11px',fontWeight:700,cursor:'pointer',textAlign:'center',width:'100%'}}>
            {loadingSent ? '⏳ ...' : `� ${lang==='ar'?'عرض ا��غ�فات ا��رس�ة (استرداد)':'Show Sent Packets (Reclaim)'}`}
        </button>
    );

    if (sentPackets.length === 0) return (
        <div style={{textAlign:'center',fontSize:'10px',color:'#4b5563',padding:'6px'}}>
            {lang==='ar'?'�ا �غ�فات �رس�ة با�تظار ا�است�ا�':'No sent packets awaiting claim'}
        </div>
    );

    return (
        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginTop:'4px'}}>
            <div style={{fontSize:'11px',fontWeight:700,color:'#f87171',marginBottom:'2px'}}>
                � {lang==='ar'?'�غ�فات �رس�ة � ����� استرداد�ا':'Sent Packets � Reclaim if unclaimed'}
            </div>
            {sentPackets.map(sp => {
                const RPC = typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
                const cfg = RPC.find(r => r.id === sp.configId || sp.configId?.startsWith(r.id));
                const color = cfg?.color || '#ef4444';
                return (
                    <div key={sp.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'12px',background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)'}}>
                        <div style={{fontSize:'22px'}}>�</div>
                        <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'11px',fontWeight:700,color}}>{sp.amount?.toLocaleString()} �</div>
                            <div style={{fontSize:'9px',color:'#6b7280',marginTop:'1px'}}>
                                {lang==='ar'?'��:':'To:'} {sp.targetType==='family'?(lang==='ar'?'شات ا��ب��ة':'Family Chat'):sp.targetName||'DM'}
                            </div>
                        </div>
                        <button onClick={async()=>{
                            try {
                                // Mark as reclaimed so no one can claim it anymore
                                await redPacketsCollection.doc(sp.id).update({
                                    status:'reclaimed',
                                    remaining: 0,
                                    maxClaims: 0,
                                    reclaimedAt: TS()
                                });
                                const uniqueId = (sp.configId||'rp_600') + '_' + Date.now();
                                await usersCollection.doc(user.uid).update({
                                    'inventory.red_packets': firebase.firestore.FieldValue.arrayUnion(uniqueId)
                                });
                                setSentPackets(prev => prev.filter(p => p.id !== sp.id));
                            } catch(e){}
                        }} style={{padding:'5px 12px',borderRadius:'8px',background:'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(185,28,28,0.15))',border:'1px solid rgba(239,68,68,0.35)',color:'#f87171',fontSize:'10px',fontWeight:800,cursor:'pointer',flexShrink:0}}>
                            � {lang==='ar'?'استرداد':'Reclaim'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

// ���������������������������������������������������������������
// �  INVENTORY MODAL � Premium Dark Collection Viewer
// ���������������������������������������������������������������
var InventoryModal = ({ show, onClose, userData, lang, onEquip, onUnequip, onSendGift, friendsData, isLoggedIn, currentUserData, user, coupleData, onOpenCoupleCard, onPropose }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab]       = useState('frames');
    const [rpSendTarget, setRpSendTarget] = useState(null); // 'self' | 'family' | friendUID
    const [rpSendModal, setRpSendModal]   = useState(null); // { ...rpConfig, inventoryId }
    const [sentPackets, setSentPackets]   = useState([]); // reclaim list
    const [loadingSent, setLoadingSent]   = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [showGiftPreview, setShowGiftPreview] = useState(false);
    // � FIX 2: item details popup
    const [detailItem, setDetailItem]     = useState(null);

    if (!show) return null;

    const inventory  = userData?.inventory || { frames:[],titles:[],themes:[],badges:[],gifts:[],rings:[] };
    const equipped   = userData?.equipped  || {};
    const giftCounts = inventory.giftCounts || {};
    const myRings    = inventory.rings || [];
    const expiry     = inventory.expiry || {}; // { itemId: timestampMs }

    const getOwnedItems = (type) => {
        const ownedIds = inventory[type] || [];
        if (type === 'gifts') {
            return SHOP_ITEMS[type]?.filter(item => ownedIds.includes(item.id) && (giftCounts[item.id]||0) > 0) || [];
        }
        if (type === 'rings') {
            const uniqueIds = [...new Set(ownedIds)];
            return (typeof RINGS_DATA !== 'undefined' ? RINGS_DATA : []).filter(r => uniqueIds.includes(r.id));
        }
        return SHOP_ITEMS[type]?.filter(item => ownedIds.includes(item.id)) || [];
    };

    const isEquipped = (item) => {
        if (item.type === 'badges') { const eb=equipped.badges||[]; return Array.isArray(eb)?eb.includes(item.id):equipped.badges===item.id; }
        return equipped[item.type] === item.id;
    };
    const getEquippedBadgeCount = () => { const eb=equipped.badges||[]; return Array.isArray(eb)?eb.length:(equipped.badges?1:0); };

    // � FIX 2: days remaining helper
    const getDaysLeft = (itemId) => {
        const exp = expiry[itemId];
        if (!exp) return null;
        const ms = exp - Date.now();
        if (ms <= 0) return 0;
        return Math.ceil(ms / 86400000);
    };

    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview.startsWith('http')
            ?<img src={item.preview} alt={item.name_en} style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover'}}/>
            :<div style={{width:'40px',height:'40px',borderRadius:'50%',background:item.preview}}/>;
        if (item.type === 'badges') return item.imageUrl?<img src={item.imageUrl} alt={item.name_en} style={{width:'34px',height:'34px',objectFit:'contain'}}/>:<span style={{fontSize:'26px'}}>{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl?<img src={item.imageUrl} alt={item.name_en} style={{width:'30px',height:'30px',objectFit:'contain'}}/>:<span style={{fontSize:'24px'}}>{item.preview}</span>;
        if (item.type === 'gifts')  return item.imageUrl?<img src={item.imageUrl} alt={item.name_en} style={{width:'34px',height:'34px',objectFit:'contain'}}/>:<span style={{fontSize:'26px'}}>{item.emoji}</span>;
        if (item.type === 'profileEffects') {
            const src=typeof item.particles==='string'&&item.particles.startsWith('http')?item.particles:(item.imageUrl||null);
            return src?<img src={src} alt={item.name_en} style={{width:'38px',height:'38px',objectFit:'contain',borderRadius:'6px'}}/>:<span style={{fontSize:'28px',lineHeight:1}}>{item.preview}</span>;
        }
        return <span style={{fontSize:'24px'}}>�</span>;
    };

    // � FIX 2: Item Details Popup Component
    const ItemDetailPopup = ({ item, onClose: closePopup }) => {
        if (!item) return null;
        const daysLeft = getDaysLeft(item.id);
        const desc = lang === 'ar' ? (item.desc_ar || item.description_ar || '') : (item.desc_en || item.description_en || '');
        const name = lang === 'ar' ? item.name_ar : item.name_en;
        return (
            <div onClick={closePopup} style={{
                position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',
                display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:Z.TOOLTIP, padding:'20px',
            }}>
                <div onClick={e=>e.stopPropagation()} className="animate-pop" style={{
                    background:'linear-gradient(160deg,#0d1225,#0a0e1f)',
                    border:'1px solid rgba(0,242,255,0.18)',
                    borderRadius:'18px',padding:'18px',
                    width:'100%',maxWidth:'300px',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
                }}>
                    {/* Preview */}
                    <div style={{textAlign:'center',marginBottom:'12px'}}>
                        {renderPreview(item)}
                        <div style={{fontSize:'14px',fontWeight:900,color:'#f1f5f9',marginTop:'8px'}}>{name}</div>
                    </div>
                    {/* Description */}
                    {desc && (
                        <div style={{
                            background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'10px',padding:'10px 12px',marginBottom:'10px',
                            fontSize:'11px',color:'#9ca3af',lineHeight:1.6,textAlign:'center',
                        }}>{desc}</div>
                    )}
                    {/* Expiry info */}
                    {daysLeft !== null && (
                        <div style={{
                            display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                            padding:'8px 12px',borderRadius:'9px',marginBottom:'10px',
                            background: daysLeft <= 3 ? 'rgba(239,68,68,0.1)' : daysLeft <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(74,222,128,0.08)',
                            border: daysLeft <= 3 ? '1px solid rgba(239,68,68,0.3)' : daysLeft <= 7 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(74,222,128,0.22)',
                        }}>
                            <span style={{fontSize:'14px'}}>{daysLeft===0?'�':daysLeft<=3?'�️':daysLeft<=7?'⏳':'�'}</span>
                            <span style={{fontSize:'11px',fontWeight:700,color:daysLeft===0?'#f87171':daysLeft<=3?'#f87171':daysLeft<=7?'#fbbf24':'#4ade80'}}>
                                {daysLeft===0
                                    ?(lang==='ar'?'ا�ت�ت ا�ص�اح�ة':'Expired')
                                    :lang==='ar'
                                        ?`ت�ت�� بعد ${daysLeft} ���`
                                        :`Expires in ${daysLeft} day${daysLeft===1?'':'s'}`}
                            </span>
                        </div>
                    )}
                    {daysLeft === null && (
                        <div style={{
                            display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                            padding:'6px 10px',borderRadius:'8px',marginBottom:'10px',
                            background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',
                        }}>
                            <span style={{fontSize:'12px'}}>�️</span>
                            <span style={{fontSize:'10px',color:'#a78bfa',fontWeight:600}}>
                                {lang==='ar'?'دائ� � �ا ��ت��':'Permanent � never expires'}
                            </span>
                        </div>
                    )}
                    {/* Close */}
                    <button onClick={closePopup} style={{
                        width:'100%',padding:'9px',borderRadius:'10px',border:'none',
                        background:'rgba(255,255,255,0.06)',color:'#9ca3af',
                        fontSize:'12px',fontWeight:700,cursor:'pointer',
                    }}>
                        {lang==='ar'?'إغ�ا�':'Close'}
                    </button>
                </div>
            </div>
        );
    };

    const TABS = [
        {id:'red_packets',    icon:'�', label_ar:'�غ�فات�',  label_en:'Packets' },
        {id:'frames',         icon:'�️', label_ar:'إطارات',   label_en:'Frames'  },
        {id:'titles',         icon:'���️', label_ar:'أ��اب',    label_en:'Titles'  },
        {id:'badges',         icon:'��', label_ar:'شارات',     label_en:'Badges'  },
        {id:'profileEffects', icon:'�', label_ar:'تأث�رات',   label_en:'Effects' },
        {id:'gifts',          icon:'��', label_ar:'�دا�ا',     label_en:'Gifts'   },
        {id:'rings',          icon:'��', label_ar:'خ�ات�',     label_en:'Rings'   },
    ];
    const ownedItems = getOwnedItems(activeTab);

    return (
        <>
        <div className="modal-overlay" onClick={onClose} style={{backdropFilter:'blur(6px)'}}>
            <div onClick={e=>e.stopPropagation()} style={{
                background:'linear-gradient(160deg,#0a0e1f 0%,#0d1225 55%,#080c1a 100%)',
                border:'1px solid rgba(0,242,255,0.1)',
                borderRadius:'20px',
                width:'96vw',maxWidth:'440px',
                maxHeight:'90vh',
                display:'flex',flexDirection:'column',
                overflow:'hidden',
                boxShadow:'0 0 70px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04)',
                position:'relative',
            }}>
                {/* Top accent line */}
                <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:'linear-gradient(90deg,transparent,#00f2ff,#7c3aed,transparent)',zIndex:2}}/>

                {/* �� HEADER �� */}
                <div style={{
                    background:'linear-gradient(135deg,rgba(0,242,255,0.05) 0%,rgba(112,0,255,0.05) 100%)',
                    borderBottom:'1px solid rgba(255,255,255,0.055)',
                    padding:'14px 16px 12px',
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    flexShrink:0,
                }}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{
                            width:'38px',height:'38px',borderRadius:'11px',
                            background:'linear-gradient(135deg,rgba(0,242,255,0.11),rgba(112,0,255,0.11))',
                            border:'1px solid rgba(0,242,255,0.17)',
                            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'19px',flexShrink:0,
                        }}>�</div>
                        <div>
                            <div style={{fontSize:'15px',fontWeight:900,color:'#f1f5f9',letterSpacing:'0.2px'}}>
                                {t.myInventory||(lang==='ar'?'�خز���':'My Inventory')}
                            </div>
                            {activeTab==='badges'&&(
                                <div style={{fontSize:'9px',color:'#9ca3af',marginTop:'1px'}}>
                                    <span style={{color:'#00f2ff',fontWeight:700}}>{getEquippedBadgeCount()}</span>
                                    <span style={{color:'#374151'}}> / {MAX_BADGES} {lang==='ar'?'شارة �فع��ة':'equipped'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        style={{width:'34px',height:'34px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.065)',color:'#6b7280',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.13)';e.currentTarget.style.color='#f87171';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#6b7280';}}
                    >�</button>
                </div>

                {/* �� TAB BAR �� */}
                <div style={{display:'flex',overflowX:'auto',gap:'3px',padding:'10px 10px 0',borderBottom:'1px solid rgba(255,255,255,0.048)',scrollbarWidth:'none',flexShrink:0,background:'rgba(0,0,0,0.13)'}}>
                    {TABS.map(tab=>{
                        const active=activeTab===tab.id;
                        const cnt=tab.id==='rings'?myRings.length:getOwnedItems(tab.id).length;
                        return (
                            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',
                                padding:'5px 10px 7px',borderRadius:'10px 10px 0 0',
                                fontSize:'9px',fontWeight:active?800:500,cursor:'pointer',border:'none',
                                background:active?'rgba(0,242,255,0.085)':'transparent',
                                color:active?'#00f2ff':'#4b6070',
                                borderBottom:active?'2px solid #00f2ff':'2px solid transparent',
                                transition:'all 0.18s',minWidth:'44px',
                            }}>
                                <span style={{fontSize:'15px',lineHeight:1,position:'relative'}}>
                                    {tab.icon}
                                    {cnt>0&&<span style={{position:'absolute',top:'-4px',right:'-6px',background:active?'#00f2ff':'#1f2937',color:active?'#000':'#9ca3af',borderRadius:'8px',fontSize:'7px',fontWeight:900,padding:'0 3px',lineHeight:'12px',minWidth:'12px',textAlign:'center'}}>{cnt}</span>}
                                </span>
                                <span>{lang==='ar'?tab.label_ar:tab.label_en}</span>
                            </button>
                        );
                    })}
                </div>

                {/* �� BODY �� */}
                <div style={{flex:1,overflowY:'auto',padding:'12px',scrollbarWidth:'thin',scrollbarColor:'rgba(0,242,255,0.18) transparent'}}>

                    {/* � Red Packets */}
                    {activeTab==='red_packets'&&(()=>{
                        const myPackets = (userData?.inventory?.red_packets || []);
                        const RPC = typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : [];
                        // Support both old IDs (rp_600) and new unique IDs (rp_600_1234567890)
                        const findRpConfig = (rpId) => RPC.find(r => rpId === r.id || rpId.startsWith(r.id + '_'));
                        const myFamilyId = userData?.familyId || null;
                        return (
                            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                <div style={{fontSize:'11px',color:'#6b7280',textAlign:'center',marginBottom:'4px'}}>
                                    {lang==='ar'?'�غ�فات� ا�جا�زة ��إرسا�':'Your packets ready to send'}
                                    <span style={{color:'#fbbf24',marginRight:'6px',marginLeft:'6px',fontWeight:700}}>{myPackets.length > 0 ? `(${myPackets.length})` : ''}</span>
                                </div>
                                {myPackets.length === 0 && (
                                    <div style={{textAlign:'center',padding:'32px',color:'#4b5563'}}>
                                        <div style={{fontSize:'32px',marginBottom:'8px'}}>�</div>
                                        <div style={{fontSize:'12px'}}>{lang==='ar'?'�ا �غ�فات بعد � اشتر� �� ا��تجر':'No packets yet � buy from shop'}</div>
                                    </div>
                                )}
                                {myPackets.map((rpId, idx) => {
                                    const rp = findRpConfig(rpId);
                                    if (!rp) return null;
                                    return (
                                        <div key={rpId+'-'+idx} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'14px',background:rp.bg,border:`1px solid ${rp.border}`,boxSizing:'border-box'}}>
                                            {rp.imageURL
                                                ? <img src={rp.imageURL} alt="" style={{width:'40px',height:'40px',objectFit:'contain',flexShrink:0}}/>
                                                : <div style={{width:'40px',height:'40px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>�</div>}
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                                                <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'2px'}}>{rp.amount.toLocaleString()} � · {rp.maxClaims} {lang==='ar'?'است�ا�':'claims'}</div>
                                            </div>
                                            <button onClick={() => setRpSendModal({ ...rp, inventoryId: rpId })}
                                                style={{padding:'7px 12px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,color:rp.color,fontSize:'11px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
                                                � {lang==='ar'?'إرسا�':'Send'}
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* �� Reclaim sent packets �� */}
                                {user && (
                                    <ReclaimSentPackets
                                        user={user} userData={userData} lang={lang}
                                        sentPackets={sentPackets} setSentPackets={setSentPackets}
                                        loadingSent={loadingSent} setLoadingSent={setLoadingSent}
                                    />
                                )}

                                {/* Send RP popup */}
                                {rpSendModal && (
                                    <div style={{position:'fixed',inset:0,zIndex:Z.TOOLTIP,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
                                        <div style={{background:'linear-gradient(160deg,#0e0e22,#13122a)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'18px',padding:'20px',width:'100%',maxWidth:'340px'}} onClick={e=>e.stopPropagation()}>
                                            <div style={{fontSize:'14px',fontWeight:800,color:'#ef4444',marginBottom:'14px',textAlign:'center'}}>� {lang==='ar'?'إرسا� ا��غ�ف �����':'Send Packet To?'}</div>
                                            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'60vh',overflowY:'auto'}}>
                                                {/* Send to self */}
                                                <button onClick={async()=>{
                                                    if(!user) return;
                                                    try {
                                                        await usersCollection.doc(user.uid).update({
                                                            'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId),
                                                            currency: firebase.firestore.FieldValue.increment(rpSendModal.amount)
                                                        });
                                                        setRpSendModal(null);
                                                    } catch(e) {}
                                                }} style={{padding:'11px',borderRadius:'12px',background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.25)',color:'#00f2ff',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                                                    � {lang==='ar'?'أرس� ��فس� (است�� ا�رص�د)':'Send to myself (get coins)'}
                                                </button>
                                                {/* Send to family chat */}
                                                {myFamilyId && (
                                                    <button onClick={async()=>{
                                                        if(!user||!myFamilyId) return;
                                                        try {
                                                            const famCol = typeof familiesCollection !== 'undefined'
                                                                ? familiesCollection
                                                                : db.collection('artifacts').doc(typeof appId!=='undefined'?appId:'prospy').collection('public').doc('data').collection('families');
                                                            const rpRef = await redPacketsCollection.add({
                                                                configId:rpSendModal.id, amount:rpSendModal.amount,
                                                                senderId:user.uid, senderName:userData?.displayName||'User', senderPhoto:userData?.photoURL||null,
                                                                targetType:'family', targetId:myFamilyId,
                                                                claimedBy:[], maxClaims:rpSendModal.maxClaims||5,
                                                                remaining:rpSendModal.amount, createdAt:TS(), status:'active'
                                                            });
                                                            await usersCollection.doc(user.uid).update({'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId)});
                                                            await famCol.doc(myFamilyId).collection('messages').add({
                                                                type:'red_packet', rpId:rpRef.id, rpAmount:rpSendModal.amount,
                                                                rpConfigId:rpSendModal.id, maxClaims:rpSendModal.maxClaims||5,
                                                                senderId:user.uid, senderName:userData?.displayName||'User', senderPhoto:userData?.photoURL||null,
                                                                text:'� '+rpSendModal.amount, timestamp:TS()
                                                            });
                                                            setRpSendModal(null);
                                                        } catch(e){ console.error('Family RP send error',e); }
                                                    }} style={{padding:'11px',borderRadius:'12px',background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',justifyContent:'center'}}>
                                                        ��� {lang==='ar'?'أرس� �شات ا��ب��ة':'Send to Family Chat'}
                                                    </button>
                                                )}
                                                {/* Send to friends */}
                                                {(friendsData||[]).slice(0,6).map(friend=>{
                                                    const fid = friend.id||friend.uid;
                                                    return (
                                                        <button key={fid} onClick={async()=>{
                                                            if(!user||!fid) return;
                                                            try {
                                                                const rpRef = await redPacketsCollection.add({
                                                                    configId:rpSendModal.id, amount:rpSendModal.amount,
                                                                    senderId:user.uid, senderName:userData?.displayName||'User', senderPhoto:userData?.photoURL||null,
                                                                    targetType:'dm', targetId:fid, targetName:friend.displayName||'User',
                                                                    claimedBy:[], maxClaims:1, remaining:rpSendModal.amount,
                                                                    createdAt:TS(), status:'active'
                                                                });
                                                                await usersCollection.doc(user.uid).update({'inventory.red_packets': firebase.firestore.FieldValue.arrayRemove(rpSendModal.inventoryId)});
                                                                const chatId = [user.uid, fid].sort().join('_');
                                                                await chatsCollection.doc(chatId).collection('messages').add({
                                                                    type:'red_packet', rpId:rpRef.id, rpAmount:rpSendModal.amount,
                                                                    rpConfigId:rpSendModal.id, senderId:user.uid,
                                                                    senderName:userData?.displayName||'User', senderPhoto:userData?.photoURL||null,
                                                                    text:'� '+rpSendModal.amount, timestamp:TS(), maxClaims:1
                                                                });
                                                                setRpSendModal(null);
                                                            } catch(e) {}
                                                        }} style={{padding:'9px 12px',borderRadius:'12px',background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}>
                                                            {friend.photoURL&&<img src={friend.photoURL} alt="" style={{width:'22px',height:'22px',borderRadius:'50%',objectFit:'cover'}}/>}
                                                            <span>{friend.displayName}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button onClick={()=>setRpSendModal(null)} style={{width:'100%',marginTop:'12px',padding:'9px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',cursor:'pointer'}}>� {lang==='ar'?'إ�غاء':'Cancel'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Rings */}
                    {activeTab==='rings'&&(
                        <div>
                            {myRings.length===0?(
                                <div style={{textAlign:'center',padding:'40px 20px'}}>
                                    <div style={{fontSize:'44px',marginBottom:'12px'}}>��</div>
                                    <div style={{fontSize:'13px',color:'#374151',fontWeight:600}}>{lang==='ar'?'�ا خ�ات� ف� �خز���':'No rings in your inventory'}</div>
                                    <div style={{fontSize:'11px',color:'#1f2937',marginTop:'4px'}}>{lang==='ar'?'اشتر خ�ات� �� �تجر ا�خ�ات�':'Buy rings from the Rings shop'}</div>
                                </div>
                            ):(
                                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                    {[...new Set(myRings)].map(rid=>{
                                        const rd=typeof RINGS_DATA!=='undefined'?RINGS_DATA.find(r=>r.id===rid):null;
                                        if(!rd) return null;
                                        const count=myRings.filter(id=>id===rid).length;
                                        return (
                                            <div key={rid} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'14px',background:`linear-gradient(135deg,${rd.color}0f,${rd.color}05)`,border:`1px solid ${rd.color}32`,transition:'all 0.15s'}}
                                                onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${rd.color}1a,${rd.color}08)`;}}
                                                onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${rd.color}0f,${rd.color}05)`;}}
                                            >
                                                <div style={{flexShrink:0,width:'44px',height:'44px',display:'flex',alignItems:'center',justifyContent:'center',background:`${rd.color}10`,borderRadius:'12px',border:`1px solid ${rd.color}22`}}>
                                                    {rd.imageURL?<img src={rd.imageURL} alt="" style={{width:'34px',height:'34px',objectFit:'contain',filter:`drop-shadow(0 0 6px ${rd.glow})`}}/>:<span style={{fontSize:'26px',filter:`drop-shadow(0 0 6px ${rd.glow})`}}>{rd.emoji}</span>}
                                                </div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontSize:'13px',fontWeight:800,color:rd.color}}>{lang==='ar'?rd.name_ar:rd.name_en}</div>
                                                    <div style={{fontSize:'10px',color:'#4b5563',marginTop:'2px'}}>{rd.rarity}</div>
                                                    {count>1&&<div style={{fontSize:'10px',color:'#fcd34d',marginTop:'2px',fontWeight:700}}>�{count} {lang==='ar'?'�سخ':'copies'}</div>}
                                                </div>
                                                <button onClick={()=>{if(coupleData){onOpenCoupleCard&&onOpenCoupleCard();}else{onPropose&&onPropose(rd);}}}
                                                    style={{padding:'7px 14px',borderRadius:'10px',border:`1px solid ${rd.color}40`,background:`${rd.color}13`,color:rd.color,fontSize:'11px',fontWeight:800,cursor:'pointer',flexShrink:0,transition:'all 0.15s'}}
                                                    onMouseEnter={e=>{e.currentTarget.style.background=`${rd.color}26`;}}
                                                    onMouseLeave={e=>{e.currentTarget.style.background=`${rd.color}13`;}}
                                                >
                                                    {coupleData?(lang==='ar'?'�� أ�دِ':'�� Gift'):(lang==='ar'?'� استخد�':'� Use')}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other tabs */}
                    {activeTab!=='rings'&&(
                        ownedItems.length===0?(
                            <div style={{textAlign:'center',padding:'40px 20px'}}>
                                <div style={{fontSize:'40px',marginBottom:'10px'}}>�</div>
                                <div style={{fontSize:'12px',color:'#374151',fontWeight:600}}>{t.owned}: 0</div>
                            </div>
                        ):(
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(96px,1fr))',gap:'8px'}}>
                                {ownedItems.map(item=>{
                                    const equippedItem=isEquipped(item);
                                    const daysLeft = getDaysLeft(item.id);
                                    const isExpired = daysLeft === 0;
                                    /* Gift items */
                                    if(activeTab==='gifts'){
                                        const cnt=giftCounts[item.id]||0;
                                        return (
                                            <div key={item.id} style={{position:'relative',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.065)',borderRadius:'12px',padding:'10px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',transition:'all 0.15s',opacity:isExpired?0.5:1}}
                                                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.transform='scale(1.04)';}}
                                                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.transform='scale(1)';}}
                                            >
                                                {cnt>0&&<div style={{position:'absolute',top:'4px',right:'4px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',fontWeight:900,fontSize:'8px',padding:'1px 5px',borderRadius:'8px',boxShadow:'0 0 6px rgba(124,58,237,0.45)',zIndex:1}}>�{cnt}</div>}
                                                {/* � FIX2: info button */}
                                                <div onClick={()=>setDetailItem(item)} style={{position:'absolute',top:'4px',left:'4px',width:'14px',height:'14px',borderRadius:'50%',background:'rgba(0,242,255,0.18)',border:'1px solid rgba(0,242,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'8px',color:'#00f2ff',fontWeight:900,zIndex:2}}>i</div>
                                                {/* � FIX2: expiry badge */}
                                                {daysLeft!==null&&daysLeft>0&&(
                                                    <div style={{position:'absolute',bottom:'28px',left:'2px',background:daysLeft<=3?'rgba(239,68,68,0.9)':daysLeft<=7?'rgba(245,158,11,0.9)':'rgba(74,222,128,0.8)',borderRadius:'4px',padding:'1px 4px',fontSize:'7px',fontWeight:800,color:'#fff',zIndex:2}}>
                                                        {daysLeft}d
                                                    </div>
                                                )}
                                                <div style={{marginTop:'4px'}}>{renderPreview(item)}</div>
                                                <div style={{fontSize:'9px',fontWeight:700,color:'#d1d5db',textAlign:'center',lineHeight:1.3,maxWidth:'84px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lang==='ar'?item.name_ar:item.name_en}</div>
                                                <button onClick={()=>{setSelectedGift(item);setShowGiftPreview(true);}}
                                                    disabled={isExpired}
                                                    style={{width:'100%',padding:'4px 0',borderRadius:'6px',background:isExpired?'rgba(100,100,100,0.1)':'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))',border:isExpired?'1px solid rgba(100,100,100,0.2)':'1px solid rgba(251,191,36,0.26)',color:isExpired?'#4b5563':'#fbbf24',fontSize:'9px',fontWeight:800,cursor:isExpired?'not-allowed':'pointer',transition:'all 0.12s'}}
                                                    onMouseEnter={e=>{if(!isExpired)e.currentTarget.style.background='linear-gradient(135deg,rgba(251,191,36,0.22),rgba(245,158,11,0.12))';}}
                                                    onMouseLeave={e=>{if(!isExpired)e.currentTarget.style.background='linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))';}}
                                                >{isExpired?(lang==='ar'?'��ت��':'Expired'):t.sendGiftToFriend}</button>
                                            </div>
                                        );
                                    }
                                    /* Equippable items */
                                    return (
                                        <div key={item.id} style={{
                                            position:'relative',
                                            background:equippedItem?'linear-gradient(145deg,rgba(0,242,255,0.075),rgba(8,10,28,0.98))':'rgba(255,255,255,0.02)',
                                            border:equippedItem?'1.5px solid rgba(0,242,255,0.38)':'1px solid rgba(255,255,255,0.065)',
                                            boxShadow:equippedItem?'0 0 12px rgba(0,242,255,0.13)':'none',
                                            borderRadius:'12px',padding:'10px 8px',
                                            display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',
                                            transition:'all 0.15s',
                                            opacity:isExpired?0.5:1,
                                        }}
                                        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';}}
                                        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}
                                        >
                                            {equippedItem&&<div style={{position:'absolute',top:'5px',right:'5px',width:'7px',height:'7px',borderRadius:'50%',background:'#00f2ff',boxShadow:'0 0 6px #00f2ff'}}/>}
                                            {/* � FIX2: info button on equippable items */}
                                            <div onClick={()=>setDetailItem(item)} style={{position:'absolute',top:'4px',left:'4px',width:'14px',height:'14px',borderRadius:'50%',background:'rgba(0,242,255,0.14)',border:'1px solid rgba(0,242,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'8px',color:'#00f2ff',fontWeight:900,zIndex:2}}>i</div>
                                            {/* � FIX2: expiry badge */}
                                            {daysLeft!==null&&daysLeft>0&&(
                                                <div style={{position:'absolute',bottom:'28px',left:'2px',background:daysLeft<=3?'rgba(239,68,68,0.9)':daysLeft<=7?'rgba(245,158,11,0.9)':'rgba(74,222,128,0.8)',borderRadius:'4px',padding:'1px 4px',fontSize:'7px',fontWeight:800,color:'#fff',zIndex:2}}>
                                                    {daysLeft}d
                                                </div>
                                            )}
                                            <div style={{marginTop:'4px'}}>{renderPreview(item)}</div>
                                            <div style={{fontSize:'9px',fontWeight:700,color:equippedItem?'#00f2ff':'#d1d5db',textAlign:'center',lineHeight:1.3,maxWidth:'84px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                                {lang==='ar'?item.name_ar:item.name_en}
                                            </div>
                                            {isExpired ? (
                                                <div style={{fontSize:'8px',color:'#f87171',fontWeight:700,textAlign:'center'}}>
                                                    � {lang==='ar'?'��ت��':'Expired'}
                                                </div>
                                            ) : equippedItem?(
                                                <button onClick={()=>onUnequip(item.type,item.id)}
                                                    style={{width:'100%',padding:'4px 0',borderRadius:'6px',background:'rgba(239,68,68,0.11)',border:'1px solid rgba(239,68,68,0.28)',color:'#f87171',fontSize:'8px',fontWeight:800,cursor:'pointer',transition:'all 0.12s'}}
                                                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';}}
                                                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.11)';}}
                                                >{t.unequip}</button>
                                            ):(
                                                <button onClick={()=>onEquip(item)}
                                                    disabled={activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES}
                                                    style={{
                                                        width:'100%',padding:'4px 0',borderRadius:'6px',
                                                        background:activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES?'rgba(255,255,255,0.03)':'rgba(74,222,128,0.11)',
                                                        border:activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES?'1px solid rgba(255,255,255,0.055)':'1px solid rgba(74,222,128,0.28)',
                                                        color:activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES?'#1f2937':'#4ade80',
                                                        fontSize:'8px',fontWeight:800,
                                                        cursor:activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES?'not-allowed':'pointer',
                                                        opacity:activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES?0.45:1,
                                                        transition:'all 0.12s',
                                                    }}
                                                    onMouseEnter={e=>{if(!(activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES))e.currentTarget.style.background='rgba(74,222,128,0.2)';}}
                                                    onMouseLeave={e=>{if(!(activeTab==='badges'&&getEquippedBadgeCount()>=MAX_BADGES))e.currentTarget.style.background='rgba(74,222,128,0.11)';}}
                                                >{t.equip}</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>{/* end body */}
            </div>
        </div>

        {/* � FIX2: Item Detail Popup */}
        {detailItem && <ItemDetailPopup item={detailItem} onClose={()=>setDetailItem(null)} />}

        {/* Gift Preview Modal */}
        {showGiftPreview&&selectedGift&&(
            <GiftPreviewModal
                show={showGiftPreview}
                onClose={()=>setShowGiftPreview(false)}
                gift={selectedGift}
                lang={lang}
                onBuy={()=>{}}
                currency={userData?.currency||0}
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

// � USER PROFILE MODAL - WITH GIFT LOG
// Blocked User Item Component

