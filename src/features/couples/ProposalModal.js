(function () {
  var { useState, useEffect } = React;

  var ProposalModal = ({ show, onClose, ring, currentUserData, currentUID, lang, onSend, friendsData }) => {
    var [selectedGift, setSelectedGift] = useState(null);
    var [message, setMessage] = useState('');
    var [targetId, setTargetId] = useState('');
    var [targetData, setTargetData] = useState(null);
    var [searching, setSearching] = useState(false);
    var [sending, setSending] = useState(false);
    var [searchErr, setSearchErr] = useState('');

    useEffect(() => {
      if (show) {
        setTargetId('');
        setTargetData(null);
        setSearchErr('');
        setMessage('');
        setSelectedGift(null);
      }
    }, [show]);

    if (!show || !ring) return null;

    var currency = currentUserData?.currency || 0;
    var giftCost = selectedGift?.price || selectedGift?.cost || 0;
    var totalCost = (ring.price || ring.cost || 0) + giftCost;
    var canAfford = currency >= totalCost;

    // Filter available friends
    var friends = (friendsData || []).filter(f => f && !f.isMarried && (f.id || f.uid) !== currentUID);

    var selectFriend = (f) => {
      setTargetId(f.customId || '');
      setTargetData({ id: f.id || f.uid, ...f });
      setSearchErr('');
    };

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
            setSearchErr(lang === 'ar' ? 'لا يمكنك طلب نفسك!' : 'Cannot propose to yourself!');
          } else if (d.isMarried) {
            setSearchErr(lang === 'ar' ? 'هذا المستخدم مرتبط بالفعل' : 'This user is already coupled');
          } else {
            setTargetData(d);
          }
        }
      } catch (e) {
        console.error(e);
        setSearchErr('Error');
      }
      setSearching(false);
    };

    var handleSend = async () => {
      if (!targetData || !canAfford || sending) return;
      setSending(true);
      try {
        await onSend({ 
          toUID: targetData.id, 
          toData: targetData, 
          giftId: selectedGift?.id || null, 
          message,
          ringId: ring.id 
        });
        onClose();
      } catch (e) {
        console.error(e);
      } finally {
        setSending(false);
      }
    };

    var Av = ({ user, size = 44 }) => React.createElement('div', {
      style: { width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(236,72,153,0.4)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(size * 0.4), position: 'relative' }
    }, 
    user?.photoURL ? React.createElement('img', { src: user.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '👤',
    user?.isVIP && React.createElement('div', { style: { position: 'absolute', inset: 0, border: '2px solid gold', borderRadius: '50%', pointerEvents: 'none' } })
    );

    return React.createElement(window.PortalModal, null,
    React.createElement('div', {
      onClick: onClose,
      style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 10, background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
    },
    React.createElement('div', {
      className: 'animate-pop',
      onClick: (e) => e.stopPropagation(),
      style: { position: 'relative', width: '100%', maxWidth: '440px', maxHeight: '92vh', background: 'linear-gradient(135deg,#120818 0%,#0a0410 100%)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 60px rgba(236,72,153,0.2)' }
    },
    /* Floating Hearts Visual */
    React.createElement(window.FloatingHearts, { count: 12 }),
    
    /* Header */
    React.createElement('div', { style: { padding: '24px 24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(236,72,153,0.05)', borderBottom: '1px solid rgba(236,72,153,0.1)' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
        React.createElement('div', { style: { width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(236,72,153,0.1)', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.25)', boxShadow: `0 0 20px ${ring.color}30` } }, 
          React.createElement('span', { style: { fontSize: '34px', filter: `drop-shadow(0 0 10px ${ring.color})` } }, ring.emoji)
        ),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 1000, color: 'white', letterSpacing: '0.4px', textShadow: '0 0 10px rgba(236,72,153,0.5)' } }, lang === 'ar' ? 'طلب عرض زواج' : 'Marriage Proposal'),
          React.createElement('div', { style: { fontSize: '11px', color: '#fba0ca', fontWeight: 700, marginTop: '2px' } }, lang === 'ar' ? 'اختر شريكك المفضل' : 'Choose your crush')
        )
      ),
      React.createElement('button', { onClick: onClose, style: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', color: '#9ca3af', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '✕')
    ),

    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' } },
      
      /* Search Area */
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: '12px', fontWeight: 900, color: '#f9a8d4', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, lang === 'ar' ? 'إرسال إلى (ID):' : 'Send to (ID):'),
        React.createElement('div', { style: { display: 'flex', gap: '10px' } },
          React.createElement('input', { 
            value: targetId, 
            onChange: (e) => { setTargetId(e.target.value); setTargetData(null); setSearchErr(''); },
            placeholder: lang === 'ar' ? 'ادخل الـ ID...' : 'Enter ID...', 
            style: { flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white', fontSize: '14px', outline: 'none' }
          }),
          React.createElement('button', { onClick: searchUser, disabled: searching, style: { background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', border: 'none', borderRadius: '18px', padding: '0 24px', fontWeight: 950, cursor: 'pointer', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' } }, searching ? '...' : (lang === 'ar' ? 'بحث' : 'Find'))
        ),
        searchErr && React.createElement('div', { style: { color: '#f87171', fontSize: '11px', marginTop: '8px', fontWeight: 800, padding: '4px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', display: 'inline-block' } }, searchErr)
      ),

      /* User Selected View (If any) */
      targetData && React.createElement('div', { className: 'animate-pop', style: { display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', borderRadius: '24px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' } },
        React.createElement(Av, { user: targetData, size: 56 }),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontSize: '15px', fontWeight: 1000, color: '#34d399' } }, targetData.displayName),
          React.createElement('div', { style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' } }, `#${targetData.customId}`)
        ),
        React.createElement('div', { style: { fontSize: '24px', animation: 'heart-beat 1.5s infinite' } }, '💝')
      ),

      /* Friends Quick Selector */
      !targetData && friends.length > 0 && React.createElement('div', null,
        React.createElement('div', { style: { fontSize: '12px', fontWeight: 800, color: '#9ca3af', marginBottom: '12px' } }, lang === 'ar' ? 'أصدقاء متاحين:' : 'Available Friends:'),
        React.createElement('div', { style: { display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' } },
          friends.map(f => React.createElement('div', { key: f.uid || f.id, onClick: () => selectFriend(f), style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.2s' } },
            React.createElement(Av, { user: f, size: 56 }),
            React.createElement('div', { style: { fontSize: '11px', color: 'white', fontWeight: 800, width: '64px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, f.displayName)
          ))
        )
      ),

      /* Love Note TextArea */
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: '12px', fontWeight: 900, color: '#f9a8d4', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, lang === 'ar' ? 'رسالة العرض:' : 'Proposal Note:'),
        React.createElement('textarea', {
          value: message,
          onChange: (e) => setMessage(e.target.value.slice(0, 100)),
          placeholder: lang === 'ar' ? 'اكتب كلمة حب هنا...' : 'Write your romantic message...',
          style: { width: '100%', height: '110px', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: 'white', fontSize: '14px', resize: 'none', outline: 'none', transition: 'border-color 0.2s' },
          onFocus: (e) => e.target.style.borderColor = 'rgba(236,72,153,0.4)',
          onBlur: (e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'
        }),
        React.createElement('div', { style: { textAlign: 'right', fontSize: '10px', color: '#6b7280', marginTop: '8px', fontWeight: 600 } }, `${message.length}/100`)
      )
    ),

    /* Footer / Action */
    React.createElement('div', { style: { padding: '24px 28px', background: 'rgba(236,72,153,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } }, 
        React.createElement('div', { style: { color: '#9ca3af', fontSize: '13px', fontWeight: 700 } }, lang === 'ar' ? 'التكلفة الإجمالية:' : 'Total Cost:'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          React.createElement('span', { style: { color: 'white', fontSize: '20px', fontWeight: 1000 } }, totalCost.toLocaleString()),
          React.createElement('span', { style: { color: 'gold', fontSize: '16px' } }, '💰')
        )
      ),
      React.createElement('button', {
        onClick: handleSend,
        disabled: !targetData || !canAfford || sending,
        style: { width: '100%', padding: '18px', borderRadius: '22px', border: 'none', background: !targetData || !canAfford ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#ec4899,#be185d)', color: !targetData || !canAfford ? '#6b7280' : 'white', fontSize: '16px', fontWeight: 1000, cursor: 'pointer', boxShadow: canAfford ? '0 10px 35px rgba(236,72,153,0.35)' : 'none', transition: 'all 0.3s' }
      }, sending ? '...' : (lang === 'ar' ? '💍 تقديم العرض الآن' : '💍 Propose Now'))
    )
    )
    )
    );
  };

  window.ProposalModal = ProposalModal;
})();