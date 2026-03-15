// ════════════════════════════════════════════════════════════════════
// 🤝 BFF SYSTEM — Friendship Relationship System  (21-bff.js)
// ════════════════════════════════════════════════════════════════════
// Load order: after 20-couples.js
// Exposes: BFFStripProfile, BFFModal, BFFCardModal
// Collections: bffCollection (defined in 01-config.js)
// ════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// 🎨 RARITY COLORS
// ─────────────────────────────────────────────
const BFF_RARITY_COLORS = {
    Common: '#9ca3af', Uncommon: '#4ade80', Rare: '#60a5fa',
    Epic: '#a78bfa', Legendary: '#ffd700', Mythic: '#f0abfc',
};

// ─────────────────────────────────────────────
// 🔧 FIRESTORE HELPERS
// ─────────────────────────────────────────────
const sendBFFRequest = async ({ fromUID, toUID, fromData, tokenId, onNotification, lang }) => {
    const token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
    if (!token) return { ok: false, err: 'No token selected' };

    // Check token in inventory
    const myBffTokens = fromData?.inventory?.bff_tokens || [];
    if (!myBffTokens.includes(tokenId)) {
        onNotification && onNotification(lang === 'ar' ? '❌ ليس لديك هذا التوكن' : '❌ You do not have this token');
        return { ok: false };
    }

    try {
        // Check existing relationship
        const [existing1, existing2] = await Promise.all([
            bffCollection.where('uid1', '==', fromUID).where('uid2', '==', toUID).where('status', 'in', ['pending','active']).get(),
            bffCollection.where('uid1', '==', toUID).where('uid2', '==', fromUID).where('status', 'in', ['pending','active']).get(),
        ]);
        if (!existing1.empty || !existing2.empty) {
            onNotification && onNotification(lang === 'ar' ? '❌ يوجد علاقة نشطة بالفعل' : '❌ Relationship already exists');
            return { ok: false };
        }

        // Check slot limit
        const [myActive1, myActive2] = await Promise.all([
            bffCollection.where('uid1', '==', fromUID).where('status', '==', 'active').get(),
            bffCollection.where('uid2', '==', fromUID).where('status', '==', 'active').get(),
        ]);
        const totalActive = (myActive1.size || 0) + (myActive2.size || 0);
        const extraSlots = fromData?.bffExtraSlots || 0;
        const maxSlots = BFF_CONFIG.freeSlots + extraSlots;
        if (totalActive >= maxSlots) {
            onNotification && onNotification(lang === 'ar'
                ? `❌ وصلت للحد الأقصى (${maxSlots} علاقات). اشترِ خانة جديدة بـ ${BFF_CONFIG.extraSlotCost} 🧠`
                : `❌ Max relationships (${maxSlots}). Buy extra slot for ${BFF_CONFIG.extraSlotCost} 🧠`);
            return { ok: false };
        }

        const batch = db.batch();
        // Remove token from inventory
        const newTokens = [...myBffTokens];
        const idx = newTokens.indexOf(tokenId);
        if (idx > -1) newTokens.splice(idx, 1);
        batch.update(usersCollection.doc(fromUID), { 'inventory.bff_tokens': newTokens });

        // Create BFF doc
        const bffRef = bffCollection.doc();
        batch.set(bffRef, {
            uid1: fromUID,
            uid2: toUID,
            status: 'pending',
            tokenId,
            cardType: token.cardType,
            requestedBy: fromUID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            acceptedAt: null,
        });
        await batch.commit();

        // Notification to target
        await notificationsCollection.add({
            toUserId: toUID,
            fromUserId: fromUID,
            fromName: fromData?.displayName || 'Someone',
            fromPhoto: fromData?.photoURL || null,
            type: 'bff_request',
            message: lang === 'ar'
                ? `🤝 ${fromData?.displayName} أرسل لك طلب صداقة ${token.name_ar}!`
                : `🤝 ${fromData?.displayName} sent you a ${token.name_en} friendship request!`,
            tokenId,
            bffDocId: bffRef.id,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
        });

        // Love bot notification
        await sendLoveBotMessage(toUID, {
            type: 'bff_request',
            fromName: fromData?.displayName || 'Someone',
            fromPhoto: fromData?.photoURL || null,
            fromUID,
            tokenName_ar: token.name_ar,
            tokenName_en: token.name_en,
            bffDocId: bffRef.id,
            lang,
        });

        onNotification && onNotification(lang === 'ar' ? '🤝 تم إرسال طلب الصداقة!' : '🤝 Friendship request sent!');
        return { ok: true, bffDocId: bffRef.id };
    } catch (e) {
        console.error('sendBFFRequest error', e);
        onNotification && onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        return { ok: false };
    }
};

const acceptBFFRequest = async ({ bffDocId, uid1, uid2, onNotification, lang }) => {
    try {
        await bffCollection.doc(bffDocId).update({
            status: 'active',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        onNotification && onNotification(lang === 'ar' ? '🤝 تم قبول طلب الصداقة!' : '🤝 Friendship accepted!');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

const declineBFFRequest = async ({ bffDocId, fromUID, tokenId, onNotification, lang }) => {
    try {
        // Refund token
        const token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
        if (token && fromUID) {
            await usersCollection.doc(fromUID).update({
                'inventory.bff_tokens': firebase.firestore.FieldValue.arrayUnion(tokenId),
            }).catch(() => {});
        }
        await bffCollection.doc(bffDocId).delete();
        onNotification && onNotification(lang === 'ar' ? 'تم الرفض وإعادة التوكن' : 'Declined & token refunded');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

const endBFFRelationship = async ({ bffDocId, onNotification, lang }) => {
    try {
        await bffCollection.doc(bffDocId).delete();
        onNotification && onNotification(lang === 'ar' ? '💔 تم إنهاء العلاقة' : '💔 Relationship ended');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

const buyBFFExtraSlot = async ({ uid, userData, onNotification, lang }) => {
    const cost = BFF_CONFIG.extraSlotCost;
    if ((userData?.currency || 0) < cost) {
        onNotification && onNotification(lang === 'ar' ? `❌ تحتاج ${cost} 🧠` : `❌ Need ${cost} 🧠`);
        return { ok: false };
    }
    try {
        await usersCollection.doc(uid).update({
            currency: firebase.firestore.FieldValue.increment(-cost),
            bffExtraSlots: firebase.firestore.FieldValue.increment(1),
        });
        onNotification && onNotification(lang === 'ar' ? '✅ تم فتح خانة جديدة!' : '✅ New slot unlocked!');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

// ─────────────────────────────────────────────
// 🤖 Love Bot message sender
// ─────────────────────────────────────────────
const sendLoveBotMessage = async (toUID, data) => {
    try {
        await botChatsCollection.add({
            botId: 'love_bot',
            toUserId: toUID,
            type: data.type,
            fromName: data.fromName || '',
            fromPhoto: data.fromPhoto || null,
            fromUID: data.fromUID || null,
            message: data.type === 'bff_request'
                ? (data.lang === 'ar'
                    ? `🤝 ${data.fromName} أرسل لك طلب علاقة "${data.tokenName_ar}"! اضغط للرد.`
                    : `🤝 ${data.fromName} sent you a "${data.tokenName_en}" relationship request! Tap to respond.`)
                : (data.type === 'proposal'
                    ? (data.lang === 'ar'
                        ? `💍 ${data.fromName} أرسل لك طلب ارتباط! اضغط للرد.`
                        : `💍 ${data.fromName} sent you a marriage proposal! Tap to respond.`)
                    : (data.message || '')),
            bffDocId: data.bffDocId || null,
            coupleDocId: data.coupleDocId || null,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
        });
    } catch (e) {}
};

// ─────────────────────────────────────────────
// 🎴 BFF CARD BACKGROUND — renders token card bg
// ─────────────────────────────────────────────
const BFFCardBackground = ({ cardType, color, glow, children }) => {
    const imgURL = BFF_CONFIG.cardImages?.[cardType] || BFF_CONFIG.cardImages?.default;
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '160px',
            borderRadius: '18px',
            overflow: 'hidden',
            background: imgURL
                ? 'transparent'
                : `linear-gradient(135deg, ${color}18, ${color}08)`,
            border: `1.5px solid ${color}55`,
            boxShadow: `0 0 24px ${glow}, 0 8px 32px rgba(0,0,0,0.6)`,
        }}>
            {imgURL && (
                <img src={imgURL} alt="" style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', borderRadius: '18px',
                    opacity: 0.85,
                }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// 👁️ BFF CARD MODAL — shows when clicking BFF strip
// ─────────────────────────────────────────────
const BFFCardModal = ({ show, onClose, bffDoc, selfData, partnerData, currentUID, lang, onNotification, viewOnly = false }) => {
    const [ending, setEnding] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);

    if (!show || !bffDoc) return null;
    const token = BFF_TOKEN_ITEMS.find(t => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];
    const isMyRelationship = bffDoc.uid1 === currentUID || bffDoc.uid2 === currentUID;
    const other = bffDoc.uid1 === currentUID ? partnerData : selfData;
    const me = bffDoc.uid1 === currentUID ? selfData : partnerData;

    const handleEnd = async () => {
        setEnding(true);
        await endBFFRelationship({ bffDocId: bffDoc.id, onNotification, lang });
        setEnding(false);
        setConfirmEnd(false);
        onClose();
    };

    return (
        <PortalModal>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 5,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: '380px',
                    background: 'linear-gradient(145deg,#0a0010,#100820)',
                    borderRadius: '24px', overflow: 'hidden',
                    boxShadow: `0 0 60px ${token.glow}, 0 30px 80px rgba(0,0,0,0.9)`,
                    border: `1px solid ${token.color}44`,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: `linear-gradient(135deg,${token.color}22,${token.color}10)`,
                        borderBottom: `1px solid ${token.color}30`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '26px', filter: `drop-shadow(0 0 8px ${token.glow})` }}>
                                {token.imageURL
                                    ? <img src={token.imageURL} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                    : token.emoji}
                            </span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>
                                    {lang === 'ar' ? token.name_ar : token.name_en}
                                </div>
                                <div style={{ fontSize: '9px', color: BFF_RARITY_COLORS[token.rarity], fontWeight: 700 }}>{token.rarity}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px',
                            color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    </div>

                    {/* Card with avatars */}
                    <div style={{ padding: '16px' }}>
                        <BFFCardBackground cardType={bffDoc.cardType || token.cardType} color={token.color} glow={token.glow}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '20px', padding: '24px 16px',
                            }}>
                                {/* Avatar 1 */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                                        border: `3px solid ${token.color}`,
                                        boxShadow: `0 0 16px ${token.glow}`,
                                    }}>
                                        {me?.photoURL
                                            ? <img src={me.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textAlign: 'center', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {me?.displayName || '—'}
                                    </span>
                                </div>

                                {/* Center icon */}
                                <div style={{
                                    fontSize: '28px',
                                    filter: `drop-shadow(0 0 12px ${token.glow})`,
                                    animation: 'float 2s ease-in-out infinite',
                                }}>
                                    {token.emoji}
                                </div>

                                {/* Avatar 2 */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                                        border: `3px solid ${token.color}`,
                                        boxShadow: `0 0 16px ${token.glow}`,
                                    }}>
                                        {other?.photoURL
                                            ? <img src={other.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textAlign: 'center', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {other?.displayName || '—'}
                                    </span>
                                </div>
                            </div>
                        </BFFCardBackground>

                        {/* End relationship button — only for members */}
                        {!viewOnly && isMyRelationship && (
                            <div style={{ marginTop: '14px' }}>
                                {!confirmEnd
                                    ? <button onClick={() => setConfirmEnd(true)} style={{
                                        width: '100%', padding: '11px', borderRadius: '12px',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        background: 'rgba(239,68,68,0.08)',
                                        color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                    }}>💔 {lang === 'ar' ? 'إنهاء العلاقة' : 'End Relationship'}</button>
                                    : <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setConfirmEnd(false)} style={{
                                            flex: 1, padding: '10px', borderRadius: '11px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)', color: '#9ca3af',
                                            fontSize: '12px', cursor: 'pointer',
                                        }}>{lang === 'ar' ? 'تراجع' : 'Cancel'}</button>
                                        <button onClick={handleEnd} disabled={ending} style={{
                                            flex: 1, padding: '10px', borderRadius: '11px', border: 'none',
                                            background: 'rgba(239,68,68,0.7)', color: 'white',
                                            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                        }}>{ending ? '⏳' : (lang === 'ar' ? '💔 تأكيد' : '💔 Confirm')}</button>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

// ─────────────────────────────────────────────
// 📋 INCOMING BFF REQUEST ITEM — standalone component
// ─────────────────────────────────────────────
const BFFRequestItem = ({ bffDoc, fromData, lang, onNotification, onDone }) => {
    const [handling, setHandling] = useState(false);
    const token = BFF_TOKEN_ITEMS.find(t => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];

    const handle = async (accept) => {
        setHandling(true);
        if (accept) {
            await acceptBFFRequest({ bffDocId: bffDoc.id, uid1: bffDoc.uid1, uid2: bffDoc.uid2, onNotification, lang });
        } else {
            await declineBFFRequest({ bffDocId: bffDoc.id, fromUID: bffDoc.uid1, tokenId: bffDoc.tokenId, onNotification, lang });
        }
        setHandling(false);
        onDone && onDone();
    };

    return (
        <div style={{
            background: `linear-gradient(135deg,${token.color}12,${token.color}06)`,
            border: `1px solid ${token.color}40`,
            borderRadius: '16px', padding: '14px 16px', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: token.glow, filter: 'blur(28px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${token.color}60`, flexShrink: 0 }}>
                    {fromData?.photoURL
                        ? <img src={fromData.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>😎</div>}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{fromData?.displayName || '—'}</div>
                    <div style={{ fontSize: '11px', color: token.color }}>🤝 {lang === 'ar' ? 'يريد صداقتك' : 'wants to be your BFF'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${token.color}15`, border: `1px solid ${token.color}40`, borderRadius: '10px', padding: '5px 10px' }}>
                    <span style={{ fontSize: '18px' }}>{token.emoji}</span>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: token.color }}>{lang === 'ar' ? token.name_ar : token.name_en}</div>
                        <div style={{ fontSize: '9px', color: BFF_RARITY_COLORS[token.rarity] }}>{token.rarity}</div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handle(false)} disabled={handling} style={{
                    flex: 1, padding: '10px', borderRadius: '11px',
                    border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)',
                    color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                }}>{handling ? '⏳' : (lang === 'ar' ? '❌ رفض' : '❌ Decline')}</button>
                <button onClick={() => handle(true)} disabled={handling} style={{
                    flex: 1, padding: '10px', borderRadius: '11px', border: 'none',
                    background: `linear-gradient(135deg,${token.color},${token.color}88)`,
                    color: '#000', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: `0 4px 16px ${token.glow}`,
                }}>{handling ? '⏳' : (lang === 'ar' ? '🤝 قبول' : '🤝 Accept')}</button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// 🤝 BFF MODAL — Full BFF management screen
// ─────────────────────────────────────────────
const BFFModal = ({
    show, onClose, lang,
    currentUID, currentUserData,
    onNotification,
    friendsData,
}) => {
    const [tab, setTab] = useState('relationships'); // 'relationships' | 'requests' | 'send'
    const [myRelationships, setMyRelationships] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [partnerProfiles, setPartnerProfiles] = useState({});
    const [requesterProfiles, setRequesterProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedToken, setSelectedToken] = useState(null);
    const [targetId, setTargetId] = useState('');
    const [targetData, setTargetData] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchErr, setSearchErr] = useState('');
    const [sending, setSending] = useState(false);
    const [buyingSlot, setBuyingSlot] = useState(false);
    const [viewCard, setViewCard] = useState(null);
    const [viewSelf, setViewSelf] = useState(null);
    const [viewPartner, setViewPartner] = useState(null);

    useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);
        const unsub1 = bffCollection
            .where('uid1', '==', currentUID).where('status', '==', 'active')
            .onSnapshot(snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMyRelationships(prev => {
                    const other = prev.filter(r => r.uid2 === currentUID);
                    const merged = [...docs, ...other];
                    merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
                    return merged;
                });
                setLoading(false);
            }, () => setLoading(false));

        const unsub2 = bffCollection
            .where('uid2', '==', currentUID).where('status', '==', 'active')
            .onSnapshot(snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMyRelationships(prev => {
                    const other = prev.filter(r => r.uid1 === currentUID);
                    const merged = [...other, ...docs];
                    merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
                    return merged;
                });
            }, () => {});

        const unsub3 = bffCollection
            .where('uid2', '==', currentUID).where('status', '==', 'pending')
            .onSnapshot(snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setPendingRequests(docs);
                const toLoad = docs.map(d => d.uid1).filter(uid => !requesterProfiles[uid]);
                if (toLoad.length > 0) {
                    Promise.all(toLoad.map(uid =>
                        usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
                    )).then(results => {
                        const map = {};
                        results.forEach(u => { if (u) map[u.id] = u; });
                        setRequesterProfiles(p => ({ ...p, ...map }));
                    });
                }
            }, () => {});

        return () => { unsub1(); unsub2(); unsub3(); };
    }, [show, currentUID]);

    // Load partner profiles
    useEffect(() => {
        if (!myRelationships.length) return;
        const toLoad = myRelationships.map(r => r.uid1 === currentUID ? r.uid2 : r.uid1).filter(uid => !partnerProfiles[uid]);
        if (!toLoad.length) return;
        Promise.all(toLoad.map(uid =>
            usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
        )).then(results => {
            const map = {};
            results.forEach(u => { if (u) map[u.id] = u; });
            setPartnerProfiles(p => ({ ...p, ...map }));
        });
    }, [myRelationships.length]);

    if (!show) return null;

    const extraSlots = currentUserData?.bffExtraSlots || 0;
    const maxSlots = BFF_CONFIG.freeSlots + extraSlots;
    const myTokens = currentUserData?.inventory?.bff_tokens || [];
    const currency = currentUserData?.currency || 0;

    const searchUser = async () => {
        if (!targetId.trim()) return;
        setSearching(true); setSearchErr(''); setTargetData(null);
        try {
            const snap = await usersCollection.where('customId', '==', targetId.trim()).limit(1).get();
            if (snap.empty) {
                setSearchErr(lang === 'ar' ? 'لم يُعثر على المستخدم' : 'User not found');
            } else {
                const d = { id: snap.docs[0].id, ...snap.docs[0].data() };
                if (d.id === currentUID) {
                    setSearchErr(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself');
                } else { setTargetData(d); }
            }
        } catch (e) { setSearchErr('Error'); }
        setSearching(false);
    };

    const handleSend = async () => {
        if (!targetData || !selectedToken || sending) return;
        setSending(true);
        await sendBFFRequest({
            fromUID: currentUID, toUID: targetData.id,
            fromData: currentUserData, tokenId: selectedToken.id,
            onNotification, lang,
        });
        setSending(false);
        setTab('relationships');
        setTargetData(null); setTargetId(''); setSelectedToken(null);
    };

    const openCard = (rel) => {
        const partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
        const partner = partnerProfiles[partnerUID];
        if (!partner) return;
        setViewCard(rel);
        setViewSelf(currentUserData);
        setViewPartner(partner);
    };

    return (
        <PortalModal>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: '480px', height: '88vh',
                    background: '#0d0d1a', borderRadius: '24px 24px 0 0',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 -10px 60px rgba(100,150,255,0.15)',
                    border: '1px solid rgba(100,150,255,0.15)', borderBottom: 'none',
                }}>
                    {/* Handle */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                        <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} />
                    </div>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px', flexShrink: 0 }}>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>🤝 {lang === 'ar' ? 'نظام BFF' : 'BFF System'}</div>
                            <div style={{ fontSize: '10px', color: '#a78bfa', marginTop: '2px' }}>
                                {myRelationships.length}/{maxSlots} {lang === 'ar' ? 'علاقات' : 'relationships'}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px',
                            color: '#9ca3af', fontSize: '18px', width: '34px', height: '34px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', flexShrink: 0 }}>
                        {[
                            { id: 'relationships', label_ar: 'علاقاتي', label_en: 'My BFFs', icon: '🤝' },
                            { id: 'requests', label_ar: 'طلبات', label_en: 'Requests', icon: '📩', badge: pendingRequests.length },
                            { id: 'send', label_ar: 'إرسال', label_en: 'Send', icon: '➕' },
                        ].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{
                                flex: 1, padding: '9px 4px', borderRadius: '12px', cursor: 'pointer',
                                background: tab === t.id ? 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))' : 'rgba(255,255,255,0.04)',
                                border: tab === t.id ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                color: tab === t.id ? '#e9d5ff' : '#6b7280',
                                fontSize: '11px', fontWeight: 700, position: 'relative',
                            }}>
                                {t.icon} {lang === 'ar' ? t.label_ar : t.label_en}
                                {t.badge > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-4px', right: '-4px',
                                        background: '#ef4444', color: 'white', borderRadius: '50%',
                                        width: '16px', height: '16px', fontSize: '9px', fontWeight: 900,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        animation: 'pulse-ring 1.2s ease-in-out infinite',
                                    }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>

                        {/* ── Relationships Tab ── */}
                        {tab === 'relationships' && (
                            loading
                                ? <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>
                                : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* Slot bar */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: '14px',
                                        background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)',
                                        marginBottom: '4px',
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>
                                            {myRelationships.length}/{maxSlots} {lang === 'ar' ? 'مستخدمة' : 'used'}
                                        </div>
                                        <button onClick={async () => { setBuyingSlot(true); await buyBFFExtraSlot({ uid: currentUID, userData: currentUserData, onNotification, lang }); setBuyingSlot(false); }}
                                            disabled={buyingSlot || currency < BFF_CONFIG.extraSlotCost}
                                            style={{
                                                padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                background: currency >= BFF_CONFIG.extraSlotCost ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'rgba(255,255,255,0.05)',
                                                color: currency >= BFF_CONFIG.extraSlotCost ? 'white' : '#4b5563',
                                                fontSize: '10px', fontWeight: 700,
                                            }}>
                                            {buyingSlot ? '⏳' : `+ ${lang === 'ar' ? 'خانة' : 'Slot'} (${BFF_CONFIG.extraSlotCost} 🧠)`}
                                        </button>
                                    </div>

                                    {myRelationships.length === 0
                                        ? <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {lang === 'ar' ? 'لا علاقات بعد — أرسل طلب صداقة!' : 'No relationships yet — send a request!'}
                                            </div>
                                        </div>
                                        : myRelationships.map(rel => {
                                            const partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
                                            const partner = partnerProfiles[partnerUID];
                                            const token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                                            return (
                                                <div key={rel.id} onClick={() => openCard(rel)} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '12px 14px', borderRadius: '16px', cursor: 'pointer',
                                                    background: `linear-gradient(135deg,${token.color}10,${token.color}05)`,
                                                    border: `1px solid ${token.color}35`,
                                                    transition: 'all 0.2s',
                                                }}>
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
                                                        border: `2px solid ${token.color}`, flexShrink: 0,
                                                    }}>
                                                        {partner?.photoURL
                                                            ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>😎</div>}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {partner?.displayName || '...'}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: token.color, fontWeight: 700 }}>
                                                            {token.emoji} {lang === 'ar' ? token.name_ar : token.name_en}
                                                        </div>
                                                    </div>
                                                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>›</span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                        )}

                        {/* ── Requests Tab ── */}
                        {tab === 'requests' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pendingRequests.length === 0
                                    ? <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📩</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            {lang === 'ar' ? 'لا طلبات واردة' : 'No pending requests'}
                                        </div>
                                    </div>
                                    : pendingRequests.map(req => (
                                        <BFFRequestItem
                                            key={req.id}
                                            bffDoc={req}
                                            fromData={requesterProfiles[req.uid1]}
                                            lang={lang}
                                            onNotification={onNotification}
                                            onDone={() => {}}
                                        />
                                    ))
                                }
                            </div>
                        )}

                        {/* ── Send Tab ── */}
                        {tab === 'send' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* My tokens */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' }}>
                                        🎟️ {lang === 'ar' ? 'توكناتي:' : 'My tokens:'}
                                        {myTokens.length === 0 && <span style={{ color: '#6b7280', fontWeight: 400, marginRight: '6px' }}> ({lang === 'ar' ? 'لا توكنات — اشترِ من المتجر' : 'No tokens — buy from Shop'})</span>}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {BFF_TOKEN_ITEMS.filter(t => myTokens.includes(t.id)).map(token => (
                                            <button key={token.id} onClick={() => setSelectedToken(token)} style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                                                background: selectedToken?.id === token.id ? `${token.color}25` : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${selectedToken?.id === token.id ? token.color : 'rgba(255,255,255,0.1)'}`,
                                                color: selectedToken?.id === token.id ? token.color : '#9ca3af',
                                                fontSize: '11px', fontWeight: 700,
                                            }}>
                                                <span>{token.emoji}</span>
                                                {lang === 'ar' ? token.name_ar : token.name_en}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Friends quick-select */}
                                {friendsData?.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' }}>
                                            👥 {lang === 'ar' ? 'أصدقاؤك:' : 'Your Friends:'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {friendsData.slice(0, 8).map(f => {
                                                const fid = f.id || f.uid;
                                                const isSelected = targetData?.id === fid;
                                                return (
                                                    <button key={fid} onClick={() => { setTargetId(f.customId || ''); setTargetData({ id: fid, ...f }); setSearchErr(''); }} style={{
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                                                        padding: '6px 8px', borderRadius: '10px', cursor: 'pointer',
                                                        border: `1px solid ${isSelected ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.1)'}`,
                                                        background: isSelected ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                                                        minWidth: '52px',
                                                    }}>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${isSelected ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.15)'}` }}>
                                                            {f.photoURL
                                                                ? <img src={f.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <div style={{ width: '100%', height: '100%', background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>😎</div>}
                                                        </div>
                                                        <span style={{ fontSize: '8px', color: isSelected ? '#e9d5ff' : '#9ca3af', fontWeight: 700, maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {f.displayName || '?'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Search by ID */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' }}>
                                        🔍 {lang === 'ar' ? 'أو ابحث بالـ ID:' : 'Or search by ID:'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input value={targetId} onChange={e => { setTargetId(e.target.value); setTargetData(null); setSearchErr(''); }}
                                            onKeyDown={e => e.key === 'Enter' && searchUser()}
                                            placeholder={lang === 'ar' ? 'الـ ID الرقمي...' : 'Numeric ID...'}
                                            style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.3)', color: 'white', fontSize: '13px', outline: 'none' }} />
                                        <button onClick={searchUser} disabled={searching} style={{
                                            padding: '10px 14px', borderRadius: '10px', border: 'none',
                                            background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
                                            color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                        }}>{searching ? '⏳' : (lang === 'ar' ? 'بحث' : 'Find')}</button>
                                    </div>
                                    {searchErr && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{searchErr}</div>}
                                    {targetData && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', marginTop: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                                {targetData.photoURL
                                                    ? <img src={targetData.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>😎</div>}
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>{targetData.displayName}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Send button */}
                                <button onClick={handleSend} disabled={!selectedToken || !targetData || sending || myTokens.length === 0}
                                    style={{
                                        width: '100%', padding: '13px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                        background: selectedToken && targetData && !sending
                                            ? `linear-gradient(135deg,${selectedToken.color},${selectedToken.color}88)`
                                            : 'rgba(255,255,255,0.06)',
                                        color: selectedToken && targetData ? '#000' : '#4b5563',
                                        fontSize: '13px', fontWeight: 800,
                                        boxShadow: selectedToken && targetData ? `0 4px 20px ${selectedToken?.glow}` : 'none',
                                    }}>
                                    {sending ? '⏳' : `🤝 ${lang === 'ar' ? 'إرسال طلب الصداقة' : 'Send Friendship Request'}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BFF Card viewer */}
            {viewCard && (
                <BFFCardModal
                    show={!!viewCard}
                    onClose={() => { setViewCard(null); setViewSelf(null); setViewPartner(null); }}
                    bffDoc={viewCard}
                    selfData={viewSelf}
                    partnerData={viewPartner}
                    currentUID={currentUID}
                    lang={lang}
                    onNotification={onNotification}
                />
            )}
        </PortalModal>
    );
};

// ─────────────────────────────────────────────
// 📌 BFF STRIP — shown in profile above Guard
// ─────────────────────────────────────────────
const BFFStripProfile = ({
    targetUID, currentUID, currentUserData, lang,
    onNotification, friendsData,
    onOpenBFFModal,  // opens BFF modal from outside (for own profile)
}) => {
    const [myRelationships, setMyRelationships] = useState([]);
    const [partnerProfiles, setPartnerProfiles] = useState({});
    const [showCard, setShowCard] = useState(false);
    const [cardDoc, setCardDoc] = useState(null);
    const [cardSelf, setCardSelf] = useState(null);
    const [cardPartner, setCardPartner] = useState(null);
    const [targetData, setTargetData] = useState(null);

    const isOwnProfile = targetUID === currentUID;

    useEffect(() => {
        if (!targetUID) return;
        const unsub1 = bffCollection.where('uid1', '==', targetUID).where('status', '==', 'active')
            .onSnapshot(snap => {
                setMyRelationships(prev => {
                    const other = prev.filter(r => r.uid2 === targetUID);
                    return [...snap.docs.map(d => ({ id: d.id, ...d.data() })), ...other];
                });
            }, () => {});
        const unsub2 = bffCollection.where('uid2', '==', targetUID).where('status', '==', 'active')
            .onSnapshot(snap => {
                setMyRelationships(prev => {
                    const other = prev.filter(r => r.uid1 === targetUID);
                    return [...other, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))];
                });
            }, () => {});

        // Load target data
        usersCollection.doc(targetUID).get().then(d => {
            if (d.exists) setTargetData({ id: d.id, ...d.data() });
        }).catch(() => {});

        return () => { unsub1(); unsub2(); };
    }, [targetUID]);

    // Load partner profiles
    useEffect(() => {
        if (!myRelationships.length) return;
        const toLoad = myRelationships.map(r => r.uid1 === targetUID ? r.uid2 : r.uid1).filter(uid => !partnerProfiles[uid]);
        if (!toLoad.length) return;
        Promise.all(toLoad.map(uid =>
            usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
        )).then(results => {
            const map = {};
            results.forEach(u => { if (u) map[u.id] = u; });
            setPartnerProfiles(p => ({ ...p, ...map }));
        });
    }, [myRelationships.length]);

    if (!myRelationships.length && !isOwnProfile) return null;

    const handleClick = () => {
        if (isOwnProfile) {
            onOpenBFFModal && onOpenBFFModal();
        } else {
            // Show first shared relationship card
            const rel = myRelationships[0];
            if (!rel) return;
            const partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
            const partner = partnerProfiles[partnerUID];
            if (!partner) return;
            setCardDoc(rel);
            setCardSelf(targetData);
            setCardPartner(partner);
            setShowCard(true);
        }
    };

    return (
        <>
            <div onClick={handleClick} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', cursor: 'pointer',
                background: 'linear-gradient(135deg,rgba(167,139,250,0.06),rgba(112,0,255,0.04))',
                borderTop: '1px solid rgba(167,139,250,0.1)',
                borderBottom: '1px solid rgba(167,139,250,0.1)',
                transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(112,0,255,0.09))'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(167,139,250,0.06),rgba(112,0,255,0.04))'}
            >
                {/* Left: BFF label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: 'linear-gradient(135deg,rgba(167,139,250,0.18),rgba(112,0,255,0.14))',
                        border: '1px solid rgba(167,139,250,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', flexShrink: 0,
                    }}>🤝</div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#e5e7eb', letterSpacing: '-0.2px' }}>BFF</div>
                        {isOwnProfile && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                fontSize: '9px', fontWeight: 700, marginTop: '2px',
                                padding: '2px 7px', borderRadius: '5px',
                                background: 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(112,0,255,0.2))',
                                border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa',
                            }}>
                                ✨ {lang === 'ar' ? 'إدارة العلاقات' : 'Manage'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: partner avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', direction: 'ltr' }}>
                        {myRelationships.slice(0, 3).map((rel, i) => {
                            const partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
                            const partner = partnerProfiles[partnerUID];
                            const token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                            return (
                                <div key={rel.id} style={{
                                    width: '26px', height: '26px', borderRadius: '50%',
                                    border: `2px solid ${token.color}`,
                                    overflow: 'hidden', flexShrink: 0,
                                    marginLeft: i > 0 ? '-6px' : '0',
                                    background: 'rgba(167,139,250,0.1)',
                                    boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                                }}>
                                    {partner?.photoURL
                                        ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤝</div>}
                                </div>
                            );
                        })}
                    </div>
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>›</span>
                </div>
            </div>

            {showCard && cardDoc && (
                <BFFCardModal
                    show={showCard}
                    onClose={() => setShowCard(false)}
                    bffDoc={cardDoc}
                    selfData={cardSelf}
                    partnerData={cardPartner}
                    currentUID={currentUID}
                    lang={lang}
                    onNotification={onNotification}
                    viewOnly={!isOwnProfile}
                />
            )}
        </>
    );
};

// ─────────────────────────────────────────────
// 🤖 BOT CHAT MODAL — Official read-only chat channels
// ─────────────────────────────────────────────
const BotChatModal = ({
    show, onClose, botId, currentUID, currentUserData, lang,
    onOpenWeddingHall, onOpenBFFModal,
}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

    const botCfg = BOT_CHATS_CONFIG.find(b => b.id === botId) || BOT_CHATS_CONFIG[0];

    useEffect(() => {
        if (!show || !currentUID || !botId) return;
        setLoading(true);
        const unsub = botChatsCollection
            .where('toUserId', '==', currentUID)
            .where('botId', '==', botId)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setMessages(msgs);
                setLoading(false);
                // Mark all as read
                snap.docs.forEach(d => {
                    if (!d.data().read) {
                        botChatsCollection.doc(d.id).update({ read: true }).catch(() => {});
                    }
                });
            }, () => setLoading(false));
        return () => unsub();
    }, [show, botId, currentUID]);

    useEffect(() => {
        if (show) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
    }, [messages.length, show]);

    if (!show) return null;

    const fmtTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        const diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
        return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
    };

    return (
        <PortalModal>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 6,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px',
            }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    display: 'flex', flexDirection: 'column',
                    width: '100%', maxWidth: '420px',
                    height: '82vh', maxHeight: '680px',
                    background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                    border: `1px solid ${botCfg.color}30`,
                    borderRadius: '20px', overflow: 'hidden',
                    boxShadow: `0 28px 70px rgba(0,0,0,0.88), 0 0 30px ${botCfg.glow}`,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 14px',
                        background: `linear-gradient(135deg,${botCfg.color}15,${botCfg.color}08)`,
                        borderBottom: `1px solid ${botCfg.color}25`, flexShrink: 0,
                    }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: `linear-gradient(135deg,${botCfg.color}30,${botCfg.color}15)`,
                                border: `2px solid ${botCfg.color}55`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', overflow: 'hidden',
                            }}>
                                {botCfg.photoURL
                                    ? <img src={botCfg.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : botCfg.emoji}
                            </div>
                            {/* Official badge */}
                            <div style={{
                                position: 'absolute', bottom: '-2px', right: '-2px',
                                background: botCfg.color, borderRadius: '50%',
                                width: '14px', height: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid rgba(5,5,18,1)', fontSize: '8px',
                            }}>✓</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
                                    {lang === 'ar' ? botCfg.name_ar : botCfg.name_en}
                                </span>
                                <span style={{
                                    fontSize: '8px', fontWeight: 900, background: botCfg.color,
                                    color: '#000', padding: '1px 5px', borderRadius: '4px',
                                }}>{lang === 'ar' ? 'رسمي' : 'OFFICIAL'}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                {lang === 'ar' ? botCfg.description_ar : botCfg.description_en}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: '14px',
                        }}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>}
                        {!loading && messages.length === 0 && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.35, paddingTop: '50px' }}>
                                <span style={{ fontSize: '40px' }}>{botCfg.emoji}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {lang === 'ar' ? 'لا رسائل بعد' : 'No messages yet'}
                                </span>
                            </div>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                display: 'flex', gap: '8px', alignItems: 'flex-end',
                            }}>
                                {/* Bot avatar */}
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                    background: `linear-gradient(135deg,${botCfg.color}30,${botCfg.color}15)`,
                                    border: `1.5px solid ${botCfg.color}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden',
                                }}>
                                    {botCfg.photoURL
                                        ? <img src={botCfg.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : botCfg.emoji}
                                </div>
                                <div style={{ maxWidth: '80%' }}>
                                    <div style={{ fontSize: '9px', color: botCfg.color, fontWeight: 700, marginBottom: '3px' }}>
                                        {lang === 'ar' ? botCfg.name_ar : botCfg.name_en}
                                    </div>
                                    {/* Message bubble */}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: '4px 14px 14px 14px',
                                        background: `linear-gradient(135deg,${botCfg.color}12,${botCfg.color}08)`,
                                        border: `1px solid ${botCfg.color}30`,
                                        fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6,
                                    }}>
                                        {msg.fromName && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: `1px solid ${botCfg.color}20` }}>
                                                {msg.fromPhoto && (
                                                    <img src={msg.fromPhoto} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                                )}
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: botCfg.color }}>{msg.fromName}</span>
                                            </div>
                                        )}
                                        <div style={{ wordBreak: 'break-word' }}>{msg.message}</div>
                                        {/* Action button for bff/proposal */}
                                        {(msg.bffDocId || msg.coupleDocId) && (
                                            <button
                                                onClick={() => {
                                                    if (msg.coupleDocId && onOpenWeddingHall) {
                                                        onClose();
                                                        setTimeout(() => onOpenWeddingHall('proposals'), 100);
                                                    } else if (msg.bffDocId && onOpenBFFModal) {
                                                        onClose();
                                                        setTimeout(() => onOpenBFFModal('requests'), 100);
                                                    }
                                                }}
                                                style={{
                                                    display: 'block', width: '100%', marginTop: '8px',
                                                    padding: '7px 12px', borderRadius: '8px', border: 'none',
                                                    background: `linear-gradient(135deg,${botCfg.color},${botCfg.color}88)`,
                                                    color: '#000', fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                                                }}>
                                                {lang === 'ar' ? '👉 الرد الآن' : '👉 Respond Now'}
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '9px', color: '#374151', marginTop: '2px', paddingLeft: '3px' }}>
                                        {fmtTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Read-only notice */}
                    <div style={{
                        padding: '10px 14px', borderTop: `1px solid ${botCfg.color}20`,
                        background: 'rgba(0,0,0,0.3)', flexShrink: 0, textAlign: 'center',
                        fontSize: '10px', color: '#4b5563',
                    }}>
                        🔒 {lang === 'ar' ? 'هذا شات رسمي للقراءة فقط' : 'This is an official read-only channel'}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};
