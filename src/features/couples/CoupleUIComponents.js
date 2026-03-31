(function () {
  var { useState } = React;

  // ─────────────────────────────────────────────
  // 💫 FLOATING HEARTS ANIMATION (pure JS canvas-free)
  // ─────────────────────────────────────────────
  var FloatingHearts = () => {
    var HEARTS = ['❤️', '💕', '💗', '💖', '💘', '💓'];
    var items = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      emoji: HEARTS[i % HEARTS.length],
      left: `${5 + i * 9 % 90}%`,
      delay: `${(i * 0.7).toFixed(1)}s`,
      dur: `${3 + i % 3}s`,
      size: `${12 + i % 3 * 4}px`
    }));
    return React.createElement('div', {
      style: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }
    },
    React.createElement('style', null, `
                @keyframes floatHeart {
                    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
                    50%  { transform: translateY(-60px) scale(1.2); opacity: 0.9; }
                    100% { transform: translateY(-120px) scale(0.8); opacity: 0; }
                }
            `),
    ...items.map((h) =>
    React.createElement('span', {
      key: h.id,
      style: {
        position: 'absolute',
        bottom: '10px',
        left: h.left,
        fontSize: h.size,
        animation: `floatHeart ${h.dur} ${h.delay} infinite ease-out`,
        display: 'block'
      }
    }, h.emoji)
    )
    );
  };

  // ─────────────────────────────────────────────
  // 🖼️ RingImageCanvas — removes black bg pixels via canvas.
  // ─────────────────────────────────────────────
  var RingImageCanvas = ({ size = 40, src, glow }) => {
    var canvasRef = React.useRef(null);
    var imgRef = React.useRef(null);
    var rafRef = React.useRef(null);

    React.useEffect(() => {
      if (!src) return;
      var canvas = canvasRef.current;
      var img = imgRef.current;
      if (!canvas || !img) return;
      var ctx = canvas.getContext('2d', { willReadFrequently: true });
      var running = true;

      var draw = () => {
        if (!running) return;
        if (img.naturalWidth > 0) {
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          try {
            var id = ctx.getImageData(0, 0, size, size);
            var d = id.data;
            for (var i = 0; i < d.length; i += 4) {
              if (d[i] < 45 && d[i + 1] < 45 && d[i + 2] < 45) d[i + 3] = 0;
            }
            ctx.putImageData(id, 0, 0);
          } catch (e) {/* CORS blocked — shows as-is */}
        }
        rafRef.current = requestAnimationFrame(draw);
      };

      rafRef.current = requestAnimationFrame(draw);
      return () => {running = false;cancelAnimationFrame(rafRef.current);};
    }, [src, size]);

    return React.createElement(React.Fragment, null,
    React.createElement('img', {
      ref: imgRef,
      src,
      crossOrigin: 'anonymous',
      alt: '',
      style: { position: 'fixed', left: '-9999px', top: '-9999px',
        width: `${size}px`, height: `${size}px`, pointerEvents: 'none', opacity: 0.01 }
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

  // ─────────────────────────────────────────────
  // 📩 PROPOSAL ITEM — standalone for notification list
  // ─────────────────────────────────────────────
  var ProposalItem = ({ proposal, fromData, lang, onNotification }) => {
    var [handling, setHandling] = useState(false);
    var ring = window.RINGS_DATA.find((r) => r.id === proposal.ringId) || window.RINGS_DATA[0];
    var gift = window.PROPOSAL_GIFTS.find((g) => g.id === proposal.giftId);

    var handle = async (accept) => {
      setHandling(true);
      if (accept) {
        await window.acceptProposal({ coupleDocId: proposal.id, uid1: proposal.uid1, uid2: proposal.uid2, onNotification, lang });
      } else {
        await window.declineProposal({ coupleDocId: proposal.id, fromUID: proposal.uid1, toUID: proposal.uid2, ringCost: ring.cost, giftCost: gift?.cost || 0, onNotification, lang });
      }
      setHandling(false);
    };

    return React.createElement('div', { style: { padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '12px', marginBottom: '8px' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' } },
    React.createElement('div', { style: { width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #ec4899' } },
    fromData?.photoURL ? React.createElement('img', { src: fromData.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '😎'
    ),
    React.createElement('div', { style: { flex: 1 } },
    React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: 'white' } }, fromData?.displayName || 'Someone'),
    React.createElement('div', { style: { fontSize: '10px', color: '#f9a8d4' } }, lang === 'ar' ? 'أرسل لك طلب ارتباط' : 'sent a proposal')
    )
    ),
    React.createElement('div', { style: { display: 'flex', gap: '8px' } },
    React.createElement('button', { onClick: () => handle(true), disabled: handling, style: { flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#ec4899', color: 'white', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } }, handling ? '...' : lang === 'ar' ? 'قبول' : 'Accept'),
    React.createElement('button', { onClick: () => handle(false), disabled: handling, style: { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, handling ? '...' : lang === 'ar' ? 'رفض' : 'Decline')
    )
    );
  };

  // Global exports
  window.FloatingHearts = FloatingHearts;
  window.RingImageCanvas = RingImageCanvas;
  window.ProposalItem = ProposalItem;

})();