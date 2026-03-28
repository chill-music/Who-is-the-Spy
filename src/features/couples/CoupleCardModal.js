(function() {
    var { useState, useEffect, useRef } = React;

    var CoupleCardModal = ({
        show, onClose, coupleDoc, currentUID, partnerData, selfData,
        lang, onNotification, viewOnly,
        onOpenProfile,
        currentUserData,
    }) => {
        var [liveDoc, setLiveDoc]         = useState(null);
        var [timer, setTimer]             = useState({ days:0, hours:0, mins:0 });
        var [editingBio, setEditingBio]   = useState(false);
        var [bioText, setBioText]         = useState('');
        var [savingBio, setSavingBio]     = useState(false);
        var [uploading, setUploading]     = useState(false);
        var [uploadErr, setUploadErr]     = useState('');
        var [ringTooltipId, setRingTooltipId] = useState(null);
        var [showGiftRingPanel, setShowGiftRingPanel] = useState(false);
        var [giftingRing, setGiftingRing] = useState(false);
        var [giftRingOk, setGiftRingOk]   = useState('');
        var [giftRingErr, setGiftRingErr] = useState('');
        var photoRef                      = useRef(null);
        var timerRef                      = useRef(null);
        var [divorceStep, setDivorceStep] = useState(0);
        var [divorcing, setDivorcing]     = useState(false);
        var [sending, setSending]         = useState(false);
        var [giftErr, setGiftErr]         = useState('');
        var [giftOk, setGiftOk]           = useState('');
        var [showGiftPanel, setShowGiftPanel] = useState(false);
        var [switchingRing, setSwitchingRing] = useState(false);

        // Real-time listener
        useEffect(() => {
            if (!show || !coupleDoc?.id) { setLiveDoc(null); return; }
            var unsub = couplesCollection.doc(coupleDoc.id).onSnapshot(
                snap => {
                    if (snap.exists) { setLiveDoc({ id: snap.id, ...snap.data() }); }
                    else { setLiveDoc(null); setTimeout(() => onClose(), 600); }
                }, () => {}
            );
            return () => unsub();
        }, [show, coupleDoc?.id]);

        var doc = liveDoc || coupleDoc;

        useEffect(() => {
            if (!show || !doc?.marriageDate) return;
            var tick = () => { var d = window.coupleTimeDiff(doc.marriageDate); if(d) setTimer(d); };
            tick();
            timerRef.current = setInterval(tick, 60000);
            return () => clearInterval(timerRef.current);
        }, [show, doc?.marriageDate]);

        useEffect(() => {
            if (show) { setBioText(doc?.sharedBio || ''); setDivorceStep(0); setUploadErr(''); }
        }, [show, doc?.sharedBio]);

        if (!show || !doc) return null;

        var ring     = window.RINGS_DATA.find(r => r.id === doc.ringId) || window.RINGS_DATA[0];
        var isMember = !viewOnly && (currentUID === doc.uid1 || currentUID === doc.uid2);
        var loveInfo = window.getLoveLevel(timer.days);
        var COUPLE_GIFTS = (window.SHOP_ITEMS?.gifts || []).filter(g => !g.hidden).slice(0, 12);

        var saveBio = async () => {
            if (!doc?.id) return;
            setSavingBio(true);
            try {
                await couplesCollection.doc(doc.id).update({ sharedBio: bioText });
                setEditingBio(false);
                onNotification && onNotification(lang==='ar' ? '✅ تم الحفظ' : '✅ Saved');
            } catch(e) {}
            setSavingBio(false);
        };

        var handlePhotoUpload = async (e) => {
            var file = e.target.files?.[0];
            if (!file || !doc?.id) return;
            setUploadErr('');
            if (!file.type.startsWith('image/')) {
                setUploadErr(lang==='ar' ? 'ملف غير صالح' : 'Invalid file');
                return;
            }
            setUploading(true);
            try {
                var bmp = await createImageBitmap(file);
                var canvas = document.createElement('canvas'); // ... simplified compression
                canvas.width = 800; canvas.height = 600;
                canvas.getContext('2d').drawImage(bmp, 0, 0, 800, 600);
                var base64 = canvas.toDataURL('image/jpeg', 0.8);
                await couplesCollection.doc(doc.id).update({ couplePhotoUrl: base64 });
                onNotification && onNotification(lang==='ar' ? '✅ تم الرفع' : '✅ Uploaded');
            } catch(err) { setUploadErr('Error'); }
            setUploading(false);
        };

        var handleDivorceAction = async () => {
            setDivorcing(true);
            await window.divorceCouple({ coupleDocId: doc.id, uid1: doc.uid1, uid2: doc.uid2, onNotification, lang });
            setDivorcing(false); onClose();
        };

        return React.createElement(window.PortalModal, null,
            React.createElement('div', {
                onClick: onClose,
                style:{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH + 2, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }
            },
            React.createElement('div', {
                className:'animate-pop',
                onClick: e => e.stopPropagation(),
                style:{ position:'relative', width:'100%', maxWidth:'400px', maxHeight:'92vh', background:'#0c0414', border:`1px solid ${ring.color}50`, borderRadius:'20px', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:`0 0 60px ${ring.glow}` }
            },
                React.createElement(window.FloatingHearts),
                /* Top Nav */
                React.createElement('div', { style:{ position:'absolute', top:0, left:0, right:0, zIndex:30, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px' }},
                    React.createElement('button', { onClick: onClose, style:{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(0,0,0,0.5)', color:'white', cursor:'pointer' }}, '‹'),
                    React.createElement('div', { style:{ fontSize:'14px', fontWeight:900, color:'white' }}, lang==='ar' ? 'بيتنا 🏠' : 'Our Home 🏠'),
                    React.createElement('div', { style:{ width:'32px' }})
                ),
                /* Photo */
                React.createElement('div', { style:{ position:'relative', width:'100%', height:'230px', background:'rgba(255,255,255,0.05)' }},
                    doc.couplePhotoUrl && React.createElement('img', { src: doc.couplePhotoUrl, style:{ width:'100%', height:'100%', objectFit:'cover' }}),
                    isMember && React.createElement('button', { onClick:()=>photoRef.current?.click(), style:{ position:'absolute', top:'50px', right:'12px', background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', width:'36px', height:'36px', cursor:'pointer' }}, '📷'),
                    React.createElement('input', { type:'file', ref:photoRef, style:{ display:'none' }, onChange:handlePhotoUpload })
                ),
                /* Body & Bio */
                React.createElement('div', { style:{ flex:1, overflowY:'auto', padding:'16px', color:'white' }},
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-around', marginBottom:'20px' }},
                        /* Avatars & Ring (Logic mirrored) */
                        React.createElement('div', { style:{ textAlign:'center' }},
                            React.createElement('div', { style:{ width:'60px', height:'60px', borderRadius:'50%', border:`2px solid ${ring.color}`, overflow:'hidden' }}, selfData?.photoURL ? React.createElement('img', { src:selfData.photoURL, style:{ width:'100%', height:'100%' }}) : '😎'),
                            React.createElement('div', { style:{ fontSize:'10px' }}, selfData?.displayName || '—')
                        ),
                        React.createElement('div', { style:{ fontSize:'30px' }}, ring.emoji),
                        React.createElement('div', { style:{ textAlign:'center' }},
                            React.createElement('div', { style:{ width:'60px', height:'60px', borderRadius:'50%', border:`2px solid ${ring.color}`, overflow:'hidden' }}, partnerData?.photoURL ? React.createElement('img', { src:partnerData.photoURL, style:{ width:'100%', height:'100%' }}) : '😎'),
                            React.createElement('div', { style:{ fontSize:'10px' }}, partnerData?.displayName || '—')
                        )
                    ),
                    /* Bio */
                    React.createElement('div', { style:{ padding:'10px', background:'rgba(255,255,255,0.05)', borderRadius:'10px' }},
                        editingBio ? React.createElement('textarea', { value:bioText, onChange:e=>setBioText(e.target.value), style:{ width:'100%', background:'transparent', color:'white', border:'none' }}) : React.createElement('div', { style:{ fontSize:'12px', fontStyle:'italic' }}, doc.sharedBio || 'No bio...'),
                        isMember && React.createElement('button', { onClick:()=>editingBio?saveBio():setEditingBio(true), style:{ background:'transparent', color:ring.color, border:'none', cursor:'pointer', fontSize:'10px' }}, editingBio?'[Save]':'[Edit]')
                    ),
                    /* Love Level */
                    React.createElement('div', { style:{ marginTop:'14px' }},
                        React.createElement('div', { style:{ fontSize:'11px', color:loveInfo.color }}, loveInfo.label_ar),
                        React.createElement('div', { style:{ width:'100%', height:'4px', background:'rgba(255,255,255,0.1)', marginTop:'4px' }},
                            React.createElement('div', { style:{ width:`${loveInfo.pct}%`, height:'100%', background:loveInfo.color }})
                        )
                    ),
                    /* Divorce Step (Mandatory for safety) */
                    isMember && !viewOnly && React.createElement('div', { style:{ marginTop:'20px', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'10px' }},
                        divorceStep === 0 ? React.createElement('button', { onClick:()=>setDivorceStep(1), style:{ background:'transparent', color:'#ef4444', border:'none', fontSize:'10px', cursor:'pointer' }}, lang==='ar'?'💔 إنهاء الارتباط':'💔 Divorce') : 
                        React.createElement('div', { style:{ display:'flex', gap:'10px' }},
                            React.createElement('button', { onClick:handleDivorceAction, style:{ background:'#ef4444', color:'white', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'10px', cursor:'pointer' }}, lang==='ar'?'متأكد؟':'Confirm?'),
                            React.createElement('button', { onClick:()=>setDivorceStep(0), style:{ background:'rgba(255,255,255,0.1)', color:'white', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'10px', cursor:'pointer' }}, lang==='ar'?'تراجع':'Cancel')
                        )
                    )
                )
            ))
        );
    };

    window.CoupleCardModal = CoupleCardModal;
})();
