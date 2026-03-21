// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ’ PRO SPY â€” COUPLES / MARRIAGE SYSTEM  (20-couples.js)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Load order: after 19-family.js and before 16-main.js
// Exposes: CoupleCardModal, ProposalModal, IncomingProposalModal
// Data:    RINGS_DATA, COUPLE_GIFTS_DATA
// Helpers: sendProposal, acceptProposal, declineProposal, divorceCouple
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// couplesCollection â€” defined in 01-config.js

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ’ RINGS DATA â€” Extended with admin/event fields
// event: labeled "Event" in shop | hidden: doesn't appear in shop | limited: shows countdown
// imageURL: custom image overrides emoji | glow: custom glow color
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var INGS_DATA = [
    { id:'ring_bronze',   emoji:'ðŸ’', imageURL:null, name_en:'Bronze Ring',      name_ar:'Ø®Ø§ØªÙ… Ø¨Ø±ÙˆÙ†Ø²ÙŠ',     cost:500,   levelReq:0,  rarity:'Common',    color:'#cd7f32', glow:'rgba(205,127,50,0.4)',  desc_en:'A warm start to forever.',    desc_ar:'Ø¨Ø¯Ø§ÙŠØ© Ø¯Ø§ÙØ¦Ø© Ù„Ù„Ø£Ø¨Ø¯ÙŠØ©.',   event:false, hidden:false, limited:false, limitedUntil:null },
             { id:'kingshehab',   emoji:null, imageURL:'https://res.cloudinary.com/dqewgiqsh/image/upload/v1773406707/ringking_lxnly9.gif', name_en:'King Ring',     name_ar:'Ø®Ø§ØªÙ… Ø§Ù„Ù…Ù„Ùƒ',      cost:500,   levelReq:0,  rarity:'Mythic',    color:'#f0abfc', glow:'rgba(240,171,252,0.6)', desc_en:'The ring of kings â€” a royal bond.',  desc_ar:'Ø®Ø§ØªÙ… Ø§Ù„Ù…Ù„ÙˆÙƒ â€” Ø±Ø§Ø¨Ø·Ø© Ù…Ù„ÙƒÙŠØ© Ø£Ø¨Ø¯ÙŠØ©.',  event:true, hidden:false, limited:false, limitedUntil:null },
    { id:'ring_silver',   emoji:'ðŸ’', imageURL:null, name_en:'Silver Ring',      name_ar:'Ø®Ø§ØªÙ… ÙØ¶ÙŠ',        cost:1500,  levelReq:3,  rarity:'Uncommon',  color:'#c0c0c0', glow:'rgba(192,192,192,0.4)', desc_en:'Elegant and timeless.',       desc_ar:'Ø£Ù†Ø§Ù‚Ø© Ø®Ø§Ù„Ø¯Ø©.',            event:false, hidden:false, limited:false, limitedUntil:null },
    { id:'ring_gold',     emoji:'ðŸ’', imageURL:null, name_en:'Gold Ring',        name_ar:'Ø®Ø§ØªÙ… Ø°Ù‡Ø¨ÙŠ',       cost:3000,  levelReq:5,  rarity:'Rare',      color:'#ffd700', glow:'rgba(255,215,0,0.5)',   desc_en:'Golden love, golden future.', desc_ar:'Ø­Ø¨ Ø°Ù‡Ø¨ÙŠØŒ Ù…Ø³ØªÙ‚Ø¨Ù„ Ø°Ù‡Ø¨ÙŠ.',   event:false, hidden:false, limited:false, limitedUntil:null },
    { id:'ring_rose',     emoji:'ðŸ’', imageURL:null, name_en:'Rose Gold Ring',   name_ar:'Ø®Ø§ØªÙ… Ø°Ù‡Ø¨ÙŠ ÙˆØ±Ø¯ÙŠ',  cost:5000,  levelReq:7,  rarity:'Epic',      color:'#f9a8d4', glow:'rgba(249,168,212,0.5)', desc_en:'Blush pink, bold love.',      desc_ar:'ÙˆØ±Ø¯ÙŠ Ø±Ù‚ÙŠÙ‚ØŒ Ø­Ø¨ Ø¬Ø±ÙŠØ¡.',     event:false, hidden:false, limited:false, limitedUntil:null },
    { id:'ring_diamond',  emoji:'ðŸ’Ž', imageURL:null, name_en:'Diamond Ring',     name_ar:'Ø®Ø§ØªÙ… Ø§Ù„Ù…Ø§Ø³',      cost:10000, levelReq:10, rarity:'Legendary', color:'#00d4ff', glow:'rgba(0,212,255,0.6)',   desc_en:'Forever brilliant.',          desc_ar:'Ù„Ø§Ù…Ø¹ Ø¥Ù„Ù‰ Ø§Ù„Ø£Ø¨Ø¯.',         event:false, hidden:false, limited:false, limitedUntil:null },
    { id:'ring_eternal',  emoji:'âœ¨', imageURL:null, name_en:'Eternal Ring',     name_ar:'Ø®Ø§ØªÙ… Ø§Ù„Ø£Ø¨Ø¯ÙŠØ©',    cost:25000, levelReq:15, rarity:'Mythic',    color:'#a855f7', glow:'rgba(168,85,247,0.7)',  desc_en:'Beyond time and space.',      desc_ar:'Ø£Ø¨Ø¹Ø¯ Ù…Ù† Ø§Ù„Ø²Ù…Ø§Ù† ÙˆØ§Ù„Ù…ÙƒØ§Ù†.', event:false, hidden:false, limited:false, limitedUntil:null },
    // â”€â”€ EVENT RINGS (hidden by default, revealed via admin/events) â”€â”€
    { id:'ring_valentine',emoji:'ðŸ’', imageURL:null, name_en:"Valentine's Ring", name_ar:'Ø®Ø§ØªÙ… Ø§Ù„ÙØ§Ù„Ù†ØªØ§ÙŠÙ†', cost:8000,  levelReq:0,  rarity:'Epic',      color:'#f43f5e', glow:'rgba(244,63,94,0.6)',   desc_en:'Limited edition love ring.',  desc_ar:'Ø®Ø§ØªÙ… Ø­Ø¨ Ù…Ø­Ø¯ÙˆØ¯.',          event:true,  hidden:true,  limited:true,  limitedUntil:null },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸŽ PROPOSAL GIFTS DATA
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var ROPOSAL_GIFTS = [
    { id:'pg_rose',      emoji:'ðŸŒ¹', name_en:'Red Rose',      name_ar:'ÙˆØ±Ø¯Ø© Ø­Ù…Ø±Ø§Ø¡',     cost:100,  charisma:200  },
    { id:'pg_bouquet',   emoji:'ðŸ’', name_en:'Bouquet',       name_ar:'Ø¨Ø§Ù‚Ø© Ø²Ù‡ÙˆØ±',      cost:300,  charisma:600  },
    { id:'pg_chocolate', emoji:'ðŸ«', name_en:'Chocolates',    name_ar:'Ø´ÙˆÙƒÙˆÙ„Ø§ØªØ©',       cost:500,  charisma:1000 },
    { id:'pg_teddy',     emoji:'ðŸ§¸', name_en:'Teddy Bear',    name_ar:'Ø¯Ø¨Ø¯ÙˆØ¨',           cost:800,  charisma:1600 },
    { id:'pg_cake',      emoji:'ðŸŽ‚', name_en:'Love Cake',     name_ar:'ÙƒÙŠÙƒØ© Ø§Ù„Ø­Ø¨',      cost:1200, charisma:2400 },
    { id:'pg_heart',     emoji:'ðŸ’', name_en:'Heart Box',     name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„Ù‚Ù„Ø¨',    cost:2000, charisma:4000 },
    { id:'pg_stars',     emoji:'â­', name_en:'Falling Stars', name_ar:'Ù†ÙŠØ§Ø²Ùƒ Ø§Ù„Ø­Ø¨',     cost:3000, charisma:6000 },
    { id:'pg_crown',     emoji:'ðŸ‘‘', name_en:'Love Crown',    name_ar:'ØªØ§Ø¬ Ø§Ù„Ø­Ø¨',       cost:5000, charisma:10000},
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸŽ¨ HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var ARITY_COLORS_C = {
    Common:'#9ca3af', Uncommon:'#4ade80', Rare:'#60a5fa',
    Epic:'#a78bfa',   Legendary:'#ffd700', Mythic:'#f0abfc',
};

var oupleTimeDiff = (marriageDate) => {
    if (!marriageDate) return null;
    const start = marriageDate.toDate ? marriageDate.toDate() : new Date(marriageDate.seconds * 1000);
    const diff = Date.now() - start.getTime();
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    return { days, hours, mins };
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ–¼ï¸ RingImageCanvas â€” removes black bg pixels via canvas.
// Uses crossOrigin="anonymous" so getImageData never throws.
// Hidden DOM img keeps GIF frames advancing for animation.
// Only used where mix-blend-mode fails (inside position:absolute+zIndex stacking contexts).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var ingImageCanvas = ({ src, size = 40, glow }) => {
    const canvasRef = React.useRef(null);
    const imgRef    = React.useRef(null);
    const rafRef    = React.useRef(null);

    React.useEffect(() => {
        if (!src) return;
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let running = true;

        const draw = () => {
            if (!running) return;
            if (img.naturalWidth > 0) {
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
                try {
                    const id = ctx.getImageData(0, 0, size, size);
                    const d  = id.data;
                    for (let i = 0; i < d.length; i += 4) {
                        if (d[i] < 45 && d[i+1] < 45 && d[i+2] < 45) d[i+3] = 0;
                    }
                    ctx.putImageData(id, 0, 0);
                } catch(e) { /* CORS blocked â€” shows as-is */ }
            }
            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => { running = false; cancelAnimationFrame(rafRef.current); };
    }, [src, size]);

    return React.createElement(React.Fragment, null,
        /* crossOrigin="anonymous" is CRITICAL â€” without it, getImageData throws SecurityError
           position:fixed off-screen keeps the img in DOM so browser advances GIF frames */
        React.createElement('img', {
            ref: imgRef,
            src,
            crossOrigin: 'anonymous',
            alt: '',
            style: { position:'fixed', left:'-9999px', top:'-9999px',
                     width:`${size}px`, height:`${size}px`, pointerEvents:'none', opacity:0.01 }
        }),
        React.createElement('canvas', {
            ref: canvasRef, width: size, height: size,
            style: {
                display: 'block',
                filter: glow ? `drop-shadow(0 0 8px ${glow}) drop-shadow(0 0 16px ${glow})` : undefined
            }
        })
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ”§ FIRESTORE LOGIC
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Send a proposal: creates a couple doc with status='pending', deducts cost, sends notification
var endProposal = async ({ fromUID, toUID, fromData, ringId, giftId, message, onNotification, lang }) => {
    const ring = RINGS_DATA.find(r => r.id === ringId);
    const gift = PROPOSAL_GIFTS.find(g => g.id === giftId);
    if (!ring) return { ok: false, err: 'No ring selected' };

    const totalCost = ring.cost + (gift?.cost || 0);
    const currency  = fromData?.currency || 0;
    if (currency < totalCost) {
        onNotification && onNotification(lang==='ar' ? `âŒ ØªØ­ØªØ§Ø¬ ${totalCost} ðŸ§ ` : `âŒ Need ${totalCost} ðŸ§ `);
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
            onNotification && onNotification(lang==='ar' ? 'âŒ ÙŠÙˆØ¬Ø¯ Ø·Ù„Ø¨ Ø£Ùˆ Ø§Ø±ØªØ¨Ø§Ø· Ù†Ø´Ø· Ø¨Ø§Ù„ÙØ¹Ù„' : 'âŒ An active proposal or couple already exists');
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
            createdAt: TS(),
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
                ? `ðŸ’ ${fromData?.displayName} Ø£Ø±Ø³Ù„ Ù„Ùƒ Ø·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·!`
                : `ðŸ’ ${fromData?.displayName} sent you a proposal!`,
            ringId,
            giftId: giftId || null,
            proposalMessage: message || '',
            coupleDocId: coupleRef.id,
            timestamp: TS(),
            read: false,
        });

        // Love Bot notification
        if (typeof sendLoveBotMessage === 'function') {
            await sendLoveBotMessage(toUID, {
                type: 'proposal',
                fromName: fromData?.displayName || 'Someone',
                fromPhoto: fromData?.photoURL || null,
                fromUID,
                coupleDocId: coupleRef.id,
                lang,
            });
        }

        onNotification && onNotification(lang==='ar' ? 'ðŸ’ ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨!' : 'ðŸ’ Proposal sent!');
        return { ok: true, coupleDocId: coupleRef.id };
    } catch(e) {
        console.error('sendProposal error', e);
        onNotification && onNotification(lang==='ar' ? 'âŒ Ø®Ø·Ø£' : 'âŒ Error');
        return { ok: false, err: e.message };
    }
};

var cceptProposal = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.update(couplesCollection.doc(coupleDocId), {
            status: 'accepted',
            marriageDate: TS(),
        });
        batch.update(usersCollection.doc(uid1), { partnerId: uid2, isMarried: true });
        batch.update(usersCollection.doc(uid2), { partnerId: uid1, isMarried: true });
        await batch.commit();

        // Notification to proposer
        await notificationsCollection.add({
            toUserId: uid1,
            fromUserId: uid2,
            type: 'couple_accepted',
            message: lang==='ar' ? 'ðŸ’– Ù‚Ø¨Ù„ÙˆØ§ Ø·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·Ùƒ!' : 'ðŸ’– Your proposal was accepted!',
            timestamp: TS(),
            read: false,
        });

        onNotification && onNotification(lang==='ar' ? 'ðŸ’– Ù‚Ø¨Ù„Øª Ø§Ù„Ø·Ù„Ø¨!' : 'ðŸ’– Proposal accepted!');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

var eclineProposal = async ({ coupleDocId, fromUID, toUID, ringCost, giftCost, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.delete(couplesCollection.doc(coupleDocId));
        // Refund ring cost to proposer
        batch.update(usersCollection.doc(fromUID), {
            currency: firebase.firestore.FieldValue.increment(ringCost + (giftCost || 0)),
        });
        await batch.commit();
        onNotification && onNotification(lang==='ar' ? 'ØªÙ… Ø§Ù„Ø±ÙØ¶ ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø¥Ù†ØªÙ„' : 'Proposal declined & Intel refunded');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

var ivorceCouple = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
    try {
        const batch = db.batch();
        batch.delete(couplesCollection.doc(coupleDocId));
        batch.update(usersCollection.doc(uid1), { partnerId: null, isMarried: false });
        batch.update(usersCollection.doc(uid2), { partnerId: null, isMarried: false });
        await batch.commit();
        onNotification && onNotification(lang==='ar' ? 'ðŸ’” ØªÙ… Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·' : 'ðŸ’” Relationship ended');
        return { ok: true };
    } catch(e) {
        return { ok: false };
    }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ’« FLOATING HEARTS ANIMATION (pure JS canvas-free)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var loatingHearts = () => {
    const HEARTS = ['â¤ï¸','ðŸ’•','ðŸ’—','ðŸ’–','ðŸ’˜','ðŸ’“'];
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ’ INCOMING PROPOSAL MODAL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var ncomingProposalModal = ({ show, coupleDoc, fromData, currentUID, lang, onAccept, onDecline }) => {
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
                React.createElement('div', { style:{ fontSize:'42px', marginBottom:'8px' }}, ring?.emoji || 'ðŸ’'),
                React.createElement('div', { style:{ fontSize:'18px', fontWeight:900, color:'white', marginBottom:'4px' }},
                    lang==='ar' ? 'ðŸ’ Ø·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·!' : 'ðŸ’ Marriage Proposal!'),
                React.createElement('div', { style:{ fontSize:'12px', color:'rgba(249,168,212,0.8)' }},
                    fromData?.displayName || '...',
                    lang==='ar' ? ' Ø£Ø±Ø³Ù„ Ù„Ùƒ Ø·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·' : ' sent you a proposal')
            ),

            /* Body */
            React.createElement('div', { style:{ position:'relative', zIndex:1, padding:'16px 20px', display:'flex', flexDirection:'column', gap:'12px' }},

                /* Sender avatar */
                React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'12px' }},
                    React.createElement('div', { style:{ width:'48px', height:'48px', borderRadius:'50%', overflow:'hidden',
                        border:'2px solid rgba(236,72,153,0.5)', flexShrink:0 }},
                        fromData?.photoURL
                            ? React.createElement('img', { src:fromData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                            : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', background:'rgba(236,72,153,0.1)' }}, 'ðŸ˜Ž')
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'white' }}, fromData?.displayName || 'â€”'),
                        React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }},
                            lang==='ar' ? 'ÙŠØ·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·Ùƒ ðŸ’•' : 'is proposing to you ðŸ’•')
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
                        lang==='ar' ? `Ù‡Ø¯ÙŠØ©: ${gift.name_ar}` : `Gift: ${gift.name_en}`)
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
                    }, loading ? 'â³' : (lang==='ar' ? 'âŒ Ø±ÙØ¶' : 'âŒ Decline')),
                    React.createElement('button', {
                        onClick: () => handle(true),
                        disabled: loading,
                        style:{ flex:1, padding:'12px', borderRadius:'12px', border:'none',
                            background:'linear-gradient(135deg,#ec4899,#a855f7)',
                            color:'white', fontSize:'13px', fontWeight:800,
                            cursor:'pointer', boxShadow:'0 4px 20px rgba(236,72,153,0.4)', transition:'.2s' }
                    }, loading ? 'â³' : (lang==='ar' ? 'ðŸ’– Ù‚Ø¨ÙˆÙ„' : 'ðŸ’– Accept'))
                )
            )
        ))
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ“¨ PROPOSAL MODAL (proposer sends from shop)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var roposalModal = ({ show, onClose, ring, currentUserData, currentUID, lang, onSend, friendsData }) => {
    const [selectedGift, setSelectedGift] = useState(null);
    const [message, setMessage]           = useState('');
    const [targetId, setTargetId]         = useState('');
    const [targetData, setTargetData]     = useState(null);
    const [searching, setSearching]       = useState(false);
    const [sending, setSending]           = useState(false);
    const [searchErr, setSearchErr]       = useState('');

    if (!show || !ring) return null;

    const currency  = currentUserData?.currency || 0;
    const giftCost  = selectedGift?.cost || 0;
    const totalCost = ring.cost + giftCost;
    const canAfford = currency >= totalCost;

    // Friends list filtered â€” not already married
    const friends = (friendsData || []).filter(f => f && !f.isMarried && (f.id || f.uid) !== currentUID);

    const selectFriend = (friend) => {
        setTargetId(friend.customId || '');
        setTargetData({ id: friend.id || friend.uid, ...friend });
        setSearchErr('');
    };

    const searchUser = async () => {
        if (!targetId.trim()) return;
        setSearching(true); setSearchErr(''); setTargetData(null);
        try {
            const snap = await usersCollection.where('customId', '==', targetId.trim()).limit(1).get();
            if (snap.empty) {
                setSearchErr(lang==='ar' ? 'Ù„Ù… ÙŠÙØ¹Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' : 'User not found');
            } else {
                const d = { id: snap.docs[0].id, ...snap.docs[0].data() };
                if (d.id === currentUID) {
                    setSearchErr(lang==='ar' ? 'Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ù„Ù†ÙØ³Ùƒ' : 'Cannot propose to yourself');
                } else if (d.isMarried) {
                    setSearchErr(lang==='ar' ? 'Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø±ØªØ¨Ø· Ø¨Ø§Ù„ÙØ¹Ù„' : 'This user is already in a relationship');
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

            /* â”€â”€ Header: ring image/emoji + name â”€â”€ */
            React.createElement('div', {
                style:{ position:'relative', zIndex:1, display:'flex', alignItems:'center',
                    justifyContent:'space-between', padding:'14px 18px',
                    borderBottom:'1px solid rgba(236,72,153,0.2)',
                    background:'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.12))' }
            },
                React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'10px' }},
                    /* Ring image or emoji */
                    React.createElement('div', { style:{ width:'42px', height:'42px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }},
                        ring.imageURL
                            ? React.createElement('img', { src:ring.imageURL, alt:'',
                                style:{ width:'42px', height:'42px', objectFit:'contain', mixBlendMode:'screen', display:'block' }})
                            : React.createElement('span', { style:{ fontSize:'30px', filter:`drop-shadow(0 0 8px ${ring.glow})` }}, ring.emoji)
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style:{ fontSize:'15px', fontWeight:900, color:'white' }},
                            lang==='ar' ? ring.name_ar : ring.name_en),
                        React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', marginTop:'1px' }},
                            lang==='ar' ? 'ðŸ’ Ø·Ù„Ø¨ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·' : 'ðŸ’ Marriage Proposal')
                    )
                ),
                React.createElement('button', {
                    onClick: onClose,
                    style:{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'8px',
                        color:'#9ca3af', fontSize:'16px', width:'30px', height:'30px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, position:'relative' }
                }, 'âœ•')
            ),

            /* â”€â”€ Scrollable body â”€â”€ */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px', position:'relative', zIndex:1 }},

                /* Ring summary card */
                React.createElement('div', {
                    style:{ padding:'12px 16px', borderRadius:'14px',
                        background:`linear-gradient(135deg, ${ring.color}18, ${ring.color}08)`,
                        border:`1px solid ${ring.color}40`,
                        display:'flex', alignItems:'center', gap:'12px' }
                },
                    React.createElement('div', { style:{ width:'44px', height:'44px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }},
                        ring.imageURL
                            ? React.createElement('img', { src:ring.imageURL, alt:'', style:{ width:'44px', height:'44px', objectFit:'contain', mixBlendMode:'screen' }})
                            : React.createElement('span', { style:{ fontSize:'28px', filter:`drop-shadow(0 0 6px ${ring.glow})` }}, ring.emoji)
                    ),
                    React.createElement('div', { style:{ flex:1 }},
                        React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color: ring.color }},
                            lang==='ar' ? ring.name_ar : ring.name_en),
                        React.createElement('div', { style:{ fontSize:'10px', color: RARITY_COLORS_C[ring.rarity], fontWeight:700 }}, ring.rarity),
                        React.createElement('div', { style:{ fontSize:'11px', color:'#9ca3af', marginTop:'2px' }},
                            lang==='ar' ? ring.desc_ar : ring.desc_en)
                    ),
                    React.createElement('div', { style:{ fontSize:'12px', fontWeight:800, color:'#fcd34d' }},
                        `${ring.cost.toLocaleString()} ðŸ§ `)
                ),

                /* â”€â”€ Friends quick-select (show if has friends) â”€â”€ */
                friends.length > 0 && React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'8px', fontWeight:700 }},
                        lang==='ar' ? 'ðŸ‘¥ Ø£ØµØ¯Ù‚Ø§Ø¤Ùƒ:' : 'ðŸ‘¥ Your Friends:'),
                    React.createElement('div', { style:{ display:'flex', gap:'8px', flexWrap:'wrap' }},
                        friends.slice(0, 8).map(friend => {
                            const fid = friend.id || friend.uid;
                            const isSelected = targetData?.id === fid;
                            return React.createElement('button', {
                                key: fid,
                                onClick: () => selectFriend(friend),
                                style:{
                                    display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                                    padding:'6px 8px', borderRadius:'10px', cursor:'pointer',
                                    border:`1px solid ${isSelected ? 'rgba(236,72,153,0.7)' : 'rgba(255,255,255,0.1)'}`,
                                    background: isSelected ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.04)',
                                    transition:'.15s', minWidth:'52px',
                                }
                            },
                                React.createElement('div', { style:{ width:'34px', height:'34px', borderRadius:'50%', overflow:'hidden', border:`1.5px solid ${isSelected ? 'rgba(236,72,153,0.7)' : 'rgba(255,255,255,0.15)'}` }},
                                    friend.photoURL
                                        ? React.createElement('img', { src:friend.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                        : React.createElement('div', { style:{ width:'100%', height:'100%', background:'rgba(168,85,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}, 'ðŸ˜Ž')
                                ),
                                React.createElement('span', { style:{ fontSize:'8px', color: isSelected ? '#f9a8d4' : '#9ca3af', fontWeight:700,
                                    maxWidth:'52px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }},
                                    friend.displayName || '?')
                            );
                        })
                    )
                ),

                /* â”€â”€ Target user search â”€â”€ */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'8px', fontWeight:700 }},
                        lang==='ar' ? 'ðŸ’Œ Ø£Ùˆ Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ù€ ID:' : 'ðŸ’Œ Or search by ID:'),
                    React.createElement('div', { style:{ display:'flex', gap:'8px' }},
                        React.createElement('input', {
                            value: targetId,
                            onChange: e => { setTargetId(e.target.value); setTargetData(null); setSearchErr(''); },
                            onKeyDown: e => e.key === 'Enter' && searchUser(),
                            placeholder: lang==='ar' ? 'Ø§Ù„Ù€ ID Ø§Ù„Ø±Ù‚Ù…ÙŠ...' : 'Numeric ID...',
                            style:{ flex:1, padding:'10px 12px', borderRadius:'10px',
                                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(236,72,153,0.3)',
                                color:'white', fontSize:'13px', outline:'none' }
                        }),
                        React.createElement('button', {
                            onClick: searchUser, disabled: searching,
                            style:{ padding:'10px 14px', borderRadius:'10px', border:'none',
                                background:'linear-gradient(135deg,#ec4899,#a855f7)',
                                color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }
                        }, searching ? 'â³' : (lang==='ar' ? 'Ø¨Ø­Ø«' : 'Find'))
                    ),
                    searchErr && React.createElement('div', { style:{ fontSize:'11px', color:'#f87171', marginTop:'6px' }}, searchErr),
                    targetData && React.createElement('div', {
                        style:{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px',
                            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', marginTop:'8px' }
                    },
                        React.createElement('div', { style:{ width:'32px', height:'32px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)' }},
                            targetData.photoURL
                                ? React.createElement('img', { src:targetData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}, 'ðŸ˜Ž')
                        ),
                        React.createElement('div', { style:{ flex:1 }},
                            React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color:'#4ade80' }}, targetData.displayName),
                            React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280' }}, `#${targetData.customId || ''}`)
                        ),
                        React.createElement('span', { style:{ fontSize:'16px' }}, 'âœ…')
                    )
                ),

                /* â”€â”€ Gift selection â”€â”€ */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'8px', fontWeight:700 }},
                        lang==='ar' ? 'ðŸŽ Ø£Ø¶Ù Ù‡Ø¯ÙŠØ© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ):' : 'ðŸŽ Add a Gift (optional):'),
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
                                    `${g.cost}ðŸ§ `)
                            )
                        )
                    )
                ),

                /* â”€â”€ Message â”€â”€ */
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', marginBottom:'6px', fontWeight:700 }},
                        lang==='ar' ? 'ðŸ’¬ Ø±Ø³Ø§Ù„Ø© Ø±ÙˆÙ…Ø§Ù†Ø³ÙŠØ©:' : 'ðŸ’¬ Romantic message:'),
                    React.createElement('textarea', {
                        value: message,
                        onChange: e => setMessage(e.target.value),
                        maxLength: 200, rows: 3,
                        placeholder: lang==='ar' ? 'Ø§ÙƒØªØ¨ Ø±Ø³Ø§Ù„ØªÙƒ Ù‡Ù†Ø§... ðŸ’•' : 'Write your message here... ðŸ’•',
                        style:{ width:'100%', padding:'10px 12px', borderRadius:'12px',
                            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(236,72,153,0.25)',
                            color:'white', fontSize:'12px', outline:'none', resize:'none', lineHeight:1.6,
                            fontFamily:'inherit', boxSizing:'border-box',
                            direction: lang==='ar' ? 'rtl' : 'ltr' }
                    }),
                    React.createElement('div', { style:{ fontSize:'9px', color:'#4b5563', textAlign:'right', marginTop:'3px' }},
                        `${message.length}/200`)
                ),

                /* â”€â”€ Total cost + balance â”€â”€ */
                React.createElement('div', {
                    style:{ padding:'12px 14px', borderRadius:'12px',
                        background: canAfford ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border:`1px solid ${canAfford ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)'}` }
                },
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#9ca3af', marginBottom:'4px' }},
                        React.createElement('span', null, lang==='ar' ? 'Ø±ØµÙŠØ¯Ùƒ:' : 'Your balance:'),
                        React.createElement('span', { style:{ color:'#fcd34d', fontWeight:700 }}, `${currency.toLocaleString()} ðŸ§ `)
                    ),
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:800 }},
                        React.createElement('span', { style:{ color:'white' }}, lang==='ar' ? 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ:' : 'Total cost:'),
                        React.createElement('span', { style:{ color: canAfford ? '#4ade80' : '#f87171' }},
                            `${totalCost.toLocaleString()} ðŸ§ `)
                    ),
                    !canAfford && React.createElement('div', { style:{ fontSize:'10px', color:'#f87171', marginTop:'4px' }},
                        lang==='ar' ? `ØªØ­ØªØ§Ø¬ ${(totalCost - currency).toLocaleString()} Ø¥Ù†ØªÙ„ Ø¥Ø¶Ø§ÙÙŠØ©` : `Need ${(totalCost - currency).toLocaleString()} more Intel`)
                ),

                /* â”€â”€ Send button â”€â”€ */
                React.createElement('button', {
                    onClick: handleSend,
                    disabled: !targetData || !canAfford || sending,
                    style:{
                        width:'100%', padding:'14px', borderRadius:'14px', border:'none',
                        background: (!targetData || !canAfford) ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#ec4899,#a855f7)',
                        color: (!targetData || !canAfford) ? '#4b5563' : 'white',
                        fontSize:'14px', fontWeight:900, cursor: (!targetData || !canAfford) ? 'not-allowed' : 'pointer',
                        boxShadow: (targetData && canAfford) ? '0 4px 24px rgba(236,72,153,0.45)' : 'none',
                        transition:'.2s', letterSpacing:'0.5px',
                    }
                }, sending ? 'â³ ...' : (lang==='ar' ? 'ðŸ’ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨' : 'ðŸ’ Send Proposal'))
            )
        ))
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ’‘ COUPLE CARD MODAL  (v3 â€” with gifts, blessing, love, clickable avatars)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var OVE_LEVELS = [
    { days:0,   label_ar:'Ø­Ø¨ Ù†Ø§Ø´Ø¦ ðŸŒ±',   label_en:'Budding Love ðŸŒ±',   color:'#86efac' },
    { days:7,   label_ar:'Ø­Ø¨ Ù…ØªÙ†Ø§Ù…ÙŠ ðŸ’›',  label_en:'Growing Love ðŸ’›',   color:'#fde68a' },
    { days:30,  label_ar:'Ø­Ø¨ Ø¹Ù…ÙŠÙ‚ ðŸ’•',   label_en:'Deep Love ðŸ’•',      color:'#f9a8d4' },
    { days:90,  label_ar:'Ø±Ø§Ø¨Ø·Ø© Ù‚ÙˆÙŠØ© ðŸ’‘', label_en:'Strong Bond ðŸ’‘',    color:'#c4b5fd' },
    { days:180, label_ar:'Ø­Ø¨ Ø­Ù‚ÙŠÙ‚ÙŠ ðŸ’–',  label_en:'True Love ðŸ’–',      color:'#f0abfc' },
    { days:365, label_ar:'Ø­Ø¨ Ø£Ø¨Ø¯ÙŠ ðŸ’Ž',   label_en:'Eternal Love ðŸ’Ž',   color:'#67e8f9' },
];

var etLoveLevel = (days) => {
    let lv = LOVE_LEVELS[0];
    for (const l of LOVE_LEVELS) { if (days >= l.days) lv = l; else break; }
    const next = LOVE_LEVELS[LOVE_LEVELS.indexOf(lv) + 1];
    const pct  = next ? Math.min(100, Math.round(((days - lv.days) / (next.days - lv.days)) * 100)) : 100;
    return { ...lv, pct, nextDays: next?.days || null };
};

var oupleCardModal = ({
    show, onClose, coupleDoc, currentUID, partnerData, selfData,
    lang, onNotification, viewOnly,
    onOpenProfile,    // (uid) => void â€” open someone's profile
    currentUserData,  // logged-in user's data (for gift sending)
}) => {
    const [liveDoc, setLiveDoc]         = useState(null);   // real-time couple doc
    const [timer, setTimer]             = useState({ days:0, hours:0, mins:0 });
    const [editingBio, setEditingBio]   = useState(false);
    const [bioText, setBioText]         = useState('');
    const [savingBio, setSavingBio]     = useState(false);
    const [uploading, setUploading]     = useState(false);
    const [uploadErr, setUploadErr]     = useState('');
    const [photoExpanded, setPhotoExpanded] = useState(false);
    const [ringTooltipId, setRingTooltipId] = useState(null); // ring click â†’ name tooltip
    const [showGiftRingPanel, setShowGiftRingPanel] = useState(false); // ring gifting panel
    const [giftingRing, setGiftingRing] = useState(false);
    const [giftRingOk, setGiftRingOk]   = useState('');
    const [giftRingErr, setGiftRingErr] = useState('');
    const photoRef                      = useRef(null);
    const timerRef                      = useRef(null);
    const [divorceStep, setDivorceStep] = useState(0);
    const [divorcing, setDivorcing]     = useState(false);
    const [sending, setSending]         = useState(false);
    const [giftErr, setGiftErr]         = useState('');
    const [giftOk, setGiftOk]           = useState('');
    const [showGiftPanel, setShowGiftPanel] = useState(false);
    const [switchingRing, setSwitchingRing] = useState(false);

    // â”€â”€ Real-time listener for coupleDoc itself â”€â”€
    useEffect(() => {
        if (!show || !coupleDoc?.id) { setLiveDoc(null); return; }
        let firstSnapshot = true;
        const unsub = couplesCollection.doc(coupleDoc.id).onSnapshot(
            snap => {
                if (snap.exists) {
                    setLiveDoc({ id: snap.id, ...snap.data() });
                } else {
                    setLiveDoc(null);
                    // Doc was deleted (divorce happened) â€” close modal after tiny delay
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
    if (!doc) return null; // doc deleted (divorce) â€” onClose() will be called by listener

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
            onNotification && onNotification(lang==='ar' ? 'âœ… ØªÙ… Ø§Ù„Ø­ÙØ¸' : 'âœ… Saved');
        } catch(e) {}
        setSavingBio(false);
    };

    /* Photo upload: compress to max 800px & ~300KB */
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !doc?.id) return;
        setUploadErr('');
        if (!file.type.startsWith('image/')) {
            setUploadErr(lang==='ar' ? 'ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ù…Ù„Ù ØµÙˆØ±Ø©' : 'File must be an image');
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
                setUploadErr(lang==='ar' ? 'Ø§Ù„ØµÙˆØ±Ø© ÙƒØ¨ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹ØŒ Ø§Ø®ØªØ± Ø£Ø®Ø±Ù‰' : 'Image too large, pick another');
                setUploading(false); return;
            }
            await couplesCollection.doc(doc.id).update({ couplePhotoUrl: base64 });
            onNotification && onNotification(lang==='ar' ? 'âœ… ØªÙ… Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©' : 'âœ… Photo uploaded');
        } catch(err) {
            setUploadErr(lang==='ar' ? 'ÙØ´Ù„ Ø§Ù„Ø±ÙØ¹ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹' : 'Upload failed, try again');
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

    /* Gift a ring from inventory to partner */
    const giftRingToPartner = async (ringId) => {
        if (giftingRing || !currentUID || !doc?.id) return;
        const ring = RINGS_DATA.find(r => r.id === ringId);
        if (!ring) return;
        const myRings = currentUserData?.inventory?.rings || [];
        if (!myRings.includes(ringId)) {
            setGiftRingErr(lang==='ar' ? 'âŒ Ù‡Ø°Ø§ Ø§Ù„Ø®Ø§ØªÙ… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù…Ø®Ø²ÙˆÙ†Ùƒ' : 'âŒ Ring not in your inventory');
            return;
        }
        setGiftingRing(true); setGiftRingErr(''); setGiftRingOk('');
        try {
            const partnerUID = uid1 === currentUID ? uid2 : uid1;
            const newEntry = {
                ringId, fromUID: currentUID, toUID: partnerUID,
                fromName: currentUserData?.displayName || '?',
                giftedAt: Date.now(),
            };
            // Remove ring from gifter inventory, add to couple sharedRings
            await usersCollection.doc(currentUID).update({
                'inventory.rings': firebase.firestore.FieldValue.arrayRemove(ringId),
            });
            await couplesCollection.doc(doc.id).update({
                sharedRings: firebase.firestore.FieldValue.arrayUnion(newEntry),
            });
            setGiftRingOk(lang==='ar' ? `âœ… Ø£Ù‡Ø¯ÙŠØª ${lang==='ar'?ring.name_ar:ring.name_en} ${ring.emoji}` : `âœ… Gifted ${ring.name_en} ${ring.emoji}`);
            setTimeout(() => { setGiftRingOk(''); setShowGiftRingPanel(false); }, 2200);
        } catch(e) {
            setGiftRingErr(lang==='ar' ? 'âŒ Ø­Ø¯Ø« Ø®Ø·Ø£' : 'âŒ Error');
        }
        setGiftingRing(false);
    };

    /* Switch the active ring displayed between the two avatars */
    const switchActiveRing = async (newRingId) => {
        if (switchingRing || !doc?.id || newRingId === doc.ringId) return;
        setSwitchingRing(true);
        try {
            await couplesCollection.doc(doc.id).update({ ringId: newRingId });
        } catch(e) {
            onNotification && onNotification(lang==='ar' ? 'âŒ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØºÙŠÙŠØ±' : 'âŒ Switch error');
        }
        setSwitchingRing(false);
    };

    /* Buy ring from shop and add to inventory */
    const buyRingFromShop = async (ring) => {
        if (!currentUID || !ring) return;
        try {
            const snap = await usersCollection.doc(currentUID).get();
            const balance = snap.exists ? (snap.data().currency || 0) : 0;
            if (balance < ring.cost) {
                onNotification(lang==='ar' ? `âŒ Ø±ØµÙŠØ¯Ùƒ ØºÙŠØ± ÙƒØ§ÙÙ (${balance}ðŸ§ )` : `âŒ Insufficient balance (${balance}ðŸ§ )`);
                return;
            }
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-ring.cost),
                'inventory.rings': firebase.firestore.FieldValue.arrayUnion(ring.id),
            });
            onNotification(`âœ… ${lang==='ar'?ring.name_ar:ring.name_en} ${ring.emoji} ${lang==='ar'?'ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ù„Ù„Ù…Ø®Ø²ÙˆÙ†':'added to inventory'}`);
        } catch(e) {
            onNotification(lang==='ar' ? 'âŒ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø´Ø±Ø§Ø¡' : 'âŒ Purchase error');
        }
    };
    const sendBlessingGift = async (gift) => {
        if (sending || !currentUID || !doc?.id) return;
        setSending(true); setGiftErr(''); setGiftOk('');
        try {
            // âœ… Validate balance from Firestore (prevents stale state bugs)
            const senderSnap = await usersCollection.doc(currentUID).get();
            const liveBal = senderSnap.exists ? (senderSnap.data().currency || 0) : 0;
            if (liveBal < gift.cost) {
                setGiftErr(lang==='ar' ? `âŒ Ø±ØµÙŠØ¯Ùƒ ØºÙŠØ± ÙƒØ§ÙÙ (${liveBal} ðŸ§ )` : `âŒ Insufficient balance (${liveBal} ðŸ§ )`);
                setSending(false);
                return;
            }
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-gift.cost)
            });
            const entry = {
                sn: currentUserData?.displayName || currentUserData?.name || '?',
                sp: currentUserData?.photoURL || null,
                su: currentUID,
                ge: gift.emoji || 'ðŸŽ',
                gn: gift.name_en || gift.name_ar || gift.id || 'Gift',
                gna: gift.name_ar || gift.name_en || 'Ù‡Ø¯ÙŠØ©',
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
            setGiftOk(lang==='ar' ? `âœ¨ Ø£Ø±Ø³Ù„Øª ${gift.emoji} Ø¨Ø±ÙƒØ©!` : `âœ¨ Sent ${gift.emoji} blessing!`);
            setTimeout(() => setGiftOk(''), 2500);
        } catch(err) {
            setGiftErr(lang==='ar' ? 'Ø­Ø¯Ø« Ø®Ø·Ø£' : 'Error occurred');
        }
        setSending(false);
    };

    /* Small circular avatar â€” clickable if onOpenProfile provided */
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
        : 'ðŸ˜Ž'
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
                background:'#0c0414',
                border:`1px solid ${ring.color}50`,
                borderRadius:'20px', overflow:'hidden', display:'flex', flexDirection:'column',
                boxShadow:`0 0 60px ${ring.glow}, 0 30px 80px rgba(0,0,0,0.95)`,
            }
        },
            React.createElement(FloatingHearts),

            /* â•â• TOP NAV BAR (like WePlay) â•â• */
            React.createElement('div', {
                style:{ position:'absolute', top:0, left:0, right:0, zIndex:30,
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px' }
            },
                React.createElement('button', { onClick: onClose,
                    style:{ width:'32px', height:'32px', borderRadius:'50%', border:'none',
                        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
                        color:'white', fontSize:'16px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center' }
                }, 'â€¹'),
                React.createElement('div', { style:{ fontSize:'14px', fontWeight:900, color:'white',
                    textShadow:'0 1px 8px rgba(0,0,0,0.9)', letterSpacing:'-0.3px' }},
                    lang==='ar' ? 'Ø¨ÙŠØªÙ†Ø§ ðŸ ' : 'My Home ðŸ '),
                React.createElement('div', { style:{ fontSize:'11px', color:'rgba(255,255,255,0.7)',
                    background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', borderRadius:'12px',
                    padding:'4px 9px', cursor:'default', fontWeight:600 }},
                    lang==='ar' ? 'Ø§Ù„Ù…Ø²ÙŠØ¯' : 'More')
            ),

            /* â•â• HERO BANNER PHOTO (full-width, WePlay style) â•â• */
            React.createElement('div', { style:{ position:'relative', width:'100%', height:'230px', flexShrink:0, background:'linear-gradient(135deg,#1a0530,#0c0414)' }},
                /* BG image */
                doc.couplePhotoUrl && React.createElement('img', {
                    src: doc.couplePhotoUrl, alt:'',
                    style:{ width:'100%', height:'100%', objectFit:'cover', display:'block' }
                }),
                /* Gradient overlay always present */
                React.createElement('div', { style:{ position:'absolute', inset:0,
                    background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 40%, rgba(12,4,20,0.85) 100%)' }
                }),
                /* Camera upload icon â€” top-right corner */
                isMember && React.createElement('div', null,
                    React.createElement('input', { type:'file', ref:photoRef, style:{ display:'none' },
                        accept:'image/jpeg,image/png,image/webp', onChange: handlePhotoUpload }),
                    React.createElement('button', {
                        onClick: () => photoRef.current?.click(),
                        disabled: uploading,
                        style:{ position:'absolute', top:'50px', right:'12px', zIndex:20,
                            width:'36px', height:'36px', borderRadius:'50%', border:'none',
                            background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
                            color:'white', fontSize:'16px', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 2px 10px rgba(0,0,0,0.5)' }
                    }, uploading ? 'â³' : 'ðŸ“·')
                ),
                uploadErr && React.createElement('div', { style:{ position:'absolute', bottom:'72px', left:'50%', transform:'translateX(-50%)',
                    fontSize:'10px', color:'#f87171', background:'rgba(0,0,0,0.7)', borderRadius:'6px', padding:'3px 8px', zIndex:20 }
                }, uploadErr),

                /* Bottom overlay: avatars + ring + love/blessing */
                React.createElement('div', { style:{ position:'absolute', bottom:0, left:0, right:0,
                    padding:'10px 16px 12px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', zIndex:10 }
                },
                    /* â”€â”€ Left: avatars close together with ring in middle â”€â”€ */
                    React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }},
                        React.createElement('div', { style:{ display:'flex', alignItems:'flex-end' }},
                            /* Left avatar */
                            React.createElement('div', { onClick: () => uid1 && onOpenProfile && onOpenProfile(uid1),
                                style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', cursor:'pointer', zIndex:2 }
                            },
                                React.createElement('div', { style:{ width:'54px', height:'54px', borderRadius:'50%',
                                    border:`2.5px solid ${ring.color}`, overflow:'hidden', background:'rgba(0,0,0,0.5)',
                                    boxShadow:`0 0 12px ${ring.glow}` }},
                                    selfData?.photoURL
                                        ? React.createElement('img', { src:selfData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                        : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}, 'ðŸ˜Ž')
                                ),
                                React.createElement('div', { style:{ fontSize:'9px', fontWeight:700, color:'rgba(255,255,255,0.9)',
                                    maxWidth:'58px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                    textShadow:'0 1px 4px rgba(0,0,0,0.9)' }}, selfData?.displayName || 'â€”')
                            ),
                            /* Ring icon â€” centered between avatars, slightly overlapping */
                            React.createElement('div', { style:{ zIndex:3, marginLeft:'-6px', marginRight:'-6px', marginBottom:'18px', cursor:'pointer', textAlign:'center' },
                                onClick: () => setRingTooltipId(v => v ? null : ring.id)
                            },
                                ring.imageURL
                                    ? React.createElement(RingImageCanvas, { src:ring.imageURL, size:40, glow:ring.glow })
                                    : React.createElement('div', { style:{ fontSize:'26px', lineHeight:1,
                                        filter:`drop-shadow(0 0 10px ${ring.glow}) drop-shadow(0 0 20px ${ring.glow})` }}, ring.emoji),
                                /* Ring name tooltip */
                                ringTooltipId && React.createElement('div', { style:{
                                    position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
                                    background:'rgba(15,5,25,0.96)', border:`1px solid ${ring.color}60`,
                                    borderRadius:'10px', padding:'8px 12px', zIndex:50, whiteSpace:'nowrap',
                                    boxShadow:`0 4px 20px rgba(0,0,0,0.8)`, pointerEvents:'none', marginBottom:'6px'
                                }},
                                    React.createElement('div', { style:{ fontSize:'16px', textAlign:'center', marginBottom:'2px',
                                        filter:`drop-shadow(0 0 6px ${ring.glow})` }}, ring.imageURL ? React.createElement('img', { src:ring.imageURL, alt:'', style:{ width:'22px', height:'22px', objectFit:'contain', mixBlendMode:'screen', background:'transparent', display:'block' }}) : ring.emoji),
                                    React.createElement('div', { style:{ fontSize:'11px', fontWeight:800, color:ring.color, textAlign:'center' }},
                                        lang==='ar' ? ring.name_ar : ring.name_en),
                                    React.createElement('div', { style:{ fontSize:'9px', color: RARITY_COLORS_C[ring.rarity], textAlign:'center', marginTop:'1px' }}, ring.rarity)
                                )
                            ),
                            /* Right avatar */
                            React.createElement('div', { onClick: () => uid2 && onOpenProfile && onOpenProfile(uid2),
                                style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', cursor:'pointer', zIndex:2 }
                            },
                                React.createElement('div', { style:{ width:'54px', height:'54px', borderRadius:'50%',
                                    border:`2.5px solid ${ring.color}`, overflow:'hidden', background:'rgba(0,0,0,0.5)',
                                    boxShadow:`0 0 12px ${ring.glow}` }},
                                    partnerData?.photoURL
                                        ? React.createElement('img', { src:partnerData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                        : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}, 'ðŸ’‘')
                                ),
                                React.createElement('div', { style:{ fontSize:'9px', fontWeight:700, color:'rgba(255,255,255,0.9)',
                                    maxWidth:'58px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                    textShadow:'0 1px 4px rgba(0,0,0,0.9)' }}, partnerData?.displayName || 'â€”')
                            )
                        ),
                        /* Marriage duration text below avatars */
                        doc.marriageDate && React.createElement('div', { style:{ fontSize:'10px', color:'rgba(255,255,255,0.72)',
                            textShadow:'0 1px 6px rgba(0,0,0,0.9)', fontWeight:600, textAlign:'center' }},
                            lang==='ar'
                                ? `Ù†Ø­Ù† Ù…Ø¹Ø§Ù‹ Ù…Ù†Ø° ${timer.days} ÙŠÙˆÙ… ðŸ’•`
                                : `We have been married for ${timer.days} days`)
                    ),

                    /* â”€â”€ Right: Love + Blessing pills â”€â”€ */
                    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'6px', paddingBottom:'22px' }},
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px',
                            background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
                            borderRadius:'20px', padding:'5px 10px', border:'1px solid rgba(236,72,153,0.3)' }
                        },
                            React.createElement('div', { style:{ width:'26px', height:'26px', borderRadius:'50%',
                                background:'rgba(236,72,153,0.3)', display:'flex', alignItems:'center',
                                justifyContent:'center', fontSize:'13px' }}, 'â¤ï¸'),
                            React.createElement('div', { style:{ textAlign:'left' }},
                                React.createElement('div', { style:{ fontSize:'13px', fontWeight:900, color:'white', lineHeight:1 }},
                                    (doc.blessingPoints || 0).toLocaleString()),
                                React.createElement('div', { style:{ fontSize:'8px', color:'rgba(255,255,255,0.5)' }},
                                    lang==='ar'?'Ø­Ø¨':'Love')
                            )
                        ),
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px',
                            background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
                            borderRadius:'20px', padding:'5px 10px', border:'1px solid rgba(168,85,247,0.3)' }
                        },
                            React.createElement('div', { style:{ width:'26px', height:'26px', borderRadius:'50%',
                                background:'rgba(168,85,247,0.25)', display:'flex', alignItems:'center',
                                justifyContent:'center', fontSize:'13px' }}, 'ðŸŽ'),
                            React.createElement('div', { style:{ textAlign:'left' }},
                                React.createElement('div', { style:{ fontSize:'13px', fontWeight:900, color:'white', lineHeight:1 }},
                                    (doc.blessingPoints || 0)),
                                React.createElement('div', { style:{ fontSize:'8px', color:'rgba(255,255,255,0.5)' }},
                                    lang==='ar'?'Ø¨Ø±ÙƒØ©':'Blessing')
                            )
                        )
                    )
                ),
            ),

            /* â•â• SCROLLABLE BODY â•â• */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column',
                background:'linear-gradient(180deg,#0c0414,#100820)', position:'relative', zIndex:1 }},

                /* â”€â”€ Shared Bio (compact, top of scroll) â”€â”€ */
                React.createElement('div', { style:{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }},
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'8px' }},
                        React.createElement('div', { style:{
                            fontSize:'11px', color:'#f9a8d4', fontWeight:700, flex:1,
                            wordBreak:'break-word', whiteSpace:'pre-wrap',
                            maxWidth:'100%', lineHeight:1.6,
                        }},
                            doc.sharedBio || (lang==='ar' ? 'ðŸ’• Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¨ÙŠÙˆ Ù…Ø´ØªØ±Ùƒ Ø¨Ø¹Ø¯' : 'ðŸ’• No shared bio yet')
                        ),
                        isMember && React.createElement('button', {
                            onClick: () => editingBio ? saveBio() : setEditingBio(true),
                            disabled: savingBio,
                            style:{ background:'rgba(236,72,153,0.15)', border:'1px solid rgba(236,72,153,0.3)',
                                borderRadius:'6px', color:'#f9a8d4', fontSize:'10px', fontWeight:700,
                                padding:'3px 10px', cursor:'pointer', flexShrink:0 }
                        }, savingBio ? 'â³' : (editingBio ? (lang==='ar'?'ðŸ’¾':'ðŸ’¾') : (lang==='ar'?'âœï¸':'âœï¸')))
                    ),
                    editingBio && isMember && React.createElement('div', { style:{ marginTop:'8px' }},
                        React.createElement('textarea', {
                            value: bioText,
                            onChange: e => {
                                // Allow wrapping every 20 chars
                                const raw = e.target.value;
                                // Only enforce max 120 total chars
                                if (raw.length <= 120) setBioText(raw);
                            },
                            maxLength: 120, rows: 3,
                            style:{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(236,72,153,0.3)',
                                borderRadius:'8px', padding:'8px', color:'white', fontSize:'12px',
                                outline:'none', resize:'none', lineHeight:1.8, fontFamily:'inherit',
                                boxSizing:'border-box', direction: lang==='ar' ? 'rtl' : 'ltr',
                                wordBreak:'break-word', whiteSpace:'pre-wrap' }
                        }),
                        React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'4px' }},
                            React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280' }},
                                lang==='ar' ? 'ðŸ’¡ ÙŠÙ†ÙƒØ³Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ ÙƒÙ„ 20 Ø­Ø±Ù' : 'ðŸ’¡ Wraps every 20 chars'),
                            React.createElement('div', { style:{ fontSize:'9px', color: bioText.length >= 110 ? '#f87171' : '#6b7280' }},
                                `${bioText.length}/120`)
                        )
                    )
                ),

                /* â”€â”€ Love Level bar â”€â”€ */
                React.createElement('div', { style:{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'12px',
                    borderBottom:'1px solid rgba(255,255,255,0.05)' }
                },
                    React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4', fontWeight:700, flexShrink:0 }},
                        lang==='ar' ? loveInfo.label_ar : loveInfo.label_en),
                    React.createElement('div', { style:{ flex:1, height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }},
                        React.createElement('div', { style:{ height:'100%', width:`${loveInfo.pct}%`,
                            background:`linear-gradient(90deg,#ec4899,${loveInfo.color})`, borderRadius:'3px', transition:'1s' }})
                    ),
                    loveInfo.nextDays && React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280', flexShrink:0 }},
                        lang==='ar' ? `${loveInfo.nextDays - timer.days}ÙŠ` : `${loveInfo.nextDays - timer.days}d`)
                ),

                /* â”€â”€ RINGS POSTED section â”€â”€ */
                React.createElement('div', { style:{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }},
                    (() => {
                        // Merge sharedRings + inventory rings + proposal ring into unique display set
                        const shared = doc.sharedRings || [];
                        const myInventoryRings = currentUserData?.inventory?.rings || [];
                        const seen = {};
                        // Start with proposal ring
                        if (doc.ringId) seen[doc.ringId] = { ringId: doc.ringId };
                        // Add gifted rings
                        [...shared].reverse().forEach(s => { if (!seen[s.ringId]) seen[s.ringId] = s; });
                        // Add inventory rings (so purchased rings show immediately)
                        myInventoryRings.forEach(rid => { if (!seen[rid]) seen[rid] = { ringId: rid }; });
                        const unique = Object.values(seen);
                        unique.sort((a,b) => (b.ringId === doc.ringId ? 1 : 0) - (a.ringId === doc.ringId ? 1 : 0));
                        const totalCount = unique.filter(s => RINGS_DATA.find(r => r.id === s.ringId)).length;
                        return React.createElement(React.Fragment, null,
                            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }},
                                React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px' }},
                                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:'white' }},
                                        lang==='ar' ? 'Ø§Ù„Ø®ÙˆØ§ØªÙ… Ø§Ù„Ù…ÙÙ‡Ø¯Ø§Ø©' : 'Rings Posted'),
                                    React.createElement('div', { style:{ fontSize:'9px', color:'#a78bfa',
                                        background:'rgba(168,85,247,0.15)', borderRadius:'6px', padding:'1px 6px', fontWeight:700 }},
                                        totalCount)
                                ),
                                isMember && React.createElement('button', { onClick: () => setShowGiftRingPanel(v => !v),
                                    style:{ fontSize:'10px', color:ring.color, background:`${ring.color}15`,
                                        border:`1px solid ${ring.color}40`, borderRadius:'8px', padding:'4px 10px',
                                        cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:'4px' }
                                }, ring.imageURL
                                    ? React.createElement('img', { src:ring.imageURL, alt:'', style:{ width:'14px', height:'14px', objectFit:'contain', mixBlendMode:'screen' }})
                                    : ring.emoji,
                                ' ', lang==='ar' ? 'Ø£Ù‡Ø¯Ù Ø®Ø§ØªÙ…' : 'Gift Ring')
                            ),

                            /* Gift ring panel */
                            showGiftRingPanel && isMember && React.createElement('div', { style:{ marginBottom:'12px', padding:'12px',
                                background:'rgba(255,255,255,0.04)', borderRadius:'12px', border:`1px solid ${ring.color}30` }
                            },
                                React.createElement('div', { style:{ fontSize:'10px', color:'#9ca3af', marginBottom:'8px' }},
                                    lang==='ar' ? 'ðŸ’ Ø®ÙˆØ§ØªÙ…Ùƒ ÙÙŠ Ø§Ù„Ù…Ø®Ø²ÙˆÙ† â€” Ø§Ø¶ØºØ· Ù„Ø¥Ù‡Ø¯Ø§Ø¡ Ø´Ø±ÙŠÙƒÙƒ:' : 'ðŸ’ Rings in your inventory â€” tap to gift partner:'),
                                (() => {
                                    const uniqueMyRings = [...new Set(myInventoryRings)];
                                    if (uniqueMyRings.length === 0) return React.createElement('div', {
                                        style:{ fontSize:'10px', color:'#4b5563', textAlign:'center', padding:'8px 0' }
                                    }, lang==='ar' ? 'ðŸ›’ Ù„Ø§ Ø®ÙˆØ§ØªÙ… ÙÙŠ Ù…Ø®Ø²ÙˆÙ†Ùƒ â€” Ø§Ø´ØªØ± Ù…Ù† Ù…ØªØ¬Ø± Ø§Ù„Ø²ÙˆØ¬ÙŠÙ†' : 'ðŸ›’ No rings in inventory â€” buy from couples shop');
                                    return React.createElement('div', { style:{ display:'flex', gap:'8px', flexWrap:'wrap' }},
                                        uniqueMyRings.map(rid => {
                                            const rd = RINGS_DATA.find(r => r.id === rid);
                                            if (!rd) return null;
                                            return React.createElement('button', { key:rid, onClick: () => giftRingToPartner(rid),
                                                disabled: giftingRing,
                                                style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                                                    padding:'8px 12px', borderRadius:'10px', border:`1px solid ${rd.color}50`,
                                                    background: rd.imageURL ? 'transparent' : `${rd.color}12`, cursor:'pointer', transition:'.15s' }
                                            },
                                                rd.imageURL
                                                    ? React.createElement('img', { src:rd.imageURL, alt:'', style:{ width:'36px', height:'36px', objectFit:'contain', mixBlendMode:'screen', display:'block' }})
                                                    : React.createElement('span', { style:{ fontSize:'22px', filter:`drop-shadow(0 0 5px ${rd.glow})` }}, rd.emoji),
                                                React.createElement('span', { style:{ fontSize:'8px', color:rd.color, fontWeight:700 }}, lang==='ar'?rd.name_ar:rd.name_en)
                                            );
                                        })
                                    );
                                })(),
                                giftRingOk && React.createElement('div', { style:{ fontSize:'11px', color:'#4ade80', marginTop:'6px', fontWeight:700, textAlign:'center' }}, giftRingOk),
                                giftRingErr && React.createElement('div', { style:{ fontSize:'11px', color:'#f87171', marginTop:'6px', fontWeight:700, textAlign:'center' }}, giftRingErr)
                            ),

                            /* Shared rings display */
                            React.createElement('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'flex-end' }},
                                unique.map((s, i) => {
                                    const rd = RINGS_DATA.find(r => r.id === s.ringId);
                                    if (!rd) return null;
                                    const isActive = doc.ringId === s.ringId;
                                    const canSwitch = isMember && !isActive && !switchingRing;
                                    return React.createElement('div', {
                                        key: i,
                                        onClick: canSwitch ? () => switchActiveRing(rd.id) : undefined,
                                        title: canSwitch
                                            ? (lang==='ar' ? `Ø§Ø¶ØºØ· Ù„ØªÙØ¹ÙŠÙ„ ${rd.name_ar}` : `Tap to activate ${rd.name_en}`)
                                            : (lang==='ar' ? rd.name_ar : rd.name_en),
                                        style:{
                                            display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
                                            cursor: canSwitch ? 'pointer' : 'default',
                                            transition:'opacity .2s',
                                            opacity: switchingRing && !isActive ? 0.45 : 1,
                                        }
                                    },
                                        React.createElement('div', { style:{
                                            width: isActive ? '62px' : '56px', height: isActive ? '62px' : '56px', borderRadius:'14px',
                                            background: rd.imageURL ? 'transparent' : (isActive ? `${rd.color}22` : 'rgba(255,255,255,0.04)'),
                                            border:`2px solid ${isActive ? rd.color : 'rgba(255,255,255,0.1)'}`,
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            boxShadow: isActive ? `0 0 20px ${rd.glow}, 0 0 8px ${rd.glow}` : 'none',
                                            position:'relative', transition:'all .2s',
                                            filter: rd.imageURL ? `drop-shadow(0 0 8px ${rd.glow})` : undefined,
                                        }},
                                            rd.imageURL
                                                ? React.createElement('img', { src:rd.imageURL, alt:'', style:{
                                                    width:'100%', height:'100%', objectFit:'contain',
                                                    mixBlendMode:'screen', display:'block',
                                                  }})
                                                : React.createElement('span', { style:{ fontSize:'26px', filter:`drop-shadow(0 0 7px ${rd.glow})` }}, rd.emoji),
                                            isActive && React.createElement('div', { style:{
                                                position:'absolute', top:'-9px', left:'50%', transform:'translateX(-50%)',
                                                fontSize:'11px', lineHeight:1,
                                            }}, 'âœ¨'),
                                            canSwitch && React.createElement('div', { style:{
                                                position:'absolute', bottom:'-1px', right:'-1px',
                                                width:'16px', height:'16px', borderRadius:'50%',
                                                background:'rgba(0,242,255,0.9)', display:'flex',
                                                alignItems:'center', justifyContent:'center',
                                                fontSize:'9px', fontWeight:900, color:'#000',
                                                boxShadow:'0 1px 5px rgba(0,0,0,0.6)',
                                            }}, 'â†º')
                                        ),
                                        React.createElement('div', { style:{
                                            fontSize:'8px', fontWeight:700, textAlign:'center',
                                            color: isActive ? rd.color : '#6b7280',
                                            maxWidth:'60px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                        }}, lang==='ar' ? rd.name_ar : rd.name_en),
                                        isActive && React.createElement('div', { style:{
                                            fontSize:'7px', color:'#4ade80', fontWeight:800,
                                        }}, lang==='ar' ? 'â— Ù†Ø´Ø·' : 'â— Active')
                                    );
                                })
                            )
                        );
                    })()
                ),

                /* â”€â”€ GIFT LOG (Recent gifts list, WePlay style) â”€â”€ */
                doc.giftLog && doc.giftLog.length > 0 && React.createElement('div', { style:{ padding:'0 16px 14px' }},
                    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'0' }},
                        [...doc.giftLog].reverse().slice(0, 8).map((entry, i) =>
                            React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:'10px',
                                padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }
                            },
                                React.createElement('div', { style:{ width:'40px', height:'40px', borderRadius:'50%',
                                    overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)' }},
                                    entry.sp
                                        ? React.createElement('img', { src:entry.sp, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                                        : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}, 'ðŸ˜Ž')
                                ),
                                React.createElement('div', { style:{ flex:1, minWidth:0 }},
                                    React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color:'#e2e8f0' }},
                                        entry.sn && entry.sn !== '?' ? entry.sn : (entry.su ? entry.su.substring(0,8) : '?')),
                                    React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280' }},
                                        new Date(entry.ts || 0).toLocaleString(lang==='ar'?'ar-EG':'en-US', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }))
                                ),
                                React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, gap:'2px' }},
                                    React.createElement('span', { style:{ fontSize:'26px', lineHeight:1 }}, entry.ge || 'ðŸŽ'),
                                    React.createElement('span', { style:{ fontSize:'8px', color:'#c4b5fd', fontWeight:700 }},
                                        lang==='ar' ? (entry.gna || entry.gn || '') : (entry.gn || entry.gna || ''))
                                )
                            )
                        )
                    )
                ),

                /* â”€â”€ GIFT PANEL (slides up when Send Gift tapped) â”€â”€ */
                showGiftPanel && isMember && React.createElement('div', { style:{
                    padding:'16px', borderTop:'1px solid rgba(168,85,247,0.2)',
                    background:'linear-gradient(180deg,rgba(20,5,40,0.98),rgba(12,4,20,0.99))'
                }},
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }},
                        React.createElement('div', null,
                            React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:'white' }},
                                lang==='ar' ? 'Ø£Ø±Ø³Ù„ Ù‡Ø¯ÙŠØ© ðŸŽ' : 'Send a Gift ðŸŽ'),
                            React.createElement('div', { style:{ fontSize:'9px', color:'#9ca3af', marginTop:'1px' }},
                                lang==='ar' ? 'Ø§Ù„Ù‡Ø¯Ø§ÙŠØ§ ØªØ¶Ø§Ù ÙƒÙ†Ù‚Ø§Ø· Ø¨Ø±ÙƒØ©' : 'Gifts add as blessing points')
                        ),
                        React.createElement('button', { onClick: () => setShowGiftPanel(false),
                            style:{ width:'28px', height:'28px', borderRadius:'50%', border:'none',
                                background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'18px',
                                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }
                        }, 'Ã—')
                    ),
                    React.createElement('div', { style:{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }},
                        COUPLE_GIFTS.map(gift =>
                            React.createElement('button', { key:gift.id, onClick:()=>{ sendBlessingGift(gift); setShowGiftPanel(false); }, disabled:sending,
                                style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
                                    padding:'10px 12px', borderRadius:'14px',
                                    border:'1px solid rgba(168,85,247,0.3)',
                                    background: sending ? 'rgba(168,85,247,0.05)' : 'rgba(168,85,247,0.12)',
                                    cursor: sending ? 'not-allowed' : 'pointer',
                                    opacity: sending ? 0.5 : 1, transition:'.15s', minWidth:'60px' }
                            },
                                gift.imageUrl
                                    ? React.createElement('img', { src:gift.imageUrl, alt:'', style:{ width:'32px', height:'32px', objectFit:'contain' }})
                                    : React.createElement('span', { style:{ fontSize:'26px', lineHeight:1 }}, gift.emoji),
                                React.createElement('span', { style:{ fontSize:'8px', color:'#e2e8f0', fontWeight:700, textAlign:'center',
                                    maxWidth:'58px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }},
                                    lang==='ar' ? gift.name_ar : gift.name_en),
                                React.createElement('span', { style:{ fontSize:'8px', color:'#fcd34d', fontWeight:800 }}, `${gift.cost}ðŸ§ `)
                            )
                        )
                    ),
                    giftOk && React.createElement('div', { style:{ fontSize:'11px', color:'#4ade80', marginTop:'10px', fontWeight:700, textAlign:'center' }}, giftOk),
                    giftErr && React.createElement('div', { style:{ fontSize:'11px', color:'#f87171', marginTop:'10px', fontWeight:700, textAlign:'center' }}, giftErr)
                )

            ) // end scrollable body

            /* â”€â”€ FIXED BOTTOM: Send Gift button â”€â”€ */,
            isMember && React.createElement('div', { style:{
                flexShrink:0, padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.07)',
                background:'rgba(12,4,20,0.98)', backdropFilter:'blur(12px)'
            }},
                React.createElement('button', { onClick: () => setShowGiftPanel(v => !v),
                    style:{
                        width:'100%', padding:'13px', borderRadius:'14px',
                        background: showGiftPanel
                            ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                            : 'linear-gradient(135deg,rgba(168,85,247,0.22),rgba(139,92,246,0.22))',
                        color:'white', fontSize:'14px', fontWeight:800, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                        border: showGiftPanel ? 'none' : '1px solid rgba(168,85,247,0.45)',
                        boxShadow: showGiftPanel ? '0 4px 20px rgba(168,85,247,0.5)' : 'none',
                        transition:'.2s'
                    }
                },
                    React.createElement('span', { style:{ fontSize:'18px' }}, 'ðŸŽ'),
                    lang==='ar' ? 'Ø£Ø±Ø³Ù„ Ù‡Ø¯ÙŠØ©' : 'Send gift'
                )
            )

        )) // end modal inner + overlay
    ); // end PortalModal
};

// â•â• RINGS SHOP SECTION (injected into ShopModal)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RingsShopSection â€” allows buying multiple rings, adds to inventory, supports event/hidden rings
var ingsShopSection = ({ userData, lang, currentUID, onPropose, onNotification }) => {
    const currency    = userData?.currency || 0;
    const charismaLvl = getCharismaLevel(userData?.charisma || 0).currentLevel.level;
    const myRings     = userData?.inventory?.rings || []; // array may have duplicates (multi-buy)
    const [buying, setBuying] = useState(null); // ringId being bought
    const [buyMsg, setBuyMsg] = useState('');

    const handleBuy = async (ring) => {
        if (buying) return;
        setBuying(ring.id); setBuyMsg('');
        try {
            const snap = await usersCollection.doc(currentUID).get();
            const bal = snap.exists ? (snap.data().currency || 0) : 0;
            if (bal < ring.cost) {
                setBuyMsg(lang==='ar' ? `âŒ Ø±ØµÙŠØ¯ ØºÙŠØ± ÙƒØ§ÙÙ (${bal.toLocaleString()}ðŸ§ )` : `âŒ Insufficient balance (${bal.toLocaleString()}ðŸ§ )`);
                setBuying(null); return;
            }
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-ring.cost),
                'inventory.rings': firebase.firestore.FieldValue.arrayUnion(ring.id),
            });
            setBuyMsg(lang==='ar' ? `âœ… ${ring.name_ar} ${ring.emoji} Ø£ÙØ¶ÙŠÙ Ù„Ù…Ø®Ø²ÙˆÙ†Ùƒ!` : `âœ… ${ring.name_en} ${ring.emoji} added to inventory!`);
            setTimeout(() => setBuyMsg(''), 3000);
        } catch(e) { setBuyMsg(lang==='ar' ? 'âŒ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø´Ø±Ø§Ø¡' : 'âŒ Purchase error'); }
        setBuying(null);
    };

    // Filter: show only non-hidden rings (or rings already in inventory even if hidden)
    const visibleRings = RINGS_DATA.filter(r => !r.hidden || myRings.includes(r.id));

    return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'12px', padding:'4px 0' }},
        /* Inventory count badge */
        myRings.length > 0 && React.createElement('div', {
            style:{ padding:'8px 12px', borderRadius:'10px', background:'rgba(168,85,247,0.1)',
                border:'1px solid rgba(168,85,247,0.25)', fontSize:'11px', color:'#c4b5fd',
                display:'flex', alignItems:'center', gap:'6px' }
        },
            React.createElement('span', null, 'ðŸ’'),
            lang==='ar'
                ? `Ù…Ø®Ø²ÙˆÙ†Ùƒ: ${[...new Set(myRings)].map(id => { const r = RINGS_DATA.find(r2=>r2.id===id); return r ? (lang==='ar'?r.name_ar:r.name_en) : id; }).join(' Â· ')}`
                : `Inventory: ${[...new Set(myRings)].map(id => { const r = RINGS_DATA.find(r2=>r2.id===id); return r ? r.name_en : id; }).join(' Â· ')}`
        ),

        /* Rings list */
        visibleRings.map(ring => {
            const meetsLevel  = charismaLvl >= ring.levelReq;
            const canAfford   = currency >= ring.cost;
            const isMine      = myRings.includes(ring.id);
            const isBuying    = buying === ring.id;
            const disabled    = !meetsLevel;
            // limited time countdown
            const limitExpired = ring.limitedUntil && new Date(ring.limitedUntil) < new Date();

            return React.createElement('div', {
                key: ring.id,
                style:{
                    padding:'14px 16px', borderRadius:'14px',
                    background:`linear-gradient(135deg, ${ring.color}12, ${ring.color}06)`,
                    border:`1px solid ${disabled||limitExpired ? 'rgba(255,255,255,0.07)' : ring.color+'40'}`,
                    display:'flex', alignItems:'center', gap:'12px',
                    opacity: disabled || limitExpired ? 0.55 : 1, transition:'.2s',
                }
            },
                /* Ring image or emoji */
                React.createElement('div', { style:{ flexShrink:0, width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent' }},
                    ring.imageURL
                        ? React.createElement('img', { src:ring.imageURL, alt:'',
                            style:{ width:'44px', height:'44px', objectFit:'contain', mixBlendMode:'screen', display:'block' }})
                        : React.createElement('span', { style:{ fontSize:'28px', filter:`drop-shadow(0 0 6px ${ring.glow})` }}, ring.emoji)
                ),
                React.createElement('div', { style:{ flex:1, minWidth:0 }},
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }},
                        React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color: disabled ? '#6b7280' : ring.color }},
                            lang==='ar' ? ring.name_ar : ring.name_en),
                        ring.event && React.createElement('span', { style:{ fontSize:'8px', fontWeight:800, color:'#f43f5e',
                            background:'rgba(244,63,94,0.15)', border:'1px solid rgba(244,63,94,0.4)',
                            borderRadius:'4px', padding:'1px 5px' }}, lang==='ar'?'Ø­Ø¯Ø«':'EVENT'),
                        ring.limited && ring.limitedUntil && !limitExpired && React.createElement('span', { style:{ fontSize:'8px', fontWeight:700, color:'#f97316',
                            background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.35)',
                            borderRadius:'4px', padding:'1px 5px' }},
                            lang==='ar'?`â³ Ø­ØªÙ‰ ${ring.limitedUntil}`: `â³ Until ${ring.limitedUntil}`),
                        limitExpired && React.createElement('span', { style:{ fontSize:'8px', color:'#6b7280', fontWeight:700 }}, lang==='ar'?'Ø§Ù†ØªÙ‡Ù‰':'Expired')
                    ),
                    React.createElement('div', { style:{ fontSize:'10px', color: RARITY_COLORS_C[ring.rarity], fontWeight:700, marginTop:'1px' }}, ring.rarity),
                    React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }},
                        lang==='ar' ? ring.desc_ar : ring.desc_en),
                    !meetsLevel && React.createElement('div', { style:{ fontSize:'10px', color:'#f97316', marginTop:'3px', fontWeight:700 }},
                        lang==='ar' ? `ÙŠØªØ·Ù„Ø¨ Ù…Ø³ØªÙˆÙ‰ ÙƒØ§Ø±ÙŠØ²Ù…Ø§ ${ring.levelReq}` : `Requires Charisma Lv${ring.levelReq}`)
                ),
                React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0 }},
                    React.createElement('div', { style:{ fontSize:'12px', fontWeight:800, color: canAfford ? '#fcd34d' : '#ef4444' }},
                        `${ring.cost.toLocaleString()} ðŸ§ `),
                    /* Buy button â€” can buy multiple */
                    !disabled && !limitExpired && React.createElement('button', {
                        onClick: () => handleBuy(ring),
                        disabled: isBuying || !canAfford,
                        style:{
                            padding:'7px 12px', borderRadius:'10px', border:'none', fontSize:'11px', fontWeight:800,
                            cursor: isBuying||!canAfford ? 'not-allowed' : 'pointer', transition:'.2s',
                            background: !canAfford ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,#ec4899,#a855f7)`,
                            color: !canAfford ? '#4b5563' : 'white',
                            boxShadow: canAfford ? '0 3px 14px rgba(236,72,153,0.4)' : 'none',
                        }
                    }, isBuying ? 'â³' : (isMine ? (lang==='ar'?'ðŸ’ Ø§Ø´ØªØ± Ù…Ø±Ø© Ø£Ø®Ø±Ù‰':'ðŸ’ Buy Again') : (lang==='ar'?'ðŸ’ Ø´Ø±Ø§Ø¡':'ðŸ’ Buy'))),
                    /* Use for proposal */
                    isMine && onPropose && React.createElement('button', {
                        onClick: () => onPropose(ring),
                        style:{ padding:'4px 10px', borderRadius:'8px', border:`1px solid ${ring.color}50`,
                            background:`${ring.color}15`, color:ring.color, fontSize:'9px', fontWeight:700, cursor:'pointer' }
                    }, lang==='ar'?'ðŸ“¤ Ø§Ø³ØªØ®Ø¯Ù…':'ðŸ“¤ Use')
                )
            );
        }),
        buyMsg && React.createElement('div', { style:{ padding:'8px 12px', borderRadius:'10px',
            background: buyMsg.startsWith('âœ…') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
            border:`1px solid ${buyMsg.startsWith('âœ…') ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
            fontSize:'12px', fontWeight:700, color: buyMsg.startsWith('âœ…') ? '#4ade80' : '#f87171',
            textAlign:'center' }
        }, buyMsg)
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ“© PROPOSAL ITEM â€” standalone so useState works correctly (no hooks-in-map)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var roposalItem = ({ proposal, fromData, lang, onNotification }) => {
    const [handling, setHandling] = useState(false);
    const ring = RINGS_DATA.find(r => r.id === proposal.ringId) || RINGS_DATA[0];
    const gift = PROPOSAL_GIFTS.find(g => g.id === proposal.giftId);

    const handle = async (accept) => {
        setHandling(true);
        if (accept) {
            await acceptProposal({ coupleDocId: proposal.id, uid1: proposal.uid1, uid2: proposal.uid2, onNotification, lang });
        } else {
            await declineProposal({ coupleDocId: proposal.id, fromUID: proposal.uid1, toUID: proposal.uid2, ringCost: ring.cost, giftCost: gift?.cost || 0, onNotification, lang });
        }
        setHandling(false);
    };

    return React.createElement('div', {
        style:{ background:'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(168,85,247,0.08))', border:'1px solid rgba(236,72,153,0.3)', borderRadius:'16px', padding:'14px 16px', position:'relative', overflow:'hidden' }
    },
        /* Ring glow bg */
        React.createElement('div', { style:{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background: ring.glow, filter:'blur(30px)', pointerEvents:'none' }}),
        /* Sender */
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px', position:'relative' }},
            React.createElement('div', { style:{ width:'44px', height:'44px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(236,72,153,0.5)', flexShrink:0 }},
                fromData?.photoURL
                    ? React.createElement('img', { src:fromData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }})
                    : React.createElement('div', { style:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', background:'rgba(236,72,153,0.1)' }}, 'ðŸ˜Ž')
            ),
            React.createElement('div', { style:{ flex:1 }},
                React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'white' }}, fromData?.displayName || 'â€”'),
                React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }},
                    lang==='ar' ? 'ðŸ’ ÙŠØ·Ù„Ø¨ Ø§Ø±ØªØ¨Ø§Ø·Ùƒ' : 'ðŸ’ proposing to you')
            ),
            /* Ring */
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px', background:`${ring.color}15`, border:`1px solid ${ring.color}40`, borderRadius:'10px', padding:'5px 10px' }},
                ring.imageURL
                    ? React.createElement('img', { src:ring.imageURL, alt:'', style:{ width:'22px', height:'22px', objectFit:'contain', mixBlendMode:'screen' }})
                    : React.createElement('span', { style:{ fontSize:'20px', filter:`drop-shadow(0 0 6px ${ring.glow})` }}, ring.emoji),
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'10px', fontWeight:700, color:ring.color }}, lang==='ar' ? ring.name_ar : ring.name_en),
                    React.createElement('div', { style:{ fontSize:'9px', color: RARITY_COLORS_C[ring.rarity] }}, ring.rarity)
                )
            )
        ),
        /* Gift */
        gift && React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', borderRadius:'8px', background:'rgba(249,168,212,0.06)', border:'1px solid rgba(249,168,212,0.15)', marginBottom:'10px' }},
            React.createElement('span', { style:{ fontSize:'16px' }}, gift.emoji),
            React.createElement('span', { style:{ fontSize:'11px', color:'#f9a8d4' }}, lang==='ar' ? `Ù‡Ø¯ÙŠØ©: ${gift.name_ar}` : `Gift: ${gift.name_en}`)
        ),
        /* Message */
        proposal.proposalMessage && React.createElement('div', { style:{ padding:'8px 12px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:'12px', color:'#f3f4f6', fontStyle:'italic', marginBottom:'10px' }},
            `" ${proposal.proposalMessage} "`),
        /* Buttons */
        React.createElement('div', { style:{ display:'flex', gap:'10px' }},
            React.createElement('button', {
                onClick: () => handle(false), disabled: handling,
                style:{ flex:1, padding:'11px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:'13px', fontWeight:700, cursor:'pointer' }
            }, handling ? 'â³' : (lang==='ar' ? 'âŒ Ø±ÙØ¶' : 'âŒ Decline')),
            React.createElement('button', {
                onClick: () => handle(true), disabled: handling,
                style:{ flex:1, padding:'11px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#ec4899,#a855f7)', color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 16px rgba(236,72,153,0.4)' }
            }, handling ? 'â³' : (lang==='ar' ? 'ðŸ’– Ù‚Ø¨ÙˆÙ„' : 'ðŸ’– Accept'))
        )
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ðŸ’’ WEDDING HALL MODAL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var eddingHallModal = ({
    show, onClose, lang,
    currentUID, currentUserData, coupleData, partnerData,
    onOpenPropose,      // opens ring shop
    onOpenCoupleCard,   // opens couple card
    onDivorce,          // calls divorceCouple
    onNotification,
}) => {
    const [tab, setTab]             = useState('feed');   // 'feed' | 'divorce' | 'proposals'
    const [couples, setCouples]     = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [coupleProfiles, setCoupleProfiles] = useState({}); // uid â†’ userData
    const [viewCouple, setViewCouple]   = useState(null);
    const [viewSelf, setViewSelf]       = useState(null);
    const [viewPartner, setViewPartner] = useState(null);
    const [showViewCard, setShowViewCard] = useState(false);
    const [divorcing, setDivorcing]     = useState(false);
    const [divorceConfirm, setDivorceConfirm] = useState(false);
    // Incoming proposals
    const [pendingProposals, setPendingProposals] = useState([]);
    const [proposerProfiles, setProposerProfiles] = useState({});

    // Listen for pending proposals sent TO this user
    useEffect(() => {
        if (!show || !currentUID) return;
        const unsub1 = couplesCollection
            .where('uid2', '==', currentUID)
            .where('status', '==', 'pending')
            .onSnapshot(snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setPendingProposals(docs);
                // load proposer profiles
                const toLoad = docs.map(d => d.uid1).filter(uid => !proposerProfiles[uid]);
                if (toLoad.length > 0) {
                    Promise.all(toLoad.map(uid => usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)))
                        .then(results => {
                            const map = { ...proposerProfiles };
                            results.forEach(u => { if (u) map[u.id] = u; });
                            setProposerProfiles(map);
                        });
                }
            }, () => {});
        return () => unsub1();
    }, [show, currentUID]);

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
            // It's the viewer's own couple â€” open the actual interactive card
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
        : 'ðŸ˜Ž'
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

            /* â”€â”€ Handle bar â”€â”€ */
            React.createElement('div', { style:{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }},
                React.createElement('div', { style:{ width:'40px', height:'4px', borderRadius:'4px', background:'rgba(255,255,255,0.15)' }})
            ),

            /* â”€â”€ Header â”€â”€ */
            React.createElement('div', { style:{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'8px 18px 12px', flexShrink:0
            }},
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'16px', fontWeight:900, color:'white' }}, 'ðŸ’’ ' + (lang==='ar' ? 'Ù‚Ø§Ø¹Ø© Ø§Ù„Ø£ÙØ±Ø§Ø­' : 'Wedding Hall')),
                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4', marginTop:'2px' }},
                        lang==='ar' ? 'Ø§ÙƒØªØ´Ù Ø§Ù„ÙƒØ§Ø¨Ù„Ø² ÙˆØ£Ø±Ø³Ù„ Ø·Ù„Ø¨Ùƒ' : 'Discover couples & send your proposal')
                ),
                React.createElement('button', {
                    onClick: onClose,
                    style:{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'10px',
                        color:'#9ca3af', fontSize:'18px', width:'34px', height:'34px', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center' }
                }, 'âœ•')
            ),

            /* â”€â”€ 4 Action Buttons â”€â”€ */
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
                    React.createElement('span', { style:{ fontSize:'18px' }}, 'ðŸ’'),
                    lang==='ar' ? 'Ø®Ø·Ø¨Ø©' : 'Propose'
                ),
                /* Incoming Proposals */
                React.createElement('button', {
                    onClick: () => setTab('proposals'),
                    style:{
                        flex:1, padding:'11px 6px', borderRadius:'14px', cursor:'pointer',
                        background: tab === 'proposals'
                            ? 'linear-gradient(135deg,#ec4899,#a855f7)'
                            : 'rgba(236,72,153,0.12)',
                        border: tab === 'proposals' ? 'none' : '1px solid rgba(236,72,153,0.3)',
                        color:'white', fontSize:'12px', fontWeight:800,
                        boxShadow: tab === 'proposals' ? '0 4px 16px rgba(236,72,153,0.4)' : 'none',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                        position:'relative',
                    }
                },
                    React.createElement('div', { style:{ position:'relative', display:'inline-block' }},
                        React.createElement('span', { style:{ fontSize:'18px' }}, 'ðŸ“©'),
                        pendingProposals.length > 0 && React.createElement('div', {
                            style:{ position:'absolute', top:'-3px', right:'-3px', width:'10px', height:'10px',
                                borderRadius:'50%', background:'#ef4444',
                                boxShadow:'0 0 6px rgba(239,68,68,0.9)',
                                animation:'pulse-ring 1.2s ease-in-out infinite',
                            }
                        })
                    ),
                    lang==='ar' ? 'Ø·Ù„Ø¨Ø§ØªÙŠ' : 'Proposals',
                    pendingProposals.length > 0 && React.createElement('span', {
                        style:{ fontSize:'8px', background:'rgba(239,68,68,0.8)', borderRadius:'8px',
                            padding:'1px 5px', fontWeight:900 }
                    }, pendingProposals.length)
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
                    React.createElement('span', { style:{ fontSize:'18px' }}, 'ðŸ’’'),
                    lang==='ar' ? 'Ø£ÙØ±Ø§Ø­' : 'Weddings'
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
                    React.createElement('span', { style:{ fontSize:'18px' }}, 'ðŸ’”'),
                    lang==='ar' ? 'Ø·Ù„Ø§Ù‚' : 'Divorce'
                )
            ),

            /* â”€â”€ Divider â”€â”€ */
            React.createElement('div', { style:{ height:'1px', background:'rgba(255,255,255,0.07)', flexShrink:0 }}),

            /* â”€â”€ Content â”€â”€ */
            React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'14px 16px' }},

                /* â”€â”€â”€â”€ PROPOSALS TAB â”€â”€â”€â”€ */
                tab === 'proposals' && (
                    pendingProposals.length === 0
                        ? React.createElement('div', { style:{ textAlign:'center', padding:'40px' }},
                            React.createElement('div', { style:{ fontSize:'40px', marginBottom:'12px' }}, 'ðŸ“©'),
                            React.createElement('div', { style:{ fontSize:'13px', color:'#6b7280' }},
                                lang==='ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø§Ø±ØªØ¨Ø§Ø· Ø­Ø§Ù„ÙŠØ§Ù‹' : 'No pending proposals'))
                        : React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' }},
                            pendingProposals.map(proposal =>
                                React.createElement(ProposalItem, {
                                    key: proposal.id,
                                    proposal,
                                    fromData: proposerProfiles[proposal.uid1],
                                    lang,
                                    onNotification,
                                })
                            )
                        )
                ),

                /* â”€â”€â”€â”€ FEED TAB â”€â”€â”€â”€ */
                tab === 'feed' && (
                    loadingFeed
                        ? React.createElement('div', { style:{ textAlign:'center', padding:'40px', color:'#6b7280' }}, 'â³')
                        : couples.length === 0
                            ? React.createElement('div', { style:{ textAlign:'center', padding:'40px' }},
                                React.createElement('div', { style:{ fontSize:'48px', marginBottom:'12px' }}, 'ðŸ’’'),
                                React.createElement('div', { style:{ fontSize:'13px', color:'#6b7280' }},
                                    lang==='ar' ? 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£ÙØ±Ø§Ø­ Ø§Ù„ÙŠÙˆÙ…' : 'No weddings today'))
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
                                                `${u1?.displayName || 'â€”'} ${lang==='ar'?'Ùˆ':'&'} ${u2?.displayName || 'â€”'}`,
                                                isMyCouple && React.createElement('span', { style:{ marginLeft:'6px', fontSize:'10px', background:'rgba(236,72,153,0.2)', color:'#f9a8d4', border:'1px solid rgba(236,72,153,0.4)', borderRadius:'6px', padding:'1px 7px' }}, lang==='ar'?'Ø£Ù†ØªÙ…':'You')
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

                /* â”€â”€â”€â”€ DIVORCE TAB â”€â”€â”€â”€ */
                tab === 'divorce' && React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:'14px' }},
                    !coupleData
                        ? React.createElement('div', { style:{ textAlign:'center', padding:'40px' }},
                            React.createElement('div', { style:{ fontSize:'40px', marginBottom:'12px' }}, 'ðŸ’”'),
                            React.createElement('div', { style:{ fontSize:'13px', color:'#6b7280' }},
                                lang==='ar' ? 'Ù„Ø³Øª Ù…Ø±ØªØ¨Ø·Ø§Ù‹ Ø­Ø§Ù„ÙŠØ§Ù‹' : 'You are not in a relationship'))
                        : React.createElement('div', null,
                            /* Current couple summary */
                            React.createElement('div', { style:{ padding:'16px', borderRadius:'16px', background:'rgba(236,72,153,0.08)', border:'1px solid rgba(236,72,153,0.2)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'14px' }},
                                React.createElement(Av, { user:currentUserData, size:44 }),
                                React.createElement('span', { style:{ fontSize:'22px' }}, 'ðŸ’•'),
                                React.createElement(Av, { user:partnerData, size:44 }),
                                React.createElement('div', { style:{ marginLeft:'8px', flex:1 }},
                                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:700, color:'white' }},
                                        partnerData?.displayName || 'â€”'),
                                    React.createElement('div', { style:{ fontSize:'10px', color:'#f9a8d4' }},
                                        (() => { const d = coupleTimeDiff(coupleData?.marriageDate); return d ? (lang==='ar' ? `Ù…Ø¹Ø§Ù‹ ${d.days} ÙŠÙˆÙ…` : `Together ${d.days} days`) : ''; })())
                                )
                            ),
                            !divorceConfirm
                                ? React.createElement('button', {
                                    onClick: () => setDivorceConfirm(true),
                                    style:{ width:'100%', padding:'14px', borderRadius:'14px', border:'none',
                                        background:'linear-gradient(135deg,#ef4444,#b91c1c)',
                                        color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer',
                                        boxShadow:'0 4px 16px rgba(239,68,68,0.3)' }
                                  }, lang==='ar' ? 'ðŸ’” Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·' : 'ðŸ’” End Relationship')
                                : React.createElement('div', { style:{ padding:'16px', borderRadius:'14px', border:'1px solid rgba(239,68,68,0.35)', background:'rgba(239,68,68,0.08)', textAlign:'center' }},
                                    React.createElement('div', { style:{ fontSize:'13px', color:'#f87171', fontWeight:700, marginBottom:'12px' }},
                                        lang==='ar' ? 'âš ï¸ Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ØŸ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹!' : 'âš ï¸ Are you sure? This cannot be undone!'),
                                    React.createElement('div', { style:{ display:'flex', gap:'10px' }},
                                        React.createElement('button', { onClick:()=>setDivorceConfirm(false), style:{ flex:1, padding:'11px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'#9ca3af', fontSize:'12px', cursor:'pointer' }},
                                            lang==='ar' ? 'ØªØ±Ø§Ø¬Ø¹' : 'Cancel'),
                                        React.createElement('button', { onClick:handleDivorce, disabled:divorcing, style:{ flex:1, padding:'11px', borderRadius:'12px', border:'none', background:'rgba(239,68,68,0.8)', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }},
                                            divorcing ? 'â³' : (lang==='ar' ? 'ðŸ’” ØªØ£ÙƒÙŠØ¯' : 'ðŸ’” Confirm'))
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

