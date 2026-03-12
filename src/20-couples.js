// ════════════════════════════════════════════════════════════════════
// 💍 PRO SPY — COUPLES / MARRIAGE SYSTEM  (20-couples.js)
// ════════════════════════════════════════════════════════════════════
// Load order: after 19-family.js and before 16-main.js
// Exposes: CoupleCardModal, ProposalModal, IncomingProposalModal
// Data:    RINGS_DATA, COUPLE_GIFTS_DATA
// Helpers: sendProposal, acceptProposal, declineProposal, divorceCouple
// ════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// 📦 FIRESTORE COLLECTION  (add this line to 01-config.js too)
// ─────────────────────────────────────────────
const couplesCollection = db.collection('artifacts').doc(appId)
    .collection('public').doc('data').collection('couples');

// ─────────────────────────────────────────────
// 💍 RINGS DATA
// ─────────────────────────────────────────────
const RINGS_DATA = [
    { id:'ring_bronze',   emoji:'💍', name_en:'Bronze Ring',    name_ar:'خاتم برونزي',    cost:500,   levelReq:0,  rarity:'Common',    color:'#cd7f32', glow:'rgba(205,127,50,0.4)',  desc_en:'A warm start to forever.', desc_ar:'بداية دافئة للأبدية.' },
    { id:'ring_silver',   emoji:'💍', name_en:'Silver Ring',    name_ar:'خاتم فضي',       cost:1500,  levelReq:3,  rarity:'Uncommon',  color:'#c0c0c0', glow:'rgba(192,192,192,0.4)', desc_en:'Elegant and timeless.', desc_ar:'أناقة خالدة.' },
    { id:'ring_gold',     emoji:'💍', name_en:'Gold Ring',      name_ar:'خاتم ذهبي',      cost:3000,  levelReq:5,  rarity:'Rare',      color:'#ffd700', glow:'rgba(255,215,0,0.5)',   desc_en:'Golden love, golden future.', desc_ar:'حب ذهبي، مستقبل ذهبي.' },
    { id:'ring_rose',     emoji:'💍', name_en:'Rose Gold Ring', name_ar:'خاتم ذهبي وردي', cost:5000,  levelReq:7,  rarity:'Epic',      color:'#f9a8d4', glow:'rgba(249,168,212,0.5)', desc_en:'Blush pink, bold love.', desc_ar:'وردي رقيق، حب جريء.' },
    { id:'ring_diamond',  emoji:'💎', name_en:'Diamond Ring',   name_ar:'خاتم الماس',     cost:10000, levelReq:10, rarity:'Legendary', color:'#00d4ff', glow:'rgba(0,212,255,0.6)',   desc_en:'Forever brilliant.', desc_ar:'لامع إلى الأبد.' },
    { id:'ring_eternal',  emoji:'✨', name_en:'Eternal Ring',   name_ar:'خاتم الأبدية',   cost:25000, levelReq:15, rarity:'Mythic',    color:'#a855f7', glow:'rgba(168,85,247,0.7)',  desc_en:'Beyond time and space.', desc_ar:'أبعد من الزمان والمكان.' },
];

// ─────────────────────────────────────────────
// 🎁 PROPOSAL GIFTS DATA
// ─────────────────────────────────────────────
const PROPOSAL_GIFTS = [
    { id:'pg_rose',      emoji:'🌹', name_en:'Red Rose',      name_ar:'وردة حمراء',     cost:100,  charisma:200  },
    { id:'pg_bouquet',   emoji:'💐', name_en:'Bouquet',       name_ar:'باقة زهور',      cost:300,  charisma:600  },
    { id:'pg_chocolate', emoji:'🍫', name_en:'Chocolates',    name_ar:'شوكولاتة',       cost:500,  charisma:1000 },
    { id:'pg_teddy',     emoji:'🧸', name_en:'Teddy Bear',    name_ar:'دبدوب',           cost:800,  charisma:1600 },
    { id:'pg_cake',      emoji:'🎂', name_en:'Love Cake',     name_ar:'كيكة الحب',      cost:1200, charisma:2400 },
    { id:'pg_heart',     emoji:'💝', name_en:'Heart Box',     name_ar:'صندوق القلب',    cost:2000, charisma:4000 },
    { id:'pg_stars',     emoji:'⭐', name_en:'Falling Stars', name_ar:'نيازك الحب',     cost:3000, charisma:6000 },
    { id:'pg_crown',     emoji:'👑', name_en:'Love Crown',    name_ar:'تاج الحب',       cost:5000, charisma:10000},
];

// ─────────────────────────────────────────────
// 🎨 HELPERS
// ─────────────────────────────────────────────
const RARITY_COLORS_C = {
    Common:'#9ca3af', Uncommon:'#4ade80', Rare:'#60a5fa',
    Epic:'#a78bfa',   Legendary:'#ffd700', Mythic:'#f0abfc',
};

const coupleTimeDiff = (marriageDate) => {
    if (!marriageDate) return null;
    const start = marriageDate.toDate ? marriageDate.toDate() : new Date(marriageDate.seconds * 1000);
    const diff = Date.now() - start.getTime();
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    return { days, hours, mins };
};

// ─────────────────────────────────────────────
// 🔧 FIRESTORE LOGIC
// ─────────────────────────────────────────────

// Send a proposal: creates a couple doc with status='pending', deducts cost, sends notification
const sendProposal = async ({ fromUID, toUID, fromData, ringId, giftId, message, onNotification, lang }) => {
    const ring = RINGS_DATA.find(r => r.id === ringId);
    const gift = PROPOSAL_GIFTS.find(g => g.id === giftId);
    if (!ring) return { ok: false, err: 'No ring selected' };

    const totalCost = ring.cost + (gift?.cost || 0);
    const currency  = fromData?.currency || 0;
    if (currency < totalCost) {
        onNotification && onNotification(lang==='ar' ? `❌ تحتاج ${totalCost} 🧠` : `❌ Need ${totalCost} 🧠`);
        return { ok: false, err: 'Not enough currency' };
    }

    try {
        // Check for existing active couple or pending request
        const existingCouple = await couplesCollection
            .where('uid1', 'in', [fromUID, toUID])
            .where('status', 'in', ['pending','accepted'])
            .get();
        const existingCouple2 = await couplesCollection
            .where('uid2', 'in', [fromUID, toUID])
            .where('status', 'in', ['pending','accepted'])
            .get();
        if (!existingCouple.empty || !existingCouple2.empty) {
            onNotification && onNotification(lang==='ar' ? '❌ يوجد طلب أو ارتباط نشط بالفعل' : '❌ An active proposal or couple already exists');
            return { ok: false, err: 'Already exists' };
        }

        const batch = db.batch();
        // Deduct currency
        batch.update(usersCollection.doc(fromUID), {
            currency: firebase.firestore.FieldValue.increment(-totalCost),
        });
        // Create couple doc
        const coupleRef = couplesCollection.doc();
        batch.set(coupleRef, {
            uid1: fromUID,
            uid2: toUID,
            status: 'pending',
            ringId,
            giftId: giftId || null,
            proposalMessage: message || '',
            marriageDate: null,
            intimacyPoints: 0,
            couplePhotoUrl: null,
            sharedBio: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            proposedBy: fromUID,
        });
        await batch.commit();

        // Notification
        await notificationsCollection.add({
            toUserId: toUID,
            fromUserId: fromUID,
            fromName: fromData?.displayName || 'Someone',
            fromPhoto: fromData?.photoURL || null,
            type: 'couple_proposal',
            message: lang==='ar'
                ? `💍 ${fromData?.displayName} أرسل لك طلب ارتباط!`
                : `💍 ${fromData?.displayName} sent you a proposal!`,
            ringId,
            giftId: giftId || null,
            proposalMessage: message || '',
            coupleDocId: coupleRef.id,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
        });

        onNotification && onNotification(lang==='ar' ? '💍 تم إرسال الطلب!' : '💍 Proposal sent!');
        return { ok: true, coupleDocId: coupleRef.id };
    } catch(e) {
        console.error('sendProposal error', e);
        onNotification && onNotification(lang==='ar' ? '❌ خطأ' : '❌ Error');
        return { ok: false, err: e.message };
    }
};

const acceptProposal = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.update(couplesCollection.doc(coupleDocId), {
            status: 'accepted',
            marriageDate: firebase.firestore.FieldValue.serverTimestamp(),
        });
        batch.update(usersCollection.doc(uid1), { partnerId: uid2, isMarried: true });
        batch.update(usersCollection.doc(uid2), { partnerId: uid1, isMarried: true });
        await batch.commit();

        // Notification to proposer
        await notificationsCollection.add({
            toUserId: uid1,
            fromUserId: uid2,
            type: 'couple_accepted',
            message: lang==='ar' ? '💖 قبلوا طلب ارتباطك!' : '💖 Your proposal was accepted!',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
        });

        onNotification && onNotification(lang==='ar' ? '💖 قبلت الطلب!' : '💖 Proposal accepted!');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

const declineProposal = async ({ coupleDocId, fromUID, toUID, ringCost, giftCost, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.delete(couplesCollection.doc(coupleDocId));
        // Refund ring cost to proposer
        batch.update(usersCollection.doc(fromUID), {
            currency: firebase.firestore.FieldValue.increment(ringCost + (giftCost || 0)),
        });
        await batch.commit();
        onNotification && onNotification(lang==='ar' ? 'تم الرفض وإعادة الإنتل' : 'Proposal declined & Intel refunded');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

const divorceCouple = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.delete(couplesCollection.doc(coupleDocId));
        batch.update(usersCollection.doc(uid1), { partnerId: null, isMarried: false });
        batch.update(usersCollection.doc(uid2), { partnerId: null, isMarried: false });
        await batch.commit();
        onNotification && onNotification(lang==='ar' ? '💔 تم إنهاء الارتباط' : '💔 Relationship ended');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

// ─────────────────────────────────────────────
// 💫 FLOATING HEARTS ANIMATION (pure JS canvas-free)
// ─────────────────────────────────────────────
const FloatingHearts = () => {
    const HEARTS = ['❤️','💕','💗','💖','💘','💓'];
    const items = Array.from({length:10}, (_,i) => ({
        id:i,
        emoji: HEARTS[i % HEARTS.length],
        left: `${5 + (i * 9) % 90}%`,
        delay: `${(i * 0.7).toFixed(1)}s`,
        dur:   `${3 + (i % 3)}s`,
        size:  `${12 + (i % 3)*4}px`,
    }));
    return React.createElement('div', {
        style:{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }
    },
        React.createElement('style', null, `
            @keyframes floatHeart {
                0%   { transform: translateY(0) scale(1); opacity: 0.7; }
                50%  { transform: translateY(-60px) scale(1.2); opacity: 0.9; }
                100% { transform: translateY(-120px) scale(0.8); opacity: 0; }
            }
        `),
        ...items.map(h =>
            React.createElement('span', {
                key: h.id,
                style:{
                    position:'absolute',
                    bottom: '10px',
                    left: h.left,
                    fontSize: h.size,
                    animation: `floatHeart ${h.dur} ${h.delay} infinite ease-out`,
                    display:'block',
                }
            }, h.emoji)
        )
    );
};

// ─────────────────────────────────────────────
// 💍 INCOMING PROPOSAL MODAL
// ─────────────────────────────────────────────
const IncomingProposalModal = ({ show, coupleDoc, fromData, currentUID, lang, onAccept, onDecline }) => {
    const [loading, setLoading] = useState(false);
    if (!show || !coupleDoc) return null;

    const ring  = RINGS_DATA.find(r => r.id === coupleDoc.ringId);
    const gift  = PROPOSAL_GIFTS.find(g => g.id === coupleDoc.giftId);

    const handle = async (accept) => {
        setLoading(true);
        if (accept) {
            await onAccept(coupleDoc);
        } else {
            await onDecline(coupleDoc);
        }
        setLoading(false);
    };

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            style:{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH + 5,
                background:'rgba(0,0,0,0.85)',
                display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }
        },
        React.createElement('div', {
            className:'animate-pop',
            style:{
                position:'relative', width:'100%', maxWidth:'380px',
                background:'linear-gradient(145deg,#1a0a1e,#0d0015,#1a0026)',
                border:'1px solid rgba(236,72,153,0.4)',
                borderRadius:'24px', overflow:'hidden', padding:'0 0 20px',
                boxShadow:'0 0 60px rgba(236,72,153,0.25), 0 30px 80px rgba(0,0,0,0.9)',
            }
        },
            /* Floating hearts bg */
            React.createElement(FloatingHearts),

            /* Header banner */
            React.createElement('div', {
                style:{
                    position:'relative', zIndex:1,
                    background:'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(168,85,247,0.3))',
                    padding:'24px 20px 16px', textAlign:'center',
                    borderBottom:'1px solid rgba(236,72,153,0.2)',
                }
            },
                React.createElement('div', { style:{ fontSize:'42px', marginBottom:'8px' }}, ring?.emoji || '💍'),
                React.createElement('div', { style:{ fontSize:'18px', fontWeight:900, color:'white', marginBottom:'4px' }},
                    lang==='ar' ? '💍 طلب ارتباط!' : '💍 Marriage Proposal!'),
                React.createElement('div', { style:{ fontSize:'12px', color:'rgba(249,168,212,0.8)' }},
                    fromData?.displayName || '...',
                    lang==='ar' ? ' أرسل لك طلب ارتباط' : ' sent you a proposal')
            ),

            /* Body */
            React.createElement('div', { style:{ position:'relative', zIndex:1, padding:'16px 20px', display:'flex', flexDirection:'column', gap:'12px' }},

                /* Sender avatar */
                React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'12px' }},
                    React.createElement('div', { style:{ width:'48px', height:'48px', borderRadius:'50%', overflow:'hidden',
                        border:'2px solid rgba(236,72,153,0.5)', flexShrink:0 }},
                        fromData?.photoURL
                            ? React.createElement('img', { src:fromData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                            : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', background:'rgba(236,72,153,0.1)' }}, '😎')
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'white' }}, fromData?.displayName || '—'),
                        React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }},
                            lang==='ar' ? 'يطلب ارتباطك 💕' : 'is proposing to you 💕')
                    )
                ),

                /* Ring chosen */
                ring && React.createElement('div', {
                    style:{ padding:'10px 14px', borderRadius:'12px',
                        background:`${ring.color}15`, border:`1px solid ${ring.color}40`,
                        display:'flex', alignItems:'center', gap:'10px' }
                },
                    React.createElement('span', { style:{ fontSize:'22px' }}, ring.emoji),
                    React.createElement('div', null,
                        React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color:ring.color }},
                            lang==='ar' ? ring.name_ar : ring.name_en),
                        React.createElement('div', { style:{ fontSize:'10px', color: RARITY_COLORS_C[ring.rarity] }}, ring.rarity)
                    )
                ),

                /* Gift attached */
                gift && React.createElement('div', {
                    style:{ padding:'8px 14px', borderRadius:'10px',
                        background:'rgba(249,168,212,0.08)', border:'1px solid rgba(249,168,212,0.2)',
                        display:'flex', alignItems:'center', gap:'8px' }
                },
                    React.createElement('span', { style:{ fontSize:'20px' }}, gift.emoji),
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }},
                        lang==='ar' ? `هدية: ${gift.name_ar}` : `Gift: ${gift.name_en}`)
                ),

                /* Message */
                coupleDoc.proposalMessage && React.createElement('div', {
                    style:{ padding:'10px 14px', borderRadius:'12px',
                        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                        fontSize:'13px', color:'#f3f4f6', fontStyle:'italic', lineHeight:1.6,
                        textAlign: lang==='ar' ? 'right' : 'left' }
                }, `" ${coupleDoc.proposalMessage} "`),

                /* Buttons */
                React.createElement('div', { style:{ display:'flex', gap:'10px', marginTop:'4px' }},
                    React.createElement('button', {
                        onClick: () => handle(false),
                        disabled: loading,
                        style:{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.4)',
                            background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:'13px', fontWeight:700,
                            cursor:'pointer', transition:'.2s' }
                    }, loading ? '⏳' : (lang==='ar' ? '❌ رفض' : '❌ Decline')),
                    React.createElement('button', {
                        onClick: () => handle(true),
                        disabled: loading,
                        style:{ flex:1, padding:'12px', borderRadius:'12px', border:'none',
                            background:'linear-gradient(135deg,#ec4899,#a855f7)',
                            color:'white', fontSize:'13px', fontWeight:800,
                            cursor:'pointer', boxShadow:'0 4px 20px rgba(236,72,153,0.4)', transition:'.2s' }
                    }, loading ? '⏳' : (lang==='ar' ? '💖 قبول' : '💖 Accept'))
                )
            )
        ))
    );
};

// ─────────────────────────────────────────────
// 📨 PROPOSAL MODAL (proposer sends from shop)
// ─────────────────────────────────────────────
const ProposalModal = ({ show, onClose, ring, currentUserData, currentUID, lang, onSend }) => {
    const [selectedGift, setSelectedGift]     = useState(null);
    const [message, setMessage]               = useState('');
    const [targetId, setTargetId]             = useState('');
    const [targetData, setTargetData]         = useState(null);
    const [searching, setSearching]           = useState(false);
    const [sending, setSending]               = useState(false);
    const [searchErr, setSearchErr]           = useState('');

    if (!show || !ring) return null;

    const currency  = currentUserData?.currency || 0;
    const giftCost  = selectedGift?.cost || 0;
    const totalCost = ring.cost + giftCost;
    const canAfford = currency >= totalCost;

    const searchUser = async () => {
        if (!targetId.trim()) return;
        setSearching(true); setSearchErr(''); setTargetData(null);
        try {
            // Search by customId
            const snap = await usersCollection.where('customId', '==', targetId.trim()).limit(1).get();
            if (snap.empty) {
                setSearchErr(lang==='ar' ? 'لم يُعثر على المستخدم' : 'User not found');
            } else {
                const d = { id: snap.docs[0].id, ...snap.docs[0].data() };
                if (d.id === currentUID) {
                    setSearchErr(lang==='ar' ? 'لا يمكنك إرسال طلب لنفسك' : 'Cannot propose to yourself');
                } else if (d.isMarried) {
                    setSearchErr(lang==='ar' ? 'هذا المستخدم مرتبط بالفعل' : 'This user is already in a relationship');
                } else {
                    setTargetData(d);
                }
            }
        } catch(e) { setSearchErr('Error'); }
        setSearching(false);
    };

    const handleSend = async () => {
        if (!targetData || !canAfford || sending) return;
        setSending(true);
        await onSend({ toUID: targetData.id, toData: targetData, giftId: selectedGift?.id || null, message });
        setSending(false);
        onClose();
    };

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            onClick: onClose,
            style:{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH + 3,
                background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center',
                justifyContent:'center', padding:'16px' }
        },
        React.createElement('div', {
            className:'animate-pop',
            onClick: e => e.stopPropagation(),
            style:{
                position:'relative', width:'100%', maxWidth:'420px', maxHeight:'92vh',
                background:'linear-gradient(145deg,#120818,#0a0410,#180820)',
                border:'1px solid rgba(236,72,153,0.35)',
                borderRadius:'22px', overflow:'hidden', display:'flex', flexDirection:'column',
                boxShadow:'0 0 50px rgba(168,85,247,0.2), 0 30px 80px rgba(0,0,0,0.9)',
            }
        },
            React.createElement(FloatingHearts),

            /* Header */
            React.createElement('div', {
                style:{ position:'relative', zIndex:1, display:'flex', alignItems:'center',
                    justifyContent:'space-between', padding:'16px 18px',
                    borderBottom:'1px solid rgba(236,72,153,0.2)',
                    background:'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.12))' }
            },
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'15px', fontWeight:900, color:'white' }},
                        `${ring.emoji} ${lang==='ar' ? ring.name_ar : ring.name_en}`),
                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', marginTop:'2px' }},
                        lang==='ar' ? 'طلب الارتباط' : 'Marriage Proposal')
                ),
                React.createElement('button', {
                    onClick: onClose,
                    style:{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px',
                        color:'#9ca3af', fontSize:'16px', width:'30px', height:'30px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, position:'relative' }
                }, '✕')
            ),

            /* Scrollable body */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px', position:'relative', zIndex:1 }},

                /* Ring summary card */
                React.createElement('div', {
                    style:{ padding:'12px 16px', borderRadius:'14px',
                        background:`linear-gradient(135deg, ${ring.color}18, ${ring.color}08)`,
                        border:`1px solid ${ring.color}40`,
                        display:'flex', alignItems:'center', gap:'12px' }
                },
                    React.createElement('span', { style:{ fontSize:'28px' }}, ring.emoji),
                    React.createElement('div', { style:{ flex:1 }},
                        React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color: ring.color }},
                            lang==='ar' ? ring.name_ar : ring.name_en),
                        React.createElement('div', { style:{ fontSize:'10px', color: RARITY_COLORS_C[ring.rarity], fontWeight:700 }},
                            ring.rarity),
                        React.createElement('div', { style:{ fontSize:'11px', color:'#9ca3af', marginTop:'2px' }},
                            lang==='ar' ? ring.desc_ar : ring.desc_en)
                    ),
                    React.createElement('div', { style:{ fontSize:'12px', fontWeight:800, color:'#fcd34d' }},
                        `${ring.cost.toLocaleString()} 🧠`)
                ),

                /* Target user search */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'8px', fontWeight:700 }},
                        lang==='ar' ? '💌 أرسل إلى (ادخل الـ ID):' : '💌 Send to (enter ID):'),
                    React.createElement('div', { style:{ display:'flex', gap:'8px' }},
                        React.createElement('input', {
                            value: targetId,
                            onChange: e => setTargetId(e.target.value),
                            onKeyDown: e => e.key === 'Enter' && searchUser(),
                            placeholder: lang==='ar' ? 'الـ ID الرقمي...' : 'Numeric ID...',
                            style:{ flex:1, padding:'10px 12px', borderRadius:'10px',
                                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(236,72,153,0.3)',
                                color:'white', fontSize:'13px', outline:'none' }
                        }),
                        React.createElement('button', {
                            onClick: searchUser, disabled: searching,
                            style:{ padding:'10px 14px', borderRadius:'10px', border:'none',
                                background:'linear-gradient(135deg,#ec4899,#a855f7)',
                                color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }
                        }, searching ? '⏳' : (lang==='ar' ? 'بحث' : 'Find'))
                    ),
                    searchErr && React.createElement('div', { style:{ fontSize:'11px', color:'#f87171', marginTop:'6px' }}, searchErr),
                    targetData && React.createElement('div', {
                        style:{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px',
                            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', marginTop:'8px' }
                    },
                        React.createElement('div', { style:{ width:'32px', height:'32px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)' }},
                            targetData.photoURL
                                ? React.createElement('img', { src:targetData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}, '😎')
                        ),
                        React.createElement('div', { style:{ flex:1 }},
                            React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color:'#4ade80' }}, targetData.displayName),
                            React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280' }}, `#${targetData.customId}`)
                        ),
                        React.createElement('span', { style:{ fontSize:'16px' }}, '✅')
                    )
                ),

                /* Gift selection */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'8px', fontWeight:700 }},
                        lang==='ar' ? '🎁 أضف هدية (اختياري):' : '🎁 Add a Gift (optional):'),
                    React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }},
                        PROPOSAL_GIFTS.map(g =>
                            React.createElement('button', {
                                key: g.id,
                                onClick: () => setSelectedGift(selectedGift?.id === g.id ? null : g),
                                style:{
                                    padding:'8px 4px', borderRadius:'10px',
                                    border:`1px solid ${selectedGift?.id===g.id ? 'rgba(236,72,153,0.7)' : 'rgba(255,255,255,0.1)'}`,
                                    background: selectedGift?.id===g.id ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                                    transition:'.15s',
                                }
                            },
                                React.createElement('span', { style:{ fontSize:'20px' }}, g.emoji),
                                React.createElement('span', { style:{ fontSize:'8px', color: selectedGift?.id===g.id ? '#f9a8d4' : '#6b7280', fontWeight:600 }},
                                    `${g.cost}🧠`)
                            )
                        )
                    )
                ),

                /* Message */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'6px', fontWeight:700 }},
                        lang==='ar' ? '💬 رسالة رومانسية:' : '💬 Romantic message:'),
                    React.createElement('textarea', {
                        value: message,
                        onChange: e => setMessage(e.target.value),
                        maxLength: 200,
                        rows: 3,
                        placeholder: lang==='ar'
                            ? 'اكتب رسالتك هنا... 💕'
                            : 'Write your message here... 💕',
                        style:{ width:'100%', padding:'10px 12px', borderRadius:'12px',
                            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(236,72,153,0.25)',
                            color:'white', fontSize:'12px', outline:'none', resize:'none', lineHeight:1.6,
                            fontFamily:'inherit', boxSizing:'border-box',
                            direction: lang==='ar' ? 'rtl' : 'ltr' }
                    }),
                    React.createElement('div', { style:{ fontSize:'9px', color:'#4b5563', textAlign:'right', marginTop:'3px' }},
                        `${message.length}/200`)
                ),

                /* Total cost + balance */
                React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'12px',
                        background: canAfford ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border:`1px solid ${canAfford ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)'}` }
                },
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#9ca3af', marginBottom:'4px' }},
                        React.createElement('span', null, lang==='ar' ? 'رصيدك:' : 'Your balance:'),
                        React.createElement('span', { style:{ color:'#fcd34d', fontWeight:700 }}, `${currency.toLocaleString()} 🧠`)
                    ),
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:800 }},
                        React.createElement('span', { style:{ color:'white' }}, lang==='ar' ? 'الإجمالي:' : 'Total cost:'),
                        React.createElement('span', { style:{ color: canAfford ? '#4ade80' : '#f87171' }},
                            `${totalCost.toLocaleString()} 🧠`)
                    ),
                    !canAfford && React.createElement('div', { style:{ fontSize:'10px', color:'#f87171', marginTop:'4px' }},
                        lang==='ar' ? `تحتاج ${(totalCost - currency).toLocaleString()} إنتل إضافية` : `Need ${(totalCost - currency).toLocaleString()} more Intel`)
                ),

                /* Send button */
                React.createElement('button', {
                    onClick: handleSend,
                    disabled: !targetData || !canAfford || sending,
                    style:{
                        width:'100%', padding:'14px', borderRadius:'14px', border:'none',
                        background: (!targetData || !canAfford)
                            ? 'rgba(255,255,255,0.07)'
                            : 'linear-gradient(135deg,#ec4899,#a855f7)',
                        color: (!targetData || !canAfford) ? '#4b5563' : 'white',
                        fontSize:'14px', fontWeight:900, cursor: (!targetData || !canAfford) ? 'not-allowed' : 'pointer',
                        boxShadow: (targetData && canAfford) ? '0 4px 24px rgba(236,72,153,0.45)' : 'none',
                        transition:'.2s', letterSpacing:'0.5px',
                    }
                }, sending ? '⏳ ...' : (lang==='ar' ? '💍 إرسال الطلب' : '💍 Send Proposal'))
            )
        ))
    );
};

// ─────────────────────────────────────────────
// 💑 COUPLE CARD MODAL  (v3 — with gifts, blessing, love, clickable avatars)
// ─────────────────────────────────────────────
const LOVE_LEVELS = [
    { days:0,   label_ar:'حب ناشئ 🌱',   label_en:'Budding Love 🌱',   color:'#86efac' },
    { days:7,   label_ar:'حب متنامي 💛',  label_en:'Growing Love 💛',   color:'#fde68a' },
    { days:30,  label_ar:'حب عميق 💕',   label_en:'Deep Love 💕',      color:'#f9a8d4' },
    { days:90,  label_ar:'رابطة قوية 💑', label_en:'Strong Bond 💑',    color:'#c4b5fd' },
    { days:180, label_ar:'حب حقيقي 💖',  label_en:'True Love 💖',      color:'#f0abfc' },
    { days:365, label_ar:'حب أبدي 💎',   label_en:'Eternal Love 💎',   color:'#67e8f9' },
];

const getLoveLevel = (days) => {
    let lv = LOVE_LEVELS[0];
    for (const l of LOVE_LEVELS) { if (days >= l.days) lv = l; else break; }
    const next = LOVE_LEVELS[LOVE_LEVELS.indexOf(lv) + 1];
    const pct  = next ? Math.min(100, Math.round(((days - lv.days) / (next.days - lv.days)) * 100)) : 100;
    return { ...lv, pct, nextDays: next?.days || null };
};

const CoupleCardModal = ({
    show, onClose, coupleDoc, currentUID, partnerData, selfData,
    lang, onNotification, viewOnly,
    onOpenProfile,    // (uid) => void — open someone's profile
    currentUserData,  // logged-in user's data (for gift sending)
}) => {
    const [liveDoc, setLiveDoc]         = useState(null);   // real-time couple doc
    const [timer, setTimer]             = useState({ days:0, hours:0, mins:0 });
    const [editingBio, setEditingBio]   = useState(false);
    const [bioText, setBioText]         = useState('');
    const [savingBio, setSavingBio]     = useState(false);
    const [uploading, setUploading]     = useState(false);
    const [uploadErr, setUploadErr]     = useState('');
    const [photoExpanded, setPhotoExpanded] = useState(false); // ← WePlay-style expand
    const photoRef                      = useRef(null);
    const timerRef                      = useRef(null);
    const [divorceStep, setDivorceStep] = useState(0);
    const [divorcing, setDivorcing]     = useState(false);
    const [sending, setSending]         = useState(false);
    const [giftErr, setGiftErr]         = useState('');
    const [giftOk, setGiftOk]           = useState('');

    // ── Real-time listener for coupleDoc itself ──
    useEffect(() => {
        if (!show || !coupleDoc?.id) { setLiveDoc(null); return; }
        let firstSnapshot = true;
        const unsub = couplesCollection.doc(coupleDoc.id).onSnapshot(
            snap => {
                if (snap.exists) {
                    setLiveDoc({ id: snap.id, ...snap.data() });
                } else {
                    setLiveDoc(null);
                    // Doc was deleted (divorce happened) — close modal after tiny delay
                    if (!firstSnapshot) setTimeout(() => onClose(), 600);
                }
                firstSnapshot = false;
            },
            () => {}
        );
        return () => unsub();
    }, [show, coupleDoc?.id]);

    const doc = liveDoc || coupleDoc; // prefer live

    useEffect(() => {
        if (!show || !doc?.marriageDate) return;
        const tick = () => { const d = coupleTimeDiff(doc.marriageDate); if(d) setTimer(d); };
        tick();
        timerRef.current = setInterval(tick, 60000);
        return () => clearInterval(timerRef.current);
    }, [show, doc?.marriageDate]);

    useEffect(() => {
        if (show) { setBioText(doc?.sharedBio || ''); setDivorceStep(0); setUploadErr(''); setGiftErr(''); setGiftOk(''); }
    }, [show, doc?.sharedBio]);

    if (!show) return null;
    if (!doc) return null; // doc deleted (divorce) — onClose() will be called by listener

    const ring     = RINGS_DATA.find(r => r.id === doc.ringId) || RINGS_DATA[0];
    const uid1     = doc.uid1;
    const uid2     = doc.uid2;
    const isMember = !viewOnly && (currentUID === uid1 || currentUID === uid2);
    const loveInfo = getLoveLevel(timer.days);

    // Gift items (love-themed subset, sorted by cost)
    const COUPLE_GIFTS = (typeof SHOP_ITEMS !== 'undefined' && SHOP_ITEMS.gifts)
        ? SHOP_ITEMS.gifts.filter(g => !g.hidden).slice(0, 12)
        : [];

    const saveBio = async () => {
        if (!doc?.id) return;
        setSavingBio(true);
        try {
            await couplesCollection.doc(doc.id).update({ sharedBio: bioText });
            setEditingBio(false);
            onNotification && onNotification(lang==='ar' ? '✅ تم الحفظ' : '✅ Saved');
        } catch(e) {}
        setSavingBio(false);
    };

    /* Photo upload: compress to max 800px & ~300KB */
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !doc?.id) return;
        setUploadErr('');
        if (!file.type.startsWith('image/')) {
            setUploadErr(lang==='ar' ? 'يجب أن يكون ملف صورة' : 'File must be an image');
            return;
        }
        setUploading(true);
        try {
            const bmp = await createImageBitmap(file);
            const maxSide = 800;
            let w = bmp.width, h = bmp.height;
            if (w > maxSide || h > maxSide) {
                const ratio = Math.min(maxSide / w, maxSide / h);
                w = Math.round(w * ratio); h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
            let base64 = canvas.toDataURL('image/jpeg', 0.82);
            if (base64.length > 400000) base64 = canvas.toDataURL('image/jpeg', 0.65);
            if (base64.length > 400000) {
                setUploadErr(lang==='ar' ? 'الصورة كبيرة جداً، اختر أخرى' : 'Image too large, pick another');
                setUploading(false); return;
            }
            await couplesCollection.doc(doc.id).update({ couplePhotoUrl: base64 });
            onNotification && onNotification(lang==='ar' ? '✅ تم رفع الصورة' : '✅ Photo uploaded');
        } catch(err) {
            setUploadErr(lang==='ar' ? 'فشل الرفع، حاول مجدداً' : 'Upload failed, try again');
        }
        setUploading(false);
        e.target.value = '';
    };

    const handleDivorce = async () => {
        setDivorcing(true);
        await divorceCouple({ coupleDocId: doc.id, uid1, uid2, onNotification, lang });
        setDivorcing(false);
        setDivorceStep(0);
        onClose();
    };

    /* Send a gift to the couple — uses primary site gift system */
    const sendBlessingGift = async (gift) => {
        if (sending || !currentUID || !doc?.id) return;
        setSending(true); setGiftErr(''); setGiftOk('');
        try {
            // ✅ Validate balance from Firestore (prevents stale state bugs)
            const senderSnap = await usersCollection.doc(currentUID).get();
            const liveBal = senderSnap.exists ? (senderSnap.data().currency || 0) : 0;
            if (liveBal < gift.cost) {
                setGiftErr(lang==='ar' ? `❌ رصيدك غير كافٍ (${liveBal} 🧠)` : `❌ Insufficient balance (${liveBal} 🧠)`);
                setSending(false);
                return;
            }
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-gift.cost)
            });
            const entry = {
                sn: currentUserData?.displayName || '?',
                sp: currentUserData?.photoURL || null,
                su: currentUID,
                ge: gift.emoji,
                gn: lang==='ar' ? gift.name_ar : gift.name_en,
                ts: Date.now(),
                bp: gift.charisma,
            };
            const currentLog = doc.giftLog || [];
            const newLog = [...currentLog.slice(-19), entry];
            await couplesCollection.doc(doc.id).update({
                blessingPoints: firebase.firestore.FieldValue.increment(gift.charisma),
                giftLog: newLog,
            });
            // Split charisma between partners
            const half = Math.floor(gift.charisma / 2);
            await Promise.all([
                usersCollection.doc(uid1).update({ charisma: firebase.firestore.FieldValue.increment(half) }),
                usersCollection.doc(uid2).update({ charisma: firebase.firestore.FieldValue.increment(half) }),
            ]);
            setGiftOk(lang==='ar' ? `✨ أرسلت ${gift.emoji} بركة!` : `✨ Sent ${gift.emoji} blessing!`);
            setTimeout(() => setGiftOk(''), 2500);
        } catch(err) {
            setGiftErr(lang==='ar' ? 'حدث خطأ' : 'Error occurred');
        }
        setSending(false);
    };

    /* Small circular avatar — clickable if onOpenProfile provided */
    const Av = ({ user, uid, size=50 }) => React.createElement('div', {
        onClick: () => uid && onOpenProfile && onOpenProfile(uid),
        style:{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
            border:`2px solid ${ring.color}80`,
            background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:Math.floor(size*0.46),
            cursor: onOpenProfile ? 'pointer' : 'default',
            transition:'.15s', }
    }, user?.photoURL
        ? React.createElement('img', { src:user.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
        : '😎'
    );

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            onClick: onClose,
            style:{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH + 2,
                background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center',
                justifyContent:'center', padding:'16px' }
        },
        React.createElement('div', {
            className:'animate-pop',
            onClick: e => e.stopPropagation(),
            style:{
                position:'relative', width:'100%', maxWidth:'400px', maxHeight:'92vh',
                background:'linear-gradient(145deg,#13091c,#0c0414,#1a0a28)',
                border:`1px solid ${ring.color}50`,
                borderRadius:'24px', overflow:'hidden', display:'flex', flexDirection:'column',
                boxShadow:`0 0 60px ${ring.glow}, 0 30px 80px rgba(0,0,0,0.95)`,
            }
        },
            React.createElement(FloatingHearts),

            /* ── Header ── */
            React.createElement('div', {
                style:{ position:'relative', zIndex:1, display:'flex', alignItems:'center',
                    justifyContent:'space-between', padding:'14px 16px',
                    borderBottom:'1px solid rgba(236,72,153,0.15)',
                    background:'linear-gradient(135deg,rgba(236,72,153,0.12),rgba(168,85,247,0.1))' }
            },
                React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'8px' }},
                    React.createElement('span', { style:{ fontSize:'20px', filter:`drop-shadow(0 0 8px ${ring.glow})` }}, ring.emoji),
                    React.createElement('div', null,
                        React.createElement('div', { style:{ fontSize:'13px', fontWeight:900, color:'white' }},
                            lang==='ar' ? 'بطاقة الزوجين 💑' : 'Couple Card 💑'),
                        React.createElement('div', { style:{ fontSize:'9px', color: ring.color, fontWeight:700 }},
                            lang==='ar' ? ring.name_ar : ring.name_en)
                    )
                ),
                React.createElement('button', {
                    onClick: onClose,
                    style:{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px',
                        color:'#9ca3af', fontSize:'16px', width:'28px', height:'28px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, position:'relative' }
                }, '✕')
            ),

            /* ── Scrollable body ── */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'16px',
                display:'flex', flexDirection:'column', gap:'14px', position:'relative', zIndex:1 }},

                /* ════ JOINT PHOTO — WePlay style expandable ════ */
                React.createElement('div', { style:{ position:'relative' }},
                    /* Expanded overlay photo */
                    photoExpanded && doc.couplePhotoUrl && React.createElement('div', {
                        onClick: () => setPhotoExpanded(false),
                        style:{ position:'absolute', inset:'-16px -16px 0', zIndex:10, cursor:'pointer',
                            borderRadius:'16px 16px 0 0', overflow:'hidden',
                            boxShadow:`0 0 30px ${ring.glow}` }
                    },
                        React.createElement('img', {
                            src: doc.couplePhotoUrl, alt:'',
                            style:{ width:'100%', height:'220px', objectFit:'cover', display:'block' }
                        }),
                        React.createElement('div', { style:{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.6)', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'13px' }}, '✕'),
                        React.createElement('div', { style:{ position:'absolute', bottom:'8px', left:'50%', transform:'translateX(-50%)', fontSize:'9px', color:'rgba(255,255,255,0.6)' }},
                            lang==='ar' ? 'اضغط للإغلاق' : 'Tap to close')
                    ),
                    React.createElement('div', { style:{ textAlign:'center', marginBottom: photoExpanded && doc.couplePhotoUrl ? '220px' : '0' }},
                        /* Small photo — clicking ring expands it */
                        React.createElement('div', {
                            onClick: () => {
                                if (doc.couplePhotoUrl) { setPhotoExpanded(!photoExpanded); return; }
                                isMember && !uploading && photoRef.current?.click();
                            },
                            style:{
                                width: photoExpanded && doc.couplePhotoUrl ? '0' : '120px',
                                height: photoExpanded && doc.couplePhotoUrl ? '0' : '120px',
                                borderRadius:'20px',
                                margin:'0 auto 14px', cursor: 'pointer',
                                overflow:'hidden', position:'relative',
                                border:`3px solid ${ring.color}90`,
                                boxShadow:`0 0 22px ${ring.glow}, 0 0 48px ${ring.glow}44`,
                                background:'linear-gradient(135deg,rgba(236,72,153,0.14),rgba(168,85,247,0.11))',
                                display: photoExpanded && doc.couplePhotoUrl ? 'none' : 'flex',
                                alignItems:'center', justifyContent:'center',
                                transition:'all 0.3s',
                            }
                        },
                            doc.couplePhotoUrl
                                ? React.createElement('img', {
                                    src: doc.couplePhotoUrl, alt:'',
                                    style:{ width:'100%', height:'100%', objectFit:'cover', display:'block' },
                                    onError: e => { e.target.style.display='none'; }
                                  })
                                : React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }},
                                    React.createElement('div', { style:{ fontSize:'30px' }}, isMember ? '📷' : '💑'),
                                    React.createElement('div', { style:{ fontSize:'9px', color:'#9ca3af' }},
                                        isMember ? (lang==='ar' ? 'اضغط لإضافة صورة' : 'Tap to add photo') : '')
                                  ),
                            uploading && React.createElement('div', {
                                style:{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)',
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }
                            }, '⏳')
                        ),
                        isMember && React.createElement('input', {
                            type:'file', ref:photoRef, style:{ display:'none' },
                            accept:'image/jpeg,image/png,image/webp',
                            onChange: handlePhotoUpload
                        }),
                        uploadErr && React.createElement('div', {
                            style:{ fontSize:'10px', color:'#f87171', marginBottom:'6px', marginTop:'-6px' }
                        }, uploadErr),

                        /* ── Dynamic Partner Header — profile pics flanking ring ── */
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'center' }},

                            /* Left partner (uid1 / selfData) */
                            React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }},
                                React.createElement(Av, { user: selfData, uid: uid1, size:54 }),
                                React.createElement('div', {
                                    onClick: () => uid1 && onOpenProfile && onOpenProfile(uid1),
                                    style:{ fontSize:'10px', fontWeight:700, color:'#e2e8f0',
                                        maxWidth:'72px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                        cursor: onOpenProfile ? 'pointer' : 'default' }
                                }, selfData?.displayName || '—')
                            ),

                            /* Ring divider — clickable to expand photo */
                            React.createElement('div', {
                                onClick: () => doc.couplePhotoUrl && setPhotoExpanded(!photoExpanded),
                                style:{ display:'flex', flexDirection:'column', alignItems:'center', margin:'0 10px', flexShrink:0,
                                    paddingBottom:'16px', cursor: doc.couplePhotoUrl ? 'pointer' : 'default' }
                            },
                                React.createElement('div', { style:{ width:'36px', height:'2px', borderRadius:'2px',
                                    background:`linear-gradient(90deg,transparent,${ring.color},transparent)` }}),
                                React.createElement('div', {
                                    style:{ fontSize:'24px', margin:'3px 0',
                                        filter:`drop-shadow(0 0 7px ${ring.glow}) drop-shadow(0 0 14px ${ring.glow})`,
                                        transform: photoExpanded ? 'scale(1.2)' : 'scale(1)',
                                        transition:'transform 0.2s' }},
                                    ring.emoji),
                                React.createElement('div', { style:{ width:'36px', height:'2px', borderRadius:'2px',
                                    background:`linear-gradient(90deg,transparent,${ring.color},transparent)` }}),
                                doc.couplePhotoUrl && React.createElement('div', { style:{ fontSize:'8px', color:ring.color, marginTop:'2px', fontWeight:700 }},
                                    lang==='ar' ? (photoExpanded?'طي':'توسيع') : (photoExpanded?'Close':'Expand'))
                            ),

                            /* Right partner (uid2 / partnerData) */
                            React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }},
                                React.createElement(Av, { user: partnerData, uid: uid2, size:54 }),
                                React.createElement('div', {
                                    onClick: () => uid2 && onOpenProfile && onOpenProfile(uid2),
                                    style:{ fontSize:'10px', fontWeight:700, color:'#e2e8f0',
                                        maxWidth:'72px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                        cursor: onOpenProfile ? 'pointer' : 'default' }
                                }, partnerData?.displayName || '—')
                            )
                        )
                    )
                ),

                /* ════ Together Timer ════ */
                doc.marriageDate && React.createElement('div', {
                    style:{ padding:'14px', borderRadius:'16px', textAlign:'center',
                        background:'linear-gradient(135deg,rgba(236,72,153,0.12),rgba(168,85,247,0.1))',
                        border:'1px solid rgba(236,72,153,0.25)' }
                },
                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', marginBottom:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }},
                        lang==='ar' ? '⏳ معاً منذ' : '⏳ Together for'),
                    React.createElement('div', { style:{ display:'flex', justifyContent:'center', gap:'16px' }},
                        [
                            { val:timer.days,  label_ar:'يوم',   label_en:'Days'  },
                            { val:timer.hours, label_ar:'ساعة',  label_en:'Hours' },
                            { val:timer.mins,  label_ar:'دقيقة', label_en:'Mins'  },
                        ].map(item =>
                            React.createElement('div', { key:item.label_en, style:{ textAlign:'center' }},
                                React.createElement('div', { style:{ fontSize:'26px', fontWeight:900, color:'white',
                                    textShadow:`0 0 20px ${ring.glow}` }}, item.val),
                                React.createElement('div', { style:{ fontSize:'9px', color:'#f9a8d4', marginTop:'2px' }},
                                    lang==='ar' ? item.label_ar : item.label_en)
                            )
                        )
                    )
                ),

                /* ════ Love Level + Blessing (side by side) ════ */
                React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }},

                    /* Love ❤️ */
                    React.createElement('div', { style:{ padding:'12px', borderRadius:'14px',
                        background:'rgba(236,72,153,0.07)', border:'1px solid rgba(236,72,153,0.2)' }
                    },
                        React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px' }},
                            React.createElement('span', null, '❤️'),
                            lang==='ar' ? 'مستوى الحب' : 'Love Level'
                        ),
                        React.createElement('div', { style:{ fontSize:'11px', fontWeight:800, color: loveInfo.color, marginBottom:'6px', lineHeight:1.2 }},
                            lang==='ar' ? loveInfo.label_ar : loveInfo.label_en),
                        React.createElement('div', { style:{ height:'4px', borderRadius:'4px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }},
                            React.createElement('div', { style:{ height:'100%', width:`${loveInfo.pct}%`,
                                background:`linear-gradient(90deg,#ec4899,${loveInfo.color})`, borderRadius:'4px', transition:'1s' }})
                        ),
                        loveInfo.nextDays && React.createElement('div', { style:{ fontSize:'8px', color:'#6b7280', marginTop:'4px' }},
                            lang==='ar' ? `${loveInfo.nextDays - timer.days} يوم للمستوى التالي` : `${loveInfo.nextDays - timer.days}d to next level`)
                    ),

                    /* Blessing ✨ */
                    React.createElement('div', { style:{ padding:'12px', borderRadius:'14px',
                        background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.2)' }
                    },
                        React.createElement('div', { style:{ fontSize:'10px', color:'#c4b5fd', fontWeight:700, marginBottom:'6px', display:'flex', alignItems:'center', gap:'4px' }},
                            React.createElement('span', null, '✨'),
                            lang==='ar' ? 'البركة' : 'Blessing'
                        ),
                        React.createElement('div', { style:{ fontSize:'20px', fontWeight:900, color:'#c4b5fd', marginBottom:'6px',
                            textShadow:'0 0 14px rgba(168,85,247,0.5)' }},
                            (doc.blessingPoints || 0).toLocaleString()),
                        React.createElement('div', { style:{ height:'4px', borderRadius:'4px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }},
                            React.createElement('div', { style:{ height:'100%', width:`${Math.min(100, ((doc.blessingPoints||0) % 10000) / 100)}%`,
                                background:'linear-gradient(90deg,#a855f7,#c4b5fd)', borderRadius:'4px', transition:'.5s' }})
                        ),
                        React.createElement('div', { style:{ fontSize:'8px', color:'#6b7280', marginTop:'4px' }},
                            lang==='ar' ? 'تزيد بالهدايا 🎁' : 'Grows with gifts 🎁')
                    )
                ),

                /* ════ Shared Bio ════ */
                React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'14px',
                        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)' }
                },
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }},
                        React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', fontWeight:700 }},
                            lang==='ar' ? '💬 بيو مشترك' : '💬 Shared Bio'),
                        isMember && React.createElement('button', {
                            onClick: () => editingBio ? saveBio() : setEditingBio(true),
                            disabled: savingBio,
                            style:{ background:'rgba(236,72,153,0.15)', border:'1px solid rgba(236,72,153,0.3)',
                                borderRadius:'6px', color:'#f9a8d4', fontSize:'10px', fontWeight:700,
                                padding:'3px 10px', cursor:'pointer' }
                        }, savingBio ? '⏳' : (editingBio ? (lang==='ar'?'💾 حفظ':'💾 Save') : (lang==='ar'?'✏️ تعديل':'✏️ Edit')))
                    ),
                    editingBio && isMember
                        ? React.createElement('textarea', {
                            value: bioText, onChange: e => setBioText(e.target.value),
                            maxLength: 120, rows: 3,
                            style:{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(236,72,153,0.3)',
                                borderRadius:'8px', padding:'8px', color:'white', fontSize:'12px',
                                outline:'none', resize:'none', lineHeight:1.6, fontFamily:'inherit',
                                boxSizing:'border-box', direction: lang==='ar' ? 'rtl' : 'ltr' }
                          })
                        : React.createElement('div', {
                            style:{ fontSize:'13px', color: doc.sharedBio ? '#f3f4f6' : '#4b5563',
                                fontStyle: doc.sharedBio ? 'italic' : 'normal', lineHeight:1.6,
                                textAlign: lang==='ar' ? 'right' : 'left' }
                          }, doc.sharedBio || (lang==='ar' ? '💕 لا يوجد بيو بعد' : '💕 No shared bio yet'))
                ),

                /* ════ MULTI-RING EQUIPMENT SLOTS ════ */
                React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'14px',
                        background:'linear-gradient(135deg,rgba(255,215,0,0.05),rgba(168,85,247,0.05))',
                        border:'1px solid rgba(255,215,0,0.15)' }
                },
                    React.createElement('div', { style:{ fontSize:'11px', color:'#fbbf24', fontWeight:700, marginBottom:'10px', display:'flex', alignItems:'center', gap:'5px' }},
                        React.createElement('span', null, '💍'),
                        lang==='ar' ? 'خواتم العلاقة' : 'Relationship Rings',
                        React.createElement('span', { style:{ fontSize:'9px', color:'#6b7280', fontWeight:500, marginLeft:'auto' }},
                            lang==='ar' ? 'الخاتم النشط' : 'Active ring')
                    ),
                    /* All available rings, showing owned/active state */
                    React.createElement('div', { style:{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none' }},
                        RINGS_DATA.map(r => {
                            const isActive = doc.ringId === r.id;
                            const RARITY_C = { Common:'#9ca3af', Uncommon:'#4ade80', Rare:'#60a5fa', Epic:'#a78bfa', Legendary:'#ffd700', Mythic:'#f472b6' };
                            const rc = RARITY_C[r.rarity] || '#9ca3af';
                            return React.createElement('div', {
                                key: r.id,
                                title: lang==='ar' ? r.name_ar : r.name_en,
                                style:{
                                    flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                                    padding:'8px 10px', borderRadius:'12px',
                                    border:`1px solid ${isActive ? r.color+'70' : 'rgba(255,255,255,0.08)'}`,
                                    background: isActive ? `${r.color}18` : 'rgba(255,255,255,0.03)',
                                    boxShadow: isActive ? `0 0 12px ${r.glow}` : 'none',
                                    transition:'.2s', opacity: 1,
                                }
                            },
                                React.createElement('span', { style:{
                                    fontSize:'22px',
                                    filter: isActive ? `drop-shadow(0 0 6px ${r.glow})` : 'grayscale(60%) brightness(0.6)',
                                    transition:'.3s'
                                }}, r.emoji),
                                isActive && React.createElement('span', { style:{ fontSize:'7px', color: r.color, fontWeight:800, textTransform:'uppercase' }},
                                    lang==='ar'?'نشط':'Active'),
                                React.createElement('span', { style:{ fontSize:'7px', color: rc, fontWeight:700 }}, r.rarity)
                            );
                        })
                    ),
                    /* Active ring info */
                    (() => {
                        const activeRing = RINGS_DATA.find(r => r.id === doc.ringId);
                        if (!activeRing) return null;
                        return React.createElement('div', { style:{ marginTop:'10px', padding:'8px 10px', borderRadius:'10px', background:`${activeRing.color}10`, border:`1px solid ${activeRing.color}30`, display:'flex', alignItems:'center', gap:'8px' }},
                            React.createElement('span', { style:{ fontSize:'20px' }}, activeRing.emoji),
                            React.createElement('div', null,
                                React.createElement('div', { style:{ fontSize:'11px', fontWeight:700, color: activeRing.color }},
                                    lang==='ar' ? activeRing.name_ar : activeRing.name_en),
                                React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280' }},
                                    lang==='ar' ? activeRing.desc_ar : activeRing.desc_en)
                            )
                        );
                    })()
                ),

                /* ════ SEND A BLESSING GIFT ════ */
                COUPLE_GIFTS.length > 0 && React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'14px',
                        background:'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(236,72,153,0.06))',
                        border:'1px solid rgba(168,85,247,0.2)' }
                },
                    React.createElement('div', { style:{ fontSize:'11px', color:'#c4b5fd', fontWeight:700, marginBottom:'10px' }},
                        lang==='ar' ? '🎁 أرسل بركة للزوجين' : '🎁 Send a Blessing'),
                    /* Gift row */
                    React.createElement('div', { style:{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'6px' }},
                        COUPLE_GIFTS.map(gift =>
                            React.createElement('button', {
                                key: gift.id,
                                onClick: () => sendBlessingGift(gift),
                                disabled: sending,
                                style:{
                                    flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                                    padding:'8px 10px', borderRadius:'12px', border:'1px solid rgba(168,85,247,0.25)',
                                    background:'rgba(168,85,247,0.1)', cursor:'pointer', transition:'.15s',
                                    opacity: sending ? 0.6 : 1,
                                }
                            },
                                React.createElement('span', { style:{ fontSize:'20px' }}, gift.emoji),
                                React.createElement('span', { style:{ fontSize:'8px', color:'#fcd34d', fontWeight:700 }},
                                    `${gift.cost}🧠`)
                            )
                        )
                    ),
                    /* Feedback */
                    giftOk && React.createElement('div', { style:{ fontSize:'11px', color:'#4ade80', marginTop:'6px', fontWeight:700, textAlign:'center' }}, giftOk),
                    giftErr && React.createElement('div', { style:{ fontSize:'11px', color:'#f87171', marginTop:'6px', fontWeight:700, textAlign:'center' }}, giftErr),
                    React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280', marginTop:'6px', textAlign:'center' }},
                        lang==='ar' ? 'يضاف ✨ بركة + يقسم الكاريزما على الزوجين' : 'Adds ✨ Blessing + splits charisma between the couple')
                ),

                /* ════ GIFT LOG ════ */
                doc.giftLog && doc.giftLog.length > 0 && React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'14px',
                        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }
                },
                    React.createElement('div', { style:{ fontSize:'11px', color:'#9ca3af', fontWeight:700, marginBottom:'10px' }},
                        lang==='ar' ? '🎁 سجل الهدايا' : '🎁 Gift Log'),
                    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'6px' }},
                        [...doc.giftLog].reverse().slice(0, 10).map((entry, i) =>
                            React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 8px',
                                borderRadius:'10px', background:'rgba(255,255,255,0.04)' }},
                                /* Sender avatar */
                                React.createElement('div', { style:{ width:'26px', height:'26px', borderRadius:'50%', overflow:'hidden', flexShrink:0,
                                    background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }},
                                    entry.sp
                                        ? React.createElement('img', { src:entry.sp, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                        : '😎'
                                ),
                                React.createElement('div', { style:{ flex:1, minWidth:0 }},
                                    React.createElement('span', { style:{ fontSize:'11px', color:'#e2e8f0', fontWeight:600 }}, entry.sn || '?'),
                                    React.createElement('span', { style:{ fontSize:'11px', color:'#6b7280' }},
                                        lang==='ar' ? ' أرسل ' : ' sent '),
                                    React.createElement('span', { style:{ fontSize:'13px' }}, entry.ge)
                                ),
                                React.createElement('div', { style:{ fontSize:'9px', color:'rgba(168,85,247,0.8)', fontWeight:700, flexShrink:0 }},
                                    `+${entry.bp||0}✨`)
                            )
                        )
                    )
                ),

                /* ════ DIVORCE — 3-step with think-twice warning ════ */
                isMember && (

                    divorceStep === 0 && React.createElement('button', {
                        onClick: () => setDivorceStep(1),
                        style:{ padding:'10px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.2)',
                            background:'rgba(239,68,68,0.05)', color:'rgba(239,68,68,0.55)',
                            fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'center', width:'100%' }
                    }, lang==='ar' ? '💔 إنهاء الارتباط' : '💔 End Relationship') ||

                    divorceStep === 1 && React.createElement('div', {
                        style:{ padding:'16px', borderRadius:'18px',
                            background:'linear-gradient(135deg,rgba(251,146,60,0.12),rgba(239,68,68,0.08))',
                            border:'1px solid rgba(251,146,60,0.4)',
                            display:'flex', flexDirection:'column', gap:'12px' }
                    },
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'10px' }},
                            React.createElement('span', { style:{ fontSize:'30px', flexShrink:0 }}, '⚠️'),
                            React.createElement('div', null,
                                React.createElement('div', { style:{ fontSize:'14px', fontWeight:900, color:'#fbbf24', lineHeight:1.3 }},
                                    lang==='ar' ? 'فكّر مرتين قبل أن تطلق!' : 'Think twice before divorcing!'),
                                React.createElement('div', { style:{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }},
                                    lang==='ar'
                                        ? `أنتم معاً مع ${partnerData?.displayName || ''} منذ:`
                                        : `You have been with ${partnerData?.displayName || ''} for:`)
                            )
                        ),
                        React.createElement('div', { style:{ background:'rgba(0,0,0,0.35)', borderRadius:'14px', padding:'12px',
                            display:'flex', alignItems:'center', justifyContent:'center' }},
                            [
                                { val:timer.days,  label_ar:'يوم',   label_en:'Days'  },
                                { val:timer.hours, label_ar:'ساعة',  label_en:'Hours' },
                                { val:timer.mins,  label_ar:'دقيقة', label_en:'Mins'  },
                            ].map((item, i) => React.createElement(React.Fragment, { key:i },
                                i > 0 && React.createElement('div', {
                                    style:{ fontSize:'20px', color:'rgba(251,146,60,0.4)', fontWeight:900, margin:'0 4px', paddingBottom:'14px' }
                                }, ':'),
                                React.createElement('div', { style:{ textAlign:'center', minWidth:'44px' }},
                                    React.createElement('div', { style:{ fontSize:'28px', fontWeight:900, color:'#fbbf24',
                                        textShadow:'0 0 16px rgba(251,146,60,0.5)' }}, item.val),
                                    React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280', marginTop:'2px' }},
                                        lang==='ar' ? item.label_ar : item.label_en)
                                )
                            ))
                        ),
                        React.createElement('div', { style:{ fontSize:'12px', color:'#9ca3af', textAlign:'center', fontStyle:'italic', padding:'0 4px', lineHeight:1.5 }},
                            lang==='ar' ? 'هل تريد فعلاً إنهاء كل هذه الذكريات الجميلة؟ 💔' : 'Are you sure you want to throw away all these beautiful memories? 💔'),
                        React.createElement('div', { style:{ display:'flex', gap:'10px' }},
                            React.createElement('button', { onClick: () => setDivorceStep(0),
                                style:{ flex:2, padding:'12px', borderRadius:'12px',
                                    border:'1px solid rgba(74,222,128,0.35)', background:'rgba(74,222,128,0.1)',
                                    color:'#4ade80', fontSize:'12px', fontWeight:800, cursor:'pointer' }
                            }, lang==='ar' ? '💚 أبقى معه/معها' : '💚 Stay Together'),
                            React.createElement('button', { onClick: () => setDivorceStep(2),
                                style:{ flex:1, padding:'12px', borderRadius:'12px',
                                    border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)',
                                    color:'#f87171', fontSize:'12px', fontWeight:700, cursor:'pointer' }
                            }, lang==='ar' ? 'متأكد؟' : 'Proceed')
                        )
                    ) ||

                    divorceStep === 2 && React.createElement('div', {
                        style:{ padding:'14px', borderRadius:'14px', border:'1px solid rgba(239,68,68,0.4)',
                            background:'rgba(239,68,68,0.1)', textAlign:'center',
                            display:'flex', flexDirection:'column', gap:'10px' }
                    },
                        React.createElement('div', { style:{ fontSize:'13px', color:'#f87171', fontWeight:900 }},
                            lang==='ar' ? '🔴 هذا القرار لا يمكن التراجع عنه نهائياً!' : '🔴 This cannot be undone!'),
                        React.createElement('div', { style:{ display:'flex', gap:'10px' }},
                            React.createElement('button', { onClick: () => setDivorceStep(0),
                                style:{ flex:1, padding:'11px', borderRadius:'10px',
                                    border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)',
                                    color:'#9ca3af', fontSize:'12px', cursor:'pointer' }
                            }, lang==='ar' ? 'تراجع' : 'Cancel'),
                            React.createElement('button', { onClick: handleDivorce, disabled: divorcing,
                                style:{ flex:1, padding:'11px', borderRadius:'10px', border:'none',
                                    background:'rgba(239,68,68,0.88)', color:'white',
                                    fontSize:'13px', fontWeight:900, cursor:'pointer',
                                    boxShadow:'0 4px 14px rgba(239,68,68,0.4)',
                                    opacity: divorcing ? 0.7 : 1 }
                            }, divorcing ? '⏳' : (lang==='ar' ? '💔 طلاق نهائي' : '💔 Confirm Divorce'))
                        )
                    )
                )
            )
        ))
    );
};


// ─────────────────────────────────────────────
// 💍 RING SHOP SECTION (injected into ShopModal)
// ─────────────────────────────────────────────
const RingsShopSection = ({ userData, lang, currentUID, onPropose }) => {
    const currency    = userData?.currency || 0;
    const isMarried   = userData?.isMarried || false;
    const charismaLvl = getCharismaLevel(userData?.charisma || 0).currentLevel.level;

    return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'12px', padding:'4px 0' }},
        /* Info banner */
        isMarried && React.createElement('div', {
            style:{ padding:'10px 14px', borderRadius:'10px', textAlign:'center',
                background:'rgba(236,72,153,0.1)', border:'1px solid rgba(236,72,153,0.3)',
                fontSize:'12px', color:'#f9a8d4', fontWeight:700 }
        }, lang==='ar' ? '💍 أنت مرتبط بالفعل — لا يمكن شراء خاتم' : '💍 You are already in a relationship — cannot buy a ring'),

        /* Rings grid */
        RINGS_DATA.map(ring => {
            const meetsLevel  = charismaLvl >= ring.levelReq;
            const canAfford   = currency >= ring.cost;
            const disabled    = isMarried || !meetsLevel;

            return React.createElement('div', {
                key: ring.id,
                style:{
                    padding:'14px 16px', borderRadius:'14px',
                    background:`linear-gradient(135deg, ${ring.color}12, ${ring.color}06)`,
                    border:`1px solid ${disabled ? 'rgba(255,255,255,0.07)' : ring.color+'40'}`,
                    display:'flex', alignItems:'center', gap:'12px',
                    opacity: disabled ? 0.55 : 1, transition:'.2s',
                }
            },
                React.createElement('span', { style:{ fontSize:'26px', flexShrink:0 }}, ring.emoji),
                React.createElement('div', { style:{ flex:1, minWidth:0 }},
                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color: disabled ? '#6b7280' : ring.color }},
                        lang==='ar' ? ring.name_ar : ring.name_en),
                    React.createElement('div', { style:{ fontSize:'10px', color: RARITY_COLORS_C[ring.rarity], fontWeight:700, marginTop:'1px' }},
                        ring.rarity),
                    React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }},
                        lang==='ar' ? ring.desc_ar : ring.desc_en),
                    !meetsLevel && React.createElement('div', { style:{ fontSize:'10px', color:'#f97316', marginTop:'3px', fontWeight:700 }},
                        lang==='ar' ? `يتطلب مستوى كاريزما ${ring.levelReq}` : `Requires Charisma Lv${ring.levelReq}`)
                ),
                React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }},
                    React.createElement('div', { style:{ fontSize:'12px', fontWeight:800, color: canAfford ? '#fcd34d' : '#ef4444' }},
                        `${ring.cost.toLocaleString()} 🧠`),
                    React.createElement('button', {
                        onClick: () => !disabled && onPropose(ring),
                        disabled: disabled,
                        style:{
                            padding:'7px 14px', borderRadius:'10px', border:'none', fontSize:'11px', fontWeight:800,
                            cursor: disabled ? 'not-allowed' : 'pointer', transition:'.2s',
                            background: disabled ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,#ec4899,#a855f7)`,
                            color: disabled ? '#4b5563' : 'white',
                            boxShadow: !disabled ? '0 3px 14px rgba(236,72,153,0.4)' : 'none',
                        }
                    }, lang==='ar' ? '💍 اختر' : '💍 Select')
                )
            );
        })
    );
};

// ─────────────────────────────────────────────
// 💒 WEDDING HALL MODAL
// ─────────────────────────────────────────────
const WeddingHallModal = ({
    show, onClose, lang,
    currentUID, currentUserData, coupleData, partnerData,
    onOpenPropose,      // opens ring shop
    onOpenCoupleCard,   // opens couple card
    onDivorce,          // calls divorceCouple
    onNotification,
}) => {
    const [tab, setTab]             = useState('feed');   // 'feed' | 'divorce'
    const [couples, setCouples]     = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [coupleProfiles, setCoupleProfiles] = useState({}); // uid → userData
    const [viewCouple, setViewCouple]   = useState(null);
    const [viewSelf, setViewSelf]       = useState(null);
    const [viewPartner, setViewPartner] = useState(null);
    const [showViewCard, setShowViewCard] = useState(false);
    const [divorcing, setDivorcing]     = useState(false);
    const [divorceConfirm, setDivorceConfirm] = useState(false);

    useEffect(() => {
        if (!show) return;
        setLoadingFeed(true);
        const unsub = couplesCollection
            .where('status', '==', 'accepted')
            .orderBy('marriageDate', 'desc')
            .limit(30)
            .onSnapshot(async snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setCouples(docs);
                // Batch-load all user profiles not yet cached
                const uids = new Set();
                docs.forEach(c => { uids.add(c.uid1); uids.add(c.uid2); });
                const toLoad = [...uids].filter(uid => !coupleProfiles[uid]);
                if (toLoad.length > 0) {
                    const chunks = [];
                    for (let i = 0; i < toLoad.length; i += 10) chunks.push(toLoad.slice(i, i+10));
                    const profiles = { ...coupleProfiles };
                    await Promise.all(chunks.map(async chunk => {
                        const snap = await usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
                        snap.docs.forEach(d => { profiles[d.id] = { id: d.id, ...d.data() }; });
                    }));
                    setCoupleProfiles(profiles);
                }
                setLoadingFeed(false);
            }, () => setLoadingFeed(false));
        return () => unsub();
    }, [show]);

    if (!show) return null;

    const ring = RINGS_DATA.find(r => r.id === coupleData?.ringId) || RINGS_DATA[0];

    const fmtTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    };

    const handleOpenCouple = (coupleDoc) => {
        const u1 = coupleProfiles[coupleDoc.uid1];
        const u2 = coupleProfiles[coupleDoc.uid2];
        if (!u1 || !u2) return;
        if (coupleDoc.uid1 === currentUID || coupleDoc.uid2 === currentUID) {
            // It's the viewer's own couple — open the actual interactive card
            onOpenCoupleCard && onOpenCoupleCard();
            return;
        }
        setViewCouple(coupleDoc);
        setViewSelf(u1);
        setViewPartner(u2);
        setShowViewCard(true);
    };

    const handleDivorce = async () => {
        if (!coupleData) return;
        setDivorcing(true);
        await divorceCouple({
            coupleDocId: coupleData.id,
            uid1: coupleData.uid1,
            uid2: coupleData.uid2,
            onNotification,
            lang,
        });
        setDivorcing(false);
        setDivorceConfirm(false);
        onClose();
    };

    // Small avatar helper
    const Av = ({ user, size = 44 }) => React.createElement('div', {
        style:{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
            border:'2px solid rgba(236,72,153,0.4)', background:'rgba(255,255,255,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize: Math.floor(size*0.45) }
    }, user?.photoURL
        ? React.createElement('img', { src:user.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
        : '😎'
    );

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            onClick: onClose,
            style:{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH + 4,
                background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'flex-end',
                justifyContent:'center' }
        },
        React.createElement('div', {
            className:'animate-pop',
            onClick: e => e.stopPropagation(),
            style:{
                width:'100%', maxWidth:'480px', height:'90vh',
                background:'#0d0d1a',
                borderRadius:'24px 24px 0 0',
                display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 -10px 60px rgba(236,72,153,0.15)',
                border:'1px solid rgba(236,72,153,0.15)',
                borderBottom:'none',
            }
        },

            /* ── Handle bar ── */
            React.createElement('div', { style:{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }},
                React.createElement('div', { style:{ width:'40px', height:'4px', borderRadius:'4px', background:'rgba(255,255,255,0.15)' }})
            ),

            /* ── Header ── */
            React.createElement('div', { style:{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'8px 18px 12px', flexShrink:0
            }},
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'16px', fontWeight:900, color:'white' }}, '💒 ' + (lang==='ar' ? 'قاعة الأفراح' : 'Wedding Hall')),
                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', marginTop:'2px' }},
                        lang==='ar' ? 'اكتشف الكابلز وأرسل طلبك' : 'Discover couples & send your proposal')
                ),
                React.createElement('button', {
                    onClick: onClose,
                    style:{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'10px',
                        color:'#9ca3af', fontSize:'18px', width:'34px', height:'34px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center' }
                }, '✕')
            ),

            /* ── 3 Action Buttons ── */
            React.createElement('div', { style:{
                display:'flex', gap:'10px', padding:'0 16px 14px', flexShrink:0
            }},
                /* Propose */
                React.createElement('button', {
                    onClick: () => { onClose(); setTimeout(() => onOpenPropose && onOpenPropose(), 50); },
                    style:{
                        flex:1, padding:'11px 6px', borderRadius:'14px', border:'none', cursor:'pointer',
                        background:'linear-gradient(135deg,#ec4899,#be185d)',
                        color:'white', fontSize:'12px', fontWeight:800,
                        boxShadow:'0 4px 16px rgba(236,72,153,0.4)',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                    }
                },
                    React.createElement('span', { style:{ fontSize:'18px' }}, '💍'),
                    lang==='ar' ? 'خطبة' : 'Propose'
                ),
                /* Today's Weddings */
                React.createElement('button', {
                    onClick: () => setTab('feed'),
                    style:{
                        flex:1, padding:'11px 6px', borderRadius:'14px', border:'none', cursor:'pointer',
                        background: tab === 'feed'
                            ? 'linear-gradient(135deg,#7c3aed,#4c1d95)'
                            : 'rgba(124,58,237,0.15)',
                        border: tab === 'feed' ? 'none' : '1px solid rgba(124,58,237,0.3)',
                        color:'white', fontSize:'12px', fontWeight:800,
                        boxShadow: tab === 'feed' ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                    }
                },
                    React.createElement('span', { style:{ fontSize:'18px' }}, '💒'),
                    lang==='ar' ? 'أفراح اليوم' : 'Weddings'
                ),
                /* Divorce */
                React.createElement('button', {
                    onClick: () => setTab('divorce'),
                    style:{
                        flex:1, padding:'11px 6px', borderRadius:'14px', border:'none', cursor:'pointer',
                        background: tab === 'divorce'
                            ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
                            : 'rgba(59,130,246,0.15)',
                        border: tab === 'divorce' ? 'none' : '1px solid rgba(59,130,246,0.3)',
                        color:'white', fontSize:'12px', fontWeight:800,
                        boxShadow: tab === 'divorce' ? '0 4px 16px rgba(59,130,246,0.4)' : 'none',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                    }
                },
                    React.createElement('span', { style:{ fontSize:'18px' }}, '💔'),
                    lang==='ar' ? 'طلاق' : 'Divorce'
                )
            ),

            /* ── Divider ── */
            React.createElement('div', { style:{ height:'1px', background:'rgba(255,255,255,0.07)', flexShrink:0 }}),

            /* ── Content ── */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'14px 16px' }},

                /* ──── FEED TAB ──── */
                tab === 'feed' && (
                    loadingFeed
                        ? React.createElement('div', { style:{ textAlign:'center', padding:'40px', color:'#6b7280' }}, '⏳')
                        : couples.length === 0
                            ? React.createElement('div', { style:{ textAlign:'center', padding:'40px' }},
                                React.createElement('div', { style:{ fontSize:'48px', marginBottom:'12px' }}, '💒'),
                                React.createElement('div', { style:{ fontSize:'13px', color:'#6b7280' }},
                                    lang==='ar' ? 'لا يوجد أفراح اليوم' : 'No weddings today'))
                            : React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'12px' }},
                                couples.map(c => {
                                    const u1 = coupleProfiles[c.uid1];
                                    const u2 = coupleProfiles[c.uid2];
                                    const cRing = RINGS_DATA.find(r => r.id === c.ringId) || RINGS_DATA[0];
                                    const isMyCouple = c.uid1 === currentUID || c.uid2 === currentUID;
                                    return React.createElement('div', {
                                        key: c.id,
                                        onClick: () => handleOpenCouple(c),
                                        style:{
                                            background: isMyCouple
                                                ? 'linear-gradient(135deg,rgba(236,72,153,0.12),rgba(168,85,247,0.1))'
                                                : 'rgba(255,255,255,0.04)',
                                            border:`1px solid ${isMyCouple ? 'rgba(236,72,153,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius:'18px', padding:'14px 16px', cursor:'pointer',
                                            transition:'.15s',
                                        }
                                    },
                                        /* Title row */
                                        React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }},
                                            React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color: isMyCouple ? '#f9a8d4' : '#e2e8f0' }},
                                                `${u1?.displayName || '—'} ${lang==='ar'?'و':'&'} ${u2?.displayName || '—'}`,
                                                isMyCouple && React.createElement('span', { style:{ marginLeft:'6px', fontSize:'10px', background:'rgba(236,72,153,0.2)', color:'#f9a8d4', border:'1px solid rgba(236,72,153,0.4)', borderRadius:'6px', padding:'1px 7px' }}, lang==='ar'?'أنتم':'You')
                                            ),
                                            React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280', background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'3px 8px' }},
                                                fmtTime(c.marriageDate))
                                        ),
                                        /* Avatars + ring */
                                        React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }},
                                            React.createElement(Av, { user:u1, size:48 }),
                                            React.createElement('div', { style:{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }},
                                                React.createElement('div', { style:{ height:'2px', width:'100%', background:`linear-gradient(90deg, rgba(236,72,153,0.3), ${cRing.color}60, rgba(236,72,153,0.3))`, borderRadius:'4px' }}),
                                                React.createElement('div', { style:{ position:'absolute', fontSize:'20px', filter:`drop-shadow(0 0 6px ${cRing.glow})` }}, cRing.emoji)
                                            ),
                                            React.createElement(Av, { user:u2, size:48 })
                                        ),
                                        /* Shared bio if exists */
                                        c.sharedBio && React.createElement('div', { style:{ marginTop:'10px', fontSize:'11px', color:'#9ca3af', fontStyle:'italic', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'8px' }},
                                            `"${c.sharedBio}"`)
                                    );
                                })
                            )
                ),

                /* ──── DIVORCE TAB ──── */
                tab === 'divorce' && React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' }},
                    !coupleData
                        ? React.createElement('div', { style:{ textAlign:'center', padding:'40px' }},
                            React.createElement('div', { style:{ fontSize:'40px', marginBottom:'12px' }}, '💔'),
                            React.createElement('div', { style:{ fontSize:'13px', color:'#6b7280' }},
                                lang==='ar' ? 'لست مرتبطاً حالياً' : 'You are not in a relationship'))
                        : React.createElement('div', null,
                            /* Current couple summary */
                            React.createElement('div', { style:{ padding:'16px', borderRadius:'16px', background:'rgba(236,72,153,0.08)', border:'1px solid rgba(236,72,153,0.2)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'14px' }},
                                React.createElement(Av, { user:currentUserData, size:44 }),
                                React.createElement('span', { style:{ fontSize:'22px' }}, '💕'),
                                React.createElement(Av, { user:partnerData, size:44 }),
                                React.createElement('div', { style:{ marginLeft:'8px', flex:1 }},
                                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:700, color:'white' }},
                                        partnerData?.displayName || '—'),
                                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4' }},
                                        (() => { const d = coupleTimeDiff(coupleData?.marriageDate); return d ? (lang==='ar' ? `معاً ${d.days} يوم` : `Together ${d.days} days`) : ''; })())
                                )
                            ),
                            !divorceConfirm
                                ? React.createElement('button', {
                                    onClick: () => setDivorceConfirm(true),
                                    style:{ width:'100%', padding:'14px', borderRadius:'14px', border:'none',
                                        background:'linear-gradient(135deg,#ef4444,#b91c1c)',
                                        color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer',
                                        boxShadow:'0 4px 16px rgba(239,68,68,0.3)' }
                                  }, lang==='ar' ? '💔 إنهاء الارتباط' : '💔 End Relationship')
                                : React.createElement('div', { style:{ padding:'16px', borderRadius:'14px', border:'1px solid rgba(239,68,68,0.35)', background:'rgba(239,68,68,0.08)', textAlign:'center' }},
                                    React.createElement('div', { style:{ fontSize:'13px', color:'#f87171', fontWeight:700, marginBottom:'12px' }},
                                        lang==='ar' ? '⚠️ هل أنت متأكد؟ لا يمكن التراجع!' : '⚠️ Are you sure? This cannot be undone!'),
                                    React.createElement('div', { style:{ display:'flex', gap:'10px' }},
                                        React.createElement('button', { onClick:()=>setDivorceConfirm(false), style:{ flex:1, padding:'11px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'#9ca3af', fontSize:'12px', cursor:'pointer' }},
                                            lang==='ar' ? 'تراجع' : 'Cancel'),
                                        React.createElement('button', { onClick:handleDivorce, disabled:divorcing, style:{ flex:1, padding:'11px', borderRadius:'12px', border:'none', background:'rgba(239,68,68,0.8)', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }},
                                            divorcing ? '⏳' : (lang==='ar' ? '💔 تأكيد' : '💔 Confirm'))
                                    )
                                  )
                          )
                )
            )
        )),

        /* View-only CoupleCardModal for other couples (no edit) */
        showViewCard && viewCouple && React.createElement(CoupleCardModal, {
            show: showViewCard,
            onClose: () => setShowViewCard(false),
            coupleDoc: viewCouple,
            currentUID,
            selfData: viewSelf,
            partnerData: viewPartner,
            lang,
            onNotification,
            viewOnly: true,
        })
    );
};
