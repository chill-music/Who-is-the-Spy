(function() {
    var { useState } = React;

    var IncomingProposalModal = ({ show, coupleDoc, fromData, currentUID, lang, onAccept, onDecline }) => {
        var [loading, setLoading] = useState(false);
        if (!show || !coupleDoc) return null;

        var ring  = window.RINGS_DATA.find(r => r.id === coupleDoc.ringId);
        var gift  = window.PROPOSAL_GIFTS.find(g => g.id === coupleDoc.giftId);

        var handle = async (accept) => {
            setLoading(true);
            if (accept) {
                await onAccept(coupleDoc);
            } else {
                await onDecline(coupleDoc);
            }
            setLoading(false);
        };

        return React.createElement(window.PortalModal, null,
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
                React.createElement(window.FloatingHearts),

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
                    /* Sender info */
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'12px' }},
                        React.createElement('div', { style:{ width:'48px', height:'48px', borderRadius:'50%', overflow:'hidden', border:'2.5px solid rgba(236,72,153,0.5)' }},
                            fromData?.photoURL ? React.createElement('img', { src:fromData.photoURL, alt:'', style:{ width:'100%', height:'100%', objectFit:'cover' }}) : '😎'
                        ),
                        React.createElement('div', null,
                            React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'white' }}, fromData?.displayName || '—'),
                            React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }}, lang==='ar' ? 'يطلب ارتباطك 💕' : 'is proposing to you 💕')
                        )
                    ),
                    /* Ring info */
                    ring && React.createElement('div', { style:{ padding:'10px 14px', borderRadius:'12px', background:`${ring.color}15`, border:`1px solid ${ring.color}40`, display:'flex', alignItems:'center', gap:'10px' }},
                        React.createElement('span', { style:{ fontSize:'22px' }}, ring.emoji),
                        React.createElement('div', null,
                            React.createElement('div', { style:{ fontSize:'12px', fontWeight:700, color:ring.color }}, lang==='ar' ? ring.name_ar : ring.name_en),
                            React.createElement('div', { style:{ fontSize:'10px', color: (window.RARITY_COLORS_C||{})[ring.rarity] }}, ring.rarity)
                        )
                    ),
                    /* Gift info */
                    gift && React.createElement('div', { style:{ padding:'8px 14px', borderRadius:'10px', background:'rgba(249,168,212,0.08)', border:'1px solid rgba(249,168,212,0.2)', display:'flex', alignItems:'center', gap:'8px' }},
                        React.createElement('span', { style:{ fontSize:'20px' }}, gift.emoji),
                        React.createElement('div', { style:{ fontSize:'11px', color:'#f9a8d4' }}, lang==='ar' ? `هدية: ${gift.name_ar}` : `Gift: ${gift.name_en}`)
                    ),
                    /* Message */
                    coupleDoc.proposalMessage && React.createElement('div', {
                        style:{ padding:'10px 14px', borderRadius:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', fontSize:'13px', color:'#f3f4f6', fontStyle:'italic', lineHeight:1.6, textAlign: lang==='ar' ? 'right' : 'left' }
                    }, `" ${coupleDoc.proposalMessage} "`),
                    /* Buttons */
                    React.createElement('div', { style:{ display:'flex', gap:'10px', marginTop:'4px' }},
                        React.createElement('button', { onClick: () => handle(false), disabled: loading, style:{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:'13px', fontWeight:700, cursor:'pointer' }}, loading ? '⏳' : (lang==='ar' ? '❌ رفض' : '❌ Decline')),
                        React.createElement('button', { onClick: () => handle(true), disabled: loading, style:{ flex:1, padding:'12px', borderRadius:'12px', background:'linear-gradient(135deg,#ec4899,#a855f7)', color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer' }}, loading ? '⏳' : (lang==='ar' ? '💖 قبول' : '💖 Accept'))
                    )
                )
            ))
        );
    };

    window.IncomingProposalModal = IncomingProposalModal;
})();
