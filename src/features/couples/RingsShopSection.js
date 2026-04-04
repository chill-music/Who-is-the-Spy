(function () {
  var { useState } = React;

  var RingsShopSection = ({ userData, lang, currentUID, onPropose, onNotification }) => {
    var currency = userData?.currency || 0;
    var charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(userData?.charisma || 0).currentLevel.level : 0;
    var myRings = userData?.inventory?.rings || [];
    var [buying, setBuying] = useState(null);
    var [buyMsg, setBuyMsg] = useState('');

    var handleBuy = async (ring) => {
      if (buying) return;
      var charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(userData?.charisma || 0).currentLevel.level : 0;
      if (charismaLvl < ring.levelReq) return;

      var bal = userData?.currency || 0;
      if (bal < ring.cost) {
        setBuyMsg(lang === 'ar' ? `❌ رصيد غير كافٍ (${bal}🧠)` : `❌ Insufficient balance (${bal}🧠)`);
        return;
      }

      window._confirm({
        title: lang === 'ar' ? 'تأكيد الشراء' : 'Confirm Purchase',
        text: lang === 'ar' ? `هل أنت متأكد أنك تريد شراء ${ring.name_ar} مقابل ${ring.cost}🧠 ؟` : `Are you sure you want to buy ${ring.name_en} for ${ring.cost}🧠?`,
        icon: 'question',
        confirmButtonText: lang === 'ar' ? 'نعم، شراء' : 'Yes, Buy',
        onConfirm: async () => {
          setBuying(ring.id); setBuyMsg('');
          try {
            var snap = await usersCollection.doc(currentUID).get();
            var currentBal = snap.exists ? snap.data().currency || 0 : 0;
            if (currentBal < ring.cost) {
              setBuyMsg(lang === 'ar' ? `❌ رصيد غير كافٍ (${currentBal}🧠)` : `❌ Insufficient balance (${currentBal}🧠)`);
              setBuying(null); return;
            }
            // 🛡️ SECURITY: Ring Purchase
            if (window.SecurityService) {
              await window.SecurityService.applyCurrencyTransaction(currentUID, -ring.cost, `Ring Purchase: ${ring.name}`, { ringId: ring.id });
            } else {
              await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(-ring.cost) });
            }
            
            await usersCollection.doc(currentUID).update({
              'inventory.rings': firebase.firestore.FieldValue.arrayUnion(ring.id)
            });
            setBuyMsg(lang === 'ar' ? `✅ ${ring.name_ar} أُضيف لمخزونك!` : `✅ ${ring.name_en} added to inventory!`);
            setTimeout(() => setBuyMsg(''), 3000);
          } catch (e) { setBuyMsg(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
          setBuying(null);
        }
      });
    };

    var visibleRings = window.RINGS_DATA.filter((r) => !r.hidden || myRings.includes(r.id));

    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' } },
    /* Shop section header/inventory status */
    myRings.length > 0 && React.createElement('div', { style: { padding: '8px 12px', borderRadius: '10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', fontSize: '11px', color: '#c4b5fd' } },
    lang === 'ar' ? `مخزونك يحتوي على خواتم مرتبطة بالارتباط` : `Inventory contains marriage rings`
    ),
    /* Rings list */
    visibleRings.map((ring) => {
      var meetsLevel = charismaLvl >= ring.levelReq;
      var canAfford = currency >= ring.cost;
      var isMine = myRings.includes(ring.id);
      var isBuying = buying === ring.id;
      var limitExpired = ring.limitedUntil && new Date(ring.limitedUntil) < new Date();

      return React.createElement('div', { key: ring.id, style: { padding: '14px 16px', borderRadius: '14px', background: `linear-gradient(135deg, ${ring.color}12, ${ring.color}06)`, border: `1px solid ${!meetsLevel || limitExpired ? 'rgba(255,255,255,0.07)' : ring.color + '40'}`, display: 'flex', alignItems: 'center', gap: '12px', opacity: !meetsLevel || limitExpired ? 0.55 : 1 } },
      /* Ring image/emoji */
      React.createElement('div', { style: { width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      ring.imageURL ?
      React.createElement('img', { src: ring.imageURL, alt: '', style: { width: '44px', height: '44px', objectFit: 'contain', mixBlendMode: 'screen' } }) :
      React.createElement('span', { style: { fontSize: '28px', filter: `drop-shadow(0 0 6px ${ring.glow})` } }, ring.emoji)
      ),
      /* Ring details */
      React.createElement('div', { style: { flex: 1 } },
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: ring.color } }, lang === 'ar' ? ring.name_ar : ring.name_en),
      React.createElement('div', { style: { fontSize: '10px', color: window.RARITY_COLORS_C[ring.rarity] } }, ring.rarity),
      !meetsLevel && React.createElement('div', { style: { fontSize: '10px', color: '#f97316', marginTop: '3px' } }, lang === 'ar' ? `كاريزما مستوى ${ring.levelReq}` : `Charisma Lv${ring.levelReq}`)
      ),
      /* Purchase / Use button */
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' } },
      React.createElement('div', { style: { fontSize: '12px', fontWeight: 800, color: canAfford ? '#fcd34d' : '#ef4444' } }, `${ring.cost}🧠`),
      !limitExpired && React.createElement('button', { onClick: () => handleBuy(ring), disabled: isBuying || !canAfford || !meetsLevel, style: { padding: '7px 12px', borderRadius: '10px', border: 'none', background: !canAfford || !meetsLevel ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,#ec4899,#a855f7)`, color: !canAfford || !meetsLevel ? '#4b5563' : 'white', fontSize: '11px', fontWeight: 800, cursor: !canAfford || !meetsLevel ? 'not-allowed' : 'pointer' } }, isBuying ? '⏳' : lang === 'ar' ? 'شراء' : 'Buy'),
      isMine && onPropose && React.createElement('button', { onClick: () => onPropose(ring), style: { padding: '4px 10px', borderRadius: '8px', border: `1px solid ${ring.color}50`, background: `${ring.color}15`, color: ring.color, fontSize: '9px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'استخدم' : 'Use')
      )
      );
    }),
    buyMsg && React.createElement('div', { style: { padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', color: '#4ade80', fontSize: '12px', textAlign: 'center' } }, buyMsg)
    );
  };

  window.RingsShopSection = RingsShopSection;
})();