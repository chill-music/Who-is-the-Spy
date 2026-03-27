(function() {
    var { useState, useEffect, useRef, useMemo } = React;

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
var BFF_RARITY_COLORS = {
    Common: '#9ca3af', Uncommon: '#4ade80', Rare: '#60a5fa',
    Epic: '#a78bfa', Legendary: '#ffd700', Mythic: '#f0abfc',
};

var BFF_RARITY_TO_LEVEL = {
    Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Mythic: 6,
};

// ─────────────────────────────────────────────
// ⭐ BFF LEVEL SYSTEM — gift-point based
// ─────────────────────────────────────────────
var BFF_LEVELS = [
    { level: 1, minPts: 0,     name_en: 'Friends',        name_ar: 'أصدقاء',          color: '#60a5fa', glow: 'rgba(96,165,250,0.5)',   icon: '🤝', stars: 1 },
    { level: 2, minPts: 500,   name_en: 'Close Friends',  name_ar: 'أصدقاء مقربون',   color: '#4ade80', glow: 'rgba(74,222,128,0.5)',   icon: '💚', stars: 2 },
    { level: 3, minPts: 2000,  name_en: 'Best Friends',   name_ar: 'أعز الأصدقاء',    color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',   icon: '⭐', stars: 3 },
    { level: 4, minPts: 6000,  name_en: 'Soulmates',      name_ar: 'أرواح توأم',       color: '#a78bfa', glow: 'rgba(167,139,250,0.5)', icon: '💜', stars: 4 },
    { level: 5, minPts: 15000, name_en: 'Legendary Bond', name_ar: 'رابطة أسطورية',   color: '#ffd700', glow: 'rgba(255,215,0,0.6)',    icon: '👑', stars: 5 },
    { level: 6, minPts: 40000, name_en: 'Eternal Bond',   name_ar: 'رابطة أبدية',     color: '#f0abfc', glow: 'rgba(240,171,252,0.7)', icon: '💎', stars: 6 },
];

var getBFFLevel = (giftPoints = 0) => {
    var lv = BFF_LEVELS[0];
    for (var l of BFF_LEVELS) { if (giftPoints >= l.minPts) lv = l; else break; }
    var nextIdx = BFF_LEVELS.findIndex(l => l.level === lv.level) + 1;
    var next = BFF_LEVELS[nextIdx] || null;
    var pct = next
        ? Math.min(100, Math.round(((giftPoints - lv.minPts) / (next.minPts - lv.minPts)) * 100))
        : 100;
    return { ...lv, pct, nextMinPts: next?.minPts || null, giftPoints };
};

// ─────────────────────────────────────────────
// 🎁 Update BFF gift points when gift is sent
// ─────────────────────────────────────────────
var updateBFFGiftPoints = async (senderUID, receiverUID, charismaPoints) => {
    try {
        var [snap1, snap2] = await Promise.all([
            bffCollection.where('uid1', '==', senderUID).where('uid2', '==', receiverUID).where('status', '==', 'active').limit(1).get(),
            bffCollection.where('uid1', '==', receiverUID).where('uid2', '==', senderUID).where('status', '==', 'active').limit(1).get(),
        ]);
        var doc = snap1.docs[0] || snap2.docs[0];
        if (!doc) return;
        var current = doc.data();
        var newPts = (current.giftPoints || 0) + (charismaPoints || 1);
        var newLevel = getBFFLevel(newPts).level;
        await bffCollection.doc(doc.id).update({
            giftPoints: newPts,
            level: newLevel,
        });
    } catch (e) {
        console.warn('BFF gift points update failed', e);
    }
};

// ─────────────────────────────────────────────
// 🔧 FIRESTORE HELPERS
// ─────────────────────────────────────────────
var sendBFFRequest = async ({ fromUID, toUID, fromData, tokenId, onNotification, lang }) => {
    var token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
    if (!token) return { ok: false, err: 'No token selected' };

    // Check token in inventory
    var myBffTokens = fromData?.inventory?.bff_tokens || [];
    if (!myBffTokens.includes(tokenId)) {
        onNotification && onNotification(lang === 'ar' ? '❌ ليس لديك هذا التوكن' : '❌ You do not have this token');
        return { ok: false };
    }

    try {
        // ── Simple single-field queries only (no composite index needed) ──
        var [myAsUid1, myAsUid2] = await Promise.all([
            bffCollection.where('uid1', '==', fromUID).get(),
            bffCollection.where('uid2', '==', fromUID).get(),
        ]);
        var allMyDocs = [
            ...myAsUid1.docs.map(d => ({ id: d.id, ...d.data() })),
            ...myAsUid2.docs.map(d => ({ id: d.id, ...d.data() })),
        ];

        // Check existing relationship with toUID
        var alreadyExists = allMyDocs.some(r =>
            (r.uid1 === toUID || r.uid2 === toUID) &&
            (r.status === 'pending' || r.status === 'active')
        );
        if (alreadyExists) {
            onNotification && onNotification(lang === 'ar' ? '❌ يوجد علاقة نشطة بالفعل' : '❌ Relationship already exists');
            return { ok: false };
        }

        // Check slot limit (count active only)
        var totalActive = allMyDocs.filter(r => r.status === 'active').length;
        var extraSlots = fromData?.bffExtraSlots || 0;
        var maxSlots = BFF_CONFIG.freeSlots + extraSlots;
        if (totalActive >= maxSlots) {
            onNotification && onNotification(lang === 'ar'
                ? `❌ وصلت للحد الأقصى (${maxSlots} علاقات). اشترِ خانة جديدة بـ ${BFF_CONFIG.extraSlotCost} 🧠`
                : `❌ Max relationships (${maxSlots}). Buy extra slot for ${BFF_CONFIG.extraSlotCost} 🧠`);
            return { ok: false };
        }

        // ── Write: update inventory + create BFF doc separately (no batch to avoid permission complexity) ──
        // Remove token from inventory
        var newTokens = [...myBffTokens];
        var idx = newTokens.indexOf(tokenId);
        if (idx > -1) newTokens.splice(idx, 1);
        await usersCollection.doc(fromUID).update({ 'inventory.bff_tokens': newTokens });

        // Create BFF doc
        var bffRef = await bffCollection.add({
            uid1: fromUID,
            uid2: toUID,
            status: 'pending',
            tokenId,
            cardType: token.cardType,
            requestedBy: fromUID,
            createdAt: TS(),
            acceptedAt: null,
        });

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
            timestamp: TS(),
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

var acceptBFFRequest = async ({ bffDocId, uid1, uid2, onNotification, lang }) => {
    try {
        await bffCollection.doc(bffDocId).update({
            status: 'active',
            acceptedAt: TS(),
        });
        onNotification && onNotification(lang === 'ar' ? '🤝 تم قبول طلب الصداقة!' : '🤝 Friendship accepted!');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

var declineBFFRequest = async ({ bffDocId, fromUID, tokenId, onNotification, lang }) => {
    try {
        // Refund token
        var token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
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

var endBFFRelationship = async ({ bffDocId, onNotification, lang }) => {
    try {
        await bffCollection.doc(bffDocId).delete();
        onNotification && onNotification(lang === 'ar' ? '💔 تم إنهاء العلاقة' : '💔 Relationship ended');
        return { ok: true };
    } catch (e) {
        return { ok: false };
    }
};

var buyBFFExtraSlot = async ({ uid, userData, onNotification, lang }) => {
    var cost = BFF_CONFIG.extraSlotCost;
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
var sendLoveBotMessage = async (toUID, data) => {
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
            timestamp: TS(),
            read: false,
        });
    } catch (e) {}
};

// ─────────────────────────────────────────────
// 👁️ BFF CARD MODAL — shows when clicking BFF strip
// ─────────────────────────────────────────────
var BFFCardModal = ({ show, onClose, bffDoc, selfData, partnerData, currentUID, lang, onNotification, viewOnly = false }) => {
    var [ending, setEnding] = useState(false);
    var [confirmEnd, setConfirmEnd] = useState(false);

    if (!show || !bffDoc) return null;
    var token = BFF_TOKEN_ITEMS.find(t => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];
    var isMyRelationship = bffDoc.uid1 === currentUID || bffDoc.uid2 === currentUID;
    var other = bffDoc.uid1 === currentUID ? partnerData : selfData;
    var me = bffDoc.uid1 === currentUID ? selfData : partnerData;

    // Level info
    var lvInfo = getBFFLevel(bffDoc.giftPoints || 0);
    var levelColors = ['#60a5fa','#4ade80','#f59e0b','#a78bfa','#ffd700','#f0abfc'];
    var levelColor = levelColors[(lvInfo.level - 1)] || '#60a5fa';

    var handleEnd = async () => {
        setEnding(true);
        await endBFFRelationship({ bffDocId: bffDoc.id, onNotification, lang });
        setEnding(false);
        setConfirmEnd(false);
        onClose();
    };

    // Stars row
    var StarsRow = ({ count, color }) => (
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} style={{
                    fontSize: '11px',
                    filter: i < count ? `drop-shadow(0 0 4px ${color})` : 'none',
                    opacity: i < count ? 1 : 0.2,
                }}>★</span>
            ))}
        </div>
    );

    return (
        <PortalModal>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 5,
                background: 'rgba(0,0,0,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: '360px',
                    background: 'linear-gradient(160deg,#0c0018,#110a22)',
                    borderRadius: '26px', overflow: 'hidden',
                    boxShadow: `0 0 80px ${lvInfo.glow}, 0 30px 80px rgba(0,0,0,0.9)`,
                    border: `1.5px solid ${lvInfo.color}50`,
                }}>

                    {/* ── Top gradient header ── */}
                    <div style={{
                        padding: '18px 18px 14px',
                        background: `linear-gradient(135deg,${lvInfo.color}28,${lvInfo.color}10,transparent)`,
                        borderBottom: `1px solid ${lvInfo.color}28`,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* glow blob */}
                        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: lvInfo.glow, filter: 'blur(50px)', pointerEvents: 'none', opacity: 0.5 }} />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Level badge */}
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '14px',
                                    background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}88)`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 16px ${lvInfo.glow}`,
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#000', letterSpacing: '0.5px' }}>LV</span>
                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#000', lineHeight: 1 }}>{lvInfo.level}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                                        {lang === 'ar' ? lvInfo.name_ar : lvInfo.name_en}
                                    </div>
                                    <div style={{ fontSize: '10px', color: lvInfo.color, fontWeight: 700, marginTop: '2px' }}>
                                        {token.emoji} {lang === 'ar' ? token.name_ar : token.name_en}
                                    </div>
                                    <StarsRow count={lvInfo.level} color={lvInfo.color} />
                                </div>
                            </div>
                            <button onClick={onClose} style={{
                                background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '9px',
                                color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>✕</button>
                        </div>
                    </div>

                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                        {/* ── Relationship Card ── */}
                        <div style={{
                            borderRadius: '18px', overflow: 'hidden', position: 'relative',
                            background: `linear-gradient(145deg,${token.color}35,${token.color}15)`,
                            border: `1.5px solid ${token.color}60`,
                            boxShadow: `0 0 24px ${token.glow}55`,
                            padding: '20px 14px 14px',
                        }}>
                            {/* Pattern overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: `repeating-linear-gradient(45deg, ${token.color}07 0, transparent 12px, ${token.color}04 12px, transparent 24px)`,
                                pointerEvents: 'none',
                            }} />

                            {/* Decorative glow top */}
                            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', background: token.glow, filter: 'blur(20px)', opacity: 0.45, pointerEvents: 'none' }} />

                            {/* Avatars row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                {/* Left avatar */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
                                        border: `3px solid ${token.color}`,
                                        boxShadow: `0 0 18px ${token.glow}`,
                                    }}>
                                        {me?.photoURL
                                            ? <img src={me.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                                        {me?.displayName || '—'}
                                    </span>
                                </div>

                                {/* Center: token icon + level icon */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ fontSize: '32px', filter: `drop-shadow(0 0 14px ${token.glow})`, animation: 'float 2.2s ease-in-out infinite' }}>
                                        {token.imageURL
                                            ? <img src={token.imageURL} alt="" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                                            : token.emoji}
                                    </div>
                                    <div style={{
                                        background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}88)`,
                                        color: '#000', fontSize: '8px', fontWeight: 900,
                                        padding: '2px 7px', borderRadius: '10px',
                                        boxShadow: `0 2px 8px ${lvInfo.glow}`,
                                    }}>LV{lvInfo.level} {lvInfo.icon}</div>
                                </div>

                                {/* Right avatar */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
                                        border: `3px solid ${token.color}`,
                                        boxShadow: `0 0 18px ${token.glow}`,
                                    }}>
                                        {other?.photoURL
                                            ? <img src={other.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                                        {other?.displayName || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Level Progress ── */}
                        <div style={{
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${lvInfo.color}30`,
                            padding: '12px 14px',
                        }}>
                            {/* Level row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '15px' }}>{lvInfo.icon}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: lvInfo.color }}>
                                        {lang === 'ar' ? `المستوى ${lvInfo.level}` : `Level ${lvInfo.level}`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                        {(bffDoc.giftPoints || 0).toLocaleString()}
                                    </span>
                                    {lvInfo.nextMinPts && (
                                        <span style={{ fontSize: '10px', color: '#4b5563' }}>
                                            / {lvInfo.nextMinPts.toLocaleString()} ⭐
                                        </span>
                                    )}
                                    {!lvInfo.nextMinPts && (
                                        <span style={{ fontSize: '10px', color: lvInfo.color, fontWeight: 700 }}>MAX</span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '8px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.07)',
                                overflow: 'hidden', marginBottom: '8px',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${lvInfo.pct}%`,
                                    borderRadius: '8px',
                                    background: `linear-gradient(90deg, ${lvInfo.color}99, ${lvInfo.color})`,
                                    boxShadow: `0 0 8px ${lvInfo.glow}`,
                                    transition: 'width 0.6s ease',
                                }} />
                            </div>

                            {/* All level milestones */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {BFF_LEVELS.map(l => {
                                    var reached = (bffDoc.giftPoints || 0) >= l.minPts;
                                    var isCurrent = l.level === lvInfo.level;
                                    return (
                                        <div key={l.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: reached
                                                    ? `linear-gradient(135deg,${l.color},${l.color}88)`
                                                    : 'rgba(255,255,255,0.06)',
                                                border: isCurrent
                                                    ? `2px solid ${l.color}`
                                                    : `1.5px solid ${reached ? l.color + '60' : 'rgba(255,255,255,0.1)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '10px',
                                                boxShadow: isCurrent ? `0 0 8px ${l.glow}` : 'none',
                                            }}>
                                                {reached ? l.icon : <span style={{ fontSize: '8px', color: '#374151', fontWeight: 800 }}>{l.level}</span>}
                                            </div>
                                            <span style={{ fontSize: '6px', color: reached ? l.color : '#374151', fontWeight: 700 }}>LV{l.level}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Next level hint */}
                            {lvInfo.nextMinPts && (
                                <div style={{ marginTop: '8px', fontSize: '9px', color: '#4b5563', textAlign: 'center' }}>
                                    {lang === 'ar'
                                        ? `🎁 تحتاج ${(lvInfo.nextMinPts - (bffDoc.giftPoints || 0)).toLocaleString()} نقطة للمستوى التالي`
                                        : `🎁 ${(lvInfo.nextMinPts - (bffDoc.giftPoints || 0)).toLocaleString()} pts needed for next level`}
                                </div>
                            )}
                        </div>

                        {/* End relationship button */}
                        {!viewOnly && isMyRelationship && (
                            <div>
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
var BFFRequestItem = ({ bffDoc, fromData, lang, onNotification, onDone }) => {
    var [handling, setHandling] = useState(false);
    var token = BFF_TOKEN_ITEMS.find(t => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];

    var handle = async (accept) => {
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
var BFFModal = ({
    show, onClose, lang,
    currentUID, currentUserData,
    onNotification,
    friendsData,
    coupleData,
    couplePartnerData,
}) => {
    var [tab, setTab] = useState('relationships'); // 'relationships' | 'requests' | 'send'
    var [myRelationships, setMyRelationships] = useState([]);
    var [pendingRequests, setPendingRequests] = useState([]);
    var [partnerProfiles, setPartnerProfiles] = useState({});
    var [requesterProfiles, setRequesterProfiles] = useState({});
    var [loading, setLoading] = useState(true);
    var [selectedToken, setSelectedToken] = useState(null);
    var [targetId, setTargetId] = useState('');
    var [targetData, setTargetData] = useState(null);
    var [searching, setSearching] = useState(false);
    var [searchErr, setSearchErr] = useState('');
    var [sending, setSending] = useState(false);
    var [buyingSlot, setBuyingSlot] = useState(false);
    var [viewCard, setViewCard] = useState(null);
    var [viewSelf, setViewSelf] = useState(null);
    var [viewPartner, setViewPartner] = useState(null);

    useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);

        // ── Single-field queries only (no composite indexes needed) ──
        var unsub1 = bffCollection
            .where('uid1', '==', currentUID)
            .onSnapshot(snap => {
                var docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Filter active client-side
                var active = docs.filter(r => r.status === 'active');
                setMyRelationships(prev => {
                    var other = prev.filter(r => r.uid2 === currentUID);
                    var merged = [...active, ...other];
                    merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
                    return merged;
                });
                setLoading(false);
            }, () => setLoading(false));

        var unsub2 = bffCollection
            .where('uid2', '==', currentUID)
            .onSnapshot(snap => {
                var docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                var active = docs.filter(r => r.status === 'active');
                var pending = docs.filter(r => r.status === 'pending');
                setMyRelationships(prev => {
                    var other = prev.filter(r => r.uid1 === currentUID);
                    var merged = [...other, ...active];
                    merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
                    return merged;
                });
                setPendingRequests(pending);
                var toLoad = pending.map(d => d.uid1).filter(uid => !requesterProfiles[uid]);
                if (toLoad.length > 0) {
                    Promise.all(toLoad.map(uid =>
                        usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
                    )).then(results => {
                        var map = {};
                        results.forEach(u => { if (u) map[u.id] = u; });
                        setRequesterProfiles(p => ({ ...p, ...map }));
                    });
                }
            }, () => {});

        return () => { unsub1(); unsub2(); };
    }, [show, currentUID]);

    // Load partner profiles
    useEffect(() => {
        if (!myRelationships.length) return;
        var toLoad = myRelationships.map(r => r.uid1 === currentUID ? r.uid2 : r.uid1).filter(uid => !partnerProfiles[uid]);
        if (!toLoad.length) return;
        Promise.all(toLoad.map(uid =>
            usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
        )).then(results => {
            var map = {};
            results.forEach(u => { if (u) map[u.id] = u; });
            setPartnerProfiles(p => ({ ...p, ...map }));
        });
    }, [myRelationships.length]);

    if (!show) return null;

    var extraSlots = currentUserData?.bffExtraSlots || 0;
    var maxSlots = BFF_CONFIG.freeSlots + extraSlots;
    var myTokens = currentUserData?.inventory?.bff_tokens || [];
    var currency = currentUserData?.currency || 0;

    var searchUser = async () => {
        if (!targetId.trim()) return;
        setSearching(true); setSearchErr(''); setTargetData(null);
        try {
            var snap = await usersCollection.where('customId', '==', targetId.trim()).limit(1).get();
            if (snap.empty) {
                setSearchErr(lang === 'ar' ? 'لم يُعثر على المستخدم' : 'User not found');
            } else {
                var d = { id: snap.docs[0].id, ...snap.docs[0].data() };
                if (d.id === currentUID) {
                    setSearchErr(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself');
                } else { setTargetData(d); }
            }
        } catch (e) { setSearchErr('Error'); }
        setSearching(false);
    };

    var handleSend = async () => {
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

    var openCard = (rel) => {
        var partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
        var partner = partnerProfiles[partnerUID];
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
                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>❤️ {lang === 'ar' ? 'BFF الخاص بي' : 'My BFF'}</div>
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
                                : <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                                    {/* ── CP Banner ── */}
                                    {coupleData && couplePartnerData && (() => {
                                        var ring = typeof RINGS_DATA !== 'undefined'
                                            ? RINGS_DATA.find(r => r.id === coupleData.ringId)
                                            : null;
                                        var diff = coupleData?.marriageDate
                                            ? (() => { var s = coupleData.marriageDate.toDate ? coupleData.marriageDate.toDate() : new Date(coupleData.marriageDate.seconds * 1000); return Math.floor((Date.now() - s.getTime()) / 86400000); })()
                                            : 0;
                                        // CP level from LOVE_LEVELS if available
                                        var cpLevel = 1;
                                        if (typeof LOVE_LEVELS !== 'undefined') {
                                            var lv = 1;
                                            for (var l of LOVE_LEVELS) { if (diff >= l.days) lv++; else break; }
                                            cpLevel = lv;
                                        }
                                        return (
                                            <div style={{
                                                borderRadius: '16px', overflow: 'hidden',
                                                background: 'linear-gradient(135deg, #f9a8d4, #ec4899, #be185d)',
                                                padding: '14px 12px',
                                                position: 'relative',
                                            }}>
                                                {/* Decorative sparkles */}
                                                <div style={{ position: 'absolute', top: 6, left: 10, fontSize: '10px', opacity: 0.6 }}>✦</div>
                                                <div style={{ position: 'absolute', top: 8, right: 14, fontSize: '8px', opacity: 0.5 }}>✦</div>
                                                <div style={{ position: 'absolute', bottom: 10, left: 20, fontSize: '7px', opacity: 0.4 }}>✦</div>
                                                <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '9px', opacity: 0.5 }}>✦</div>

                                                {/* CP Level badge */}
                                                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                                                        color: '#fff', fontSize: '11px', fontWeight: 900,
                                                        padding: '3px 14px', borderRadius: '20px',
                                                        boxShadow: '0 2px 10px rgba(168,85,247,0.5)',
                                                    }}>CP LV{cpLevel}</span>
                                                </div>

                                                {/* Avatars + Ring */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
                                                    {/* Left user */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                        <div style={{
                                                            width: '60px', height: '60px', borderRadius: '50%',
                                                            border: '3px solid rgba(255,255,255,0.7)',
                                                            overflow: 'hidden', background: 'rgba(255,255,255,0.2)',
                                                            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                                                        }}>
                                                            {currentUserData?.photoURL
                                                                ? <img src={currentUserData.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>😊</div>}
                                                        </div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', maxWidth: '70px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {currentUserData?.displayName || '...'}
                                                        </div>
                                                    </div>

                                                    {/* Ring center */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                                                        <div style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.5))' }}>
                                                            {ring?.imageURL
                                                                ? <img src={ring.imageURL} alt="" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                                                                : (ring?.emoji || '💍')}
                                                        </div>
                                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'center' }}>
                                                            {lang === 'ar' ? `معاً ${diff} يوم` : `Be together ${diff} days`}
                                                        </div>
                                                    </div>

                                                    {/* Right user */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                        <div style={{
                                                            width: '60px', height: '60px', borderRadius: '50%',
                                                            border: '3px solid rgba(255,255,255,0.7)',
                                                            overflow: 'hidden', background: 'rgba(255,255,255,0.2)',
                                                            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                                                        }}>
                                                            {couplePartnerData?.photoURL
                                                                ? <img src={couplePartnerData.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>😊</div>}
                                                        </div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', maxWidth: '70px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {couplePartnerData?.displayName || '...'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* ── BFF Cards Grid ── */}
                                    {myRelationships.length === 0 && !coupleData
                                        ? <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {lang === 'ar' ? 'لا علاقات بعد — أرسل طلب صداقة!' : 'No relationships yet — send a request!'}
                                            </div>
                                        </div>
                                        : <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '12px 10px',
                                        }}>
                                            {myRelationships.map(rel => {
                                                var partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
                                                var partner = partnerProfiles[partnerUID];
                                                var token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                                                var lvInfo = getBFFLevel(rel.giftPoints || 0);
                                                return (
                                                    <div key={rel.id} onClick={() => openCard(rel)} style={{
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                        cursor: 'pointer',
                                                    }}>
                                                        {/* Card */}
                                                        <div style={{
                                                            width: '100%', height: '110px',
                                                            borderRadius: '14px', position: 'relative',
                                                            background: `linear-gradient(145deg, ${token.color}38, ${token.color}18)`,
                                                            border: `1.5px solid ${token.color}60`,
                                                            boxShadow: `0 4px 16px ${token.glow}40`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            overflow: 'visible',
                                                        }}>
                                                            {/* Diamond pattern */}
                                                            <div style={{
                                                                position: 'absolute', inset: 0, borderRadius: '12px',
                                                                background: `repeating-linear-gradient(45deg, ${token.color}0a 0, transparent 10px, ${token.color}05 10px, transparent 20px)`,
                                                                overflow: 'hidden', pointerEvents: 'none',
                                                            }} />
                                                            {/* LV badge — real earned level */}
                                                            <div style={{
                                                                position: 'absolute', top: '6px', left: '6px',
                                                                background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}aa)`,
                                                                borderRadius: '6px', padding: '2px 6px',
                                                                fontSize: '7px', fontWeight: 900, color: '#000',
                                                                display: 'flex', alignItems: 'center', gap: '2px',
                                                                boxShadow: `0 2px 6px ${lvInfo.glow}`, zIndex: 2,
                                                            }}>
                                                                <span>{lvInfo.icon}</span>
                                                                <span>LV{lvInfo.level}</span>
                                                            </div>
                                                            {/* Token icon */}
                                                            <span style={{ fontSize: '32px', zIndex: 1 }}>
                                                                {token.imageURL
                                                                    ? <img src={token.imageURL} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                                                                    : token.emoji}
                                                            </span>
                                                            {/* Avatar overlapping bottom */}
                                                            <div style={{
                                                                position: 'absolute', bottom: '-16px',
                                                                width: '34px', height: '34px', borderRadius: '50%',
                                                                border: `2.5px solid ${lvInfo.color}`,
                                                                overflow: 'hidden', background: '#0d0d1a',
                                                                boxShadow: `0 2px 10px rgba(0,0,0,0.5), 0 0 6px ${lvInfo.glow}`,
                                                                zIndex: 3,
                                                            }}>
                                                                {partner?.photoURL
                                                                    ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>😎</div>}
                                                            </div>
                                                        </div>
                                                        {/* Name */}
                                                        <div style={{
                                                            marginTop: '20px',
                                                            fontSize: '10px', fontWeight: 600,
                                                            color: '#d1d5db', textAlign: 'center',
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            width: '100%',
                                                        }}>
                                                            {partner?.displayName || '...'}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* ── Locked slots ── */}
                                            {Array.from({ length: Math.max(0, maxSlots - myRelationships.length) }).map((_, i) => (
                                                <div key={`locked-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '100%', height: '110px',
                                                        borderRadius: '14px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1.5px dashed rgba(255,255,255,0.12)',
                                                        display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    }}>
                                                        <div style={{ fontSize: '20px', opacity: 0.25 }}>🔒</div>
                                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)', textAlign: 'center', padding: '0 6px', lineHeight: 1.4 }}>
                                                            {lang === 'ar' ? 'اضغط لفتح مزيد من الخانات' : 'Tap to unlock more slots for your BFF'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    }

                                    {/* Buy slot button */}
                                    <button onClick={async () => { setBuyingSlot(true); await buyBFFExtraSlot({ uid: currentUID, userData: currentUserData, onNotification, lang }); setBuyingSlot(false); }}
                                        disabled={buyingSlot || currency < BFF_CONFIG.extraSlotCost}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                            background: currency >= BFF_CONFIG.extraSlotCost ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'rgba(255,255,255,0.05)',
                                            color: currency >= BFF_CONFIG.extraSlotCost ? 'white' : '#4b5563',
                                            fontSize: '11px', fontWeight: 700,
                                        }}>
                                        {buyingSlot ? '⏳' : `+ ${lang === 'ar' ? 'فتح خانة جديدة' : 'Unlock New Slot'} (${BFF_CONFIG.extraSlotCost} 🧠)`}
                                    </button>
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
                                                var fid = f.id || f.uid;
                                                var isSelected = targetData?.id === fid;
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
// 📋 BFF PROFILE LIST MODAL — full card grid view
// ─────────────────────────────────────────────
var BFFProfileListModal = ({ show, onClose, relationships, partnerProfiles, targetUID, lang }) => {
    if (!show) return null;

    return (
        <PortalModal>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4,
                background: 'rgba(0,0,0,0.78)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    width: '100%', maxWidth: '480px', maxHeight: '85vh',
                    background: 'linear-gradient(160deg, #1a0a2e, #0d0d1a)',
                    borderRadius: '24px 24px 0 0',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 -10px 60px rgba(167,139,250,0.22)',
                    border: '1px solid rgba(167,139,250,0.18)', borderBottom: 'none',
                }}>
                    {/* Handle */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                        <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} />
                    </div>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 14px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>
                                {lang === 'ar' ? 'علاقات BFF' : 'My BFF'}
                            </span>
                            <span style={{ fontSize: '14px' }}>❤️</span>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: '#f472b6' }}>{relationships.length}</span>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px',
                            color: '#9ca3af', fontSize: '18px', width: '34px', height: '34px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                    </div>

                    {/* Cards grid */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 24px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '14px 10px',
                        }}>
                            {relationships.map(rel => {
                                var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
                                var partner = partnerProfiles[partnerUID];
                                var token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                                var level = BFF_RARITY_TO_LEVEL[token.rarity] || 1;

                                return (
                                    <div key={rel.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {/* Card body */}
                                        <div style={{
                                            width: '100%',
                                            height: '110px',
                                            borderRadius: '14px',
                                            position: 'relative',
                                            background: `linear-gradient(145deg, ${token.color}30, ${token.color}12)`,
                                            border: `1.5px solid ${token.color}55`,
                                            boxShadow: `0 4px 16px ${token.glow}55`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '20px',
                                            overflow: 'visible',
                                        }}>
                                            {/* Geometric pattern overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0, borderRadius: '12px',
                                                background: `repeating-linear-gradient(45deg, ${token.color}09 0px, transparent 12px, ${token.color}05 12px, transparent 24px)`,
                                                pointerEvents: 'none', overflow: 'hidden',
                                            }} />

                                            {/* LV badge top-left */}
                                            <div style={{
                                                position: 'absolute', top: '6px', left: '6px',
                                                background: `linear-gradient(135deg, ${token.color}ee, ${token.color}99)`,
                                                borderRadius: '6px', padding: '2px 5px',
                                                fontSize: '8px', fontWeight: 900, color: '#fff',
                                                display: 'flex', alignItems: 'center', gap: '2px',
                                                zIndex: 2,
                                            }}>
                                                <span style={{ fontSize: '9px' }}>{token.emoji}</span>
                                                {' '}LV{level}
                                            </div>

                                            {/* Token icon center */}
                                            <div style={{ fontSize: '30px', zIndex: 1 }}>
                                                {token.imageURL
                                                    ? <img src={token.imageURL} alt="" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                                                    : token.emoji}
                                            </div>

                                            {/* Avatar circle overlapping bottom */}
                                            <div style={{
                                                position: 'absolute', bottom: '-18px',
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                border: `2.5px solid ${token.color}`,
                                                overflow: 'hidden', background: '#120820',
                                                boxShadow: `0 2px 10px rgba(0,0,0,0.6), 0 0 8px ${token.glow}`,
                                                zIndex: 3,
                                            }}>
                                                {partner?.photoURL
                                                    ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>😎</div>}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div style={{
                                            fontSize: '10px', fontWeight: 700,
                                            color: '#d1d5db', textAlign: 'center',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            width: '100%', padding: '0 2px',
                                        }}>
                                            {partner?.displayName || '...'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

// ─────────────────────────────────────────────
// 📌 BFF STRIP — shown in profile above Guard
// ─────────────────────────────────────────────
var BFFStripProfile = ({
    targetUID, currentUID, currentUserData, lang,
    onNotification, friendsData,
    onOpenBFFModal,  // opens BFF modal from outside (for own profile)
}) => {
    var [myRelationships, setMyRelationships] = useState([]);
    var [partnerProfiles, setPartnerProfiles] = useState({});
    var [targetData, setTargetData] = useState(null);
    var [showListModal, setShowListModal] = useState(false);
    // ✅ FIX 1: state to open card modal when ring image clicked
    var [cardModal, setCardModal] = useState(null); // { rel, self, partner }

    var isOwnProfile = targetUID === currentUID;

    useEffect(() => {
        if (!targetUID) return;
        // Single-field queries only — filter active client-side
        var unsub1 = bffCollection.where('uid1', '==', targetUID)
            .onSnapshot(snap => {
                var active = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === 'active');
                setMyRelationships(prev => {
                    var other = prev.filter(r => r.uid2 === targetUID);
                    return [...active, ...other];
                });
            }, () => {});
        var unsub2 = bffCollection.where('uid2', '==', targetUID)
            .onSnapshot(snap => {
                var active = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === 'active');
                setMyRelationships(prev => {
                    var other = prev.filter(r => r.uid1 === targetUID);
                    return [...other, ...active];
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
        var partnerUIDs = myRelationships.map(r => r.uid1 === targetUID ? r.uid2 : r.uid1);
        var toLoad = partnerUIDs.filter(uid => !partnerProfiles[uid]);
        if (!toLoad.length) return;
        Promise.all(toLoad.map(uid =>
            usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
        )).then(results => {
            var map = {};
            results.forEach(u => { if (u) map[u.id] = u; });
            setPartnerProfiles(p => ({ ...p, ...map }));
        });
    }, [myRelationships.length]);

    if (!myRelationships.length && !isOwnProfile) return null;

    var handleClick = () => {
        if (isOwnProfile) {
            onOpenBFFModal && onOpenBFFModal();
        } else {
            if (myRelationships.length > 0) setShowListModal(true);
        }
    };

    // ✅ FIX 1: open card modal when token image clicked
    var handleTokenClick = (e, rel) => {
        e.stopPropagation();
        var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
        var partner = partnerProfiles[partnerUID];
        var self = targetData;
        if (partner) setCardModal({ rel, self, partner });
    };

    return (
        <>
            {/* ── BFF SECTION ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(112,0,255,0.04))',
                borderTop: '1px solid rgba(167,139,250,0.1)',
                borderBottom: '1px solid rgba(167,139,250,0.1)',
            }}>
                {/* Header row: BFF ❤️ [count] + arrow */}
                <div
                    onClick={handleClick}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px 6px', cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#e5e7eb' }}>BFF</span>
                        <span style={{ fontSize: '13px' }}>❤️</span>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#f472b6' }}>{myRelationships.length}</span>
                        {isOwnProfile && (
                            <span style={{
                                fontSize: '9px', fontWeight: 700, marginLeft: '4px',
                                padding: '1px 6px', borderRadius: '5px',
                                background: 'rgba(167,139,250,0.18)',
                                border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa',
                            }}>
                                {lang === 'ar' ? 'إدارة' : 'Manage'}
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>›</span>
                </div>

                {/* 3 mini-cards row */}
                {myRelationships.length > 0 ? (
                    <div style={{
                        display: 'flex', gap: '6px',
                        padding: '2px 10px 18px',
                    }}>
                        {myRelationships.slice(0, 3).map(rel => {
                            var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
                            var partner = partnerProfiles[partnerUID];
                            var token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                            var lvInfo = getBFFLevel(rel.giftPoints || 0);

                            return (
                                <div key={rel.id}
                                    onClick={handleClick}
                                    style={{
                                        flex: 1,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        // ✅ FIX 2: minimum touch target for mobile
                                        minHeight: '44px',
                                    }}
                                >
                                    {/* Card body */}
                                    <div style={{
                                        width: '100%', height: '70px',
                                        borderRadius: '10px', position: 'relative',
                                        background: `linear-gradient(145deg, ${token.color}35, ${token.color}18)`,
                                        border: `1.5px solid ${token.color}55`,
                                        boxShadow: `0 2px 8px ${token.glow}35`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'visible',
                                    }}>
                                        {/* Diamond pattern overlay */}
                                        <div style={{
                                            position: 'absolute', inset: 0, borderRadius: '8px',
                                            background: `repeating-linear-gradient(45deg, ${token.color}0a 0, transparent 8px, ${token.color}04 8px, transparent 16px)`,
                                            pointerEvents: 'none', overflow: 'hidden',
                                        }} />

                                        {/* LV badge top-left — real earned level */}
                                        <div style={{
                                            position: 'absolute', top: '4px', left: '4px',
                                            background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}99)`,
                                            borderRadius: '4px', padding: '1px 4px',
                                            fontSize: '6px', fontWeight: 900, color: '#000',
                                            display: 'flex', alignItems: 'center', gap: '2px',
                                            zIndex: 2, boxShadow: `0 1px 5px ${lvInfo.glow}`,
                                        }}>
                                            <span>{lvInfo.icon}</span>
                                            <span>LV{lvInfo.level}</span>
                                        </div>

                                        {/* ✅ FIX 1: Token emoji/image — clicking opens BFFCardModal */}
                                        <span
                                            onClick={(e) => handleTokenClick(e, rel)}
                                            style={{
                                                fontSize: '22px', zIndex: 1,
                                                cursor: 'pointer',
                                                padding: '4px',
                                                WebkitTapHighlightColor: 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                // ✅ FIX 2: bigger touch target on mobile
                                                minWidth: '36px', minHeight: '36px',
                                            }}
                                        >
                                            {token.imageURL
                                                ? <img src={token.imageURL} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                                : token.emoji}
                                        </span>

                                        {/* Avatar at bottom (overlapping) */}
                                        <div style={{
                                            position: 'absolute', bottom: '-13px',
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            border: `2px solid ${lvInfo.color}`,
                                            overflow: 'hidden', background: '#0d0d1a',
                                            boxShadow: `0 1px 6px rgba(0,0,0,0.6), 0 0 4px ${lvInfo.glow}`,
                                            zIndex: 3,
                                        }}>
                                            {partner?.photoURL
                                                ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>😎</div>}
                                        </div>
                                    </div>

                                    {/* Name below card */}
                                    <div style={{
                                        marginTop: '16px',
                                        fontSize: '9px', fontWeight: 600,
                                        color: '#9ca3af', textAlign: 'center',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        width: '100%',
                                    }}>
                                        {partner?.displayName || '...'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : isOwnProfile ? (
                    <div onClick={handleClick} style={{
                        padding: '8px 14px 14px', cursor: 'pointer',
                        textAlign: 'center', fontSize: '11px', color: '#6b7280',
                        WebkitTapHighlightColor: 'transparent',
                    }}>
                        {lang === 'ar' ? '+ أضف علاقة BFF' : '+ Add BFF Relationship'}
                    </div>
                ) : null}
            </div>

            {/* Full list modal for non-own profiles */}
            {!isOwnProfile && showListModal && (
                <BFFProfileListModal
                    show={showListModal}
                    onClose={() => setShowListModal(false)}
                    relationships={myRelationships}
                    partnerProfiles={partnerProfiles}
                    targetUID={targetUID}
                    lang={lang}
                />
            )}

            {/* ✅ FIX 1: BFF card modal opened when ring image is clicked */}
            {cardModal && (
                <BFFCardModal
                    show={!!cardModal}
                    onClose={() => setCardModal(null)}
                    bffDoc={cardModal.rel}
                    selfData={cardModal.self}
                    partnerData={cardModal.partner}
                    currentUID={targetUID}
                    lang={lang}
                    onNotification={onNotification}
                    viewOnly={true}
                />
            )}
        </>
    );
};

// ─────────────────────────────────────────────
// 🤖 BOT CHAT MODAL — Official read-only chat channels
// ─────────────────────────────────────────────
var BotChatModal = ({
    show, onClose, botId, currentUID, currentUserData, lang,
    onOpenWeddingHall, onOpenBFFModal,
}) => {
    var [messages, setMessages] = useState([]);
    var [loading, setLoading] = useState(true);
    var chatEndRef = useRef(null);

    var botCfg = BOT_CHATS_CONFIG.find(b => b.id === botId) || BOT_CHATS_CONFIG[0];

    useEffect(() => {
        if (!show || !currentUID || !botId) return;
        setLoading(true);
        // Single-field query — filter by botId client-side
        var unsub = botChatsCollection
            .where('toUserId', '==', currentUID)
            .onSnapshot(snap => {
                var allMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Filter by botId and sort by timestamp
                var filtered = allMsgs
                    .filter(m => m.botId === botId)
                    .sort((a, b) => {
                        var tA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds * 1000) || 0;
                        var tB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds * 1000) || 0;
                        return tA - tB;
                    })
                    .slice(-50); // last 50
                setMessages(filtered);
                setLoading(false);
                // Mark this bot's messages as read
                snap.docs.forEach(d => {
                    if (d.data().botId === botId && !d.data().read) {
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

    var fmtTime = (ts) => {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        var diff = Date.now() - d.getTime();
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

    // ─────────────────────────────────────────────
    // 🌍 GLOBAL EXPORTS
    // ─────────────────────────────────────────────
    window.BFF_RARITY_COLORS = BFF_RARITY_COLORS;
    window.BFF_RARITY_TO_LEVEL = BFF_RARITY_TO_LEVEL;
    window.BFF_LEVELS = BFF_LEVELS;
    window.getBFFLevel = getBFFLevel;
    window.updateBFFGiftPoints = updateBFFGiftPoints;
    window.sendBFFRequest = sendBFFRequest;
    window.acceptBFFRequest = acceptBFFRequest;
    window.declineBFFRequest = declineBFFRequest;
    window.endBFFRelationship = endBFFRelationship;
    window.sendLoveBotMessage = sendLoveBotMessage;

    window.BFFStripProfile = BFFStripProfile;
    window.BFFModal = BFFModal;
    window.BFFCardModal = BFFCardModal;
    window.BotChatModal = BotChatModal;

})();
