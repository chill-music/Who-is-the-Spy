(function () {
  var { useState, useEffect } = React;

  var WeddingHallModal = ({
    show, onClose, lang,
    currentUID, currentUserData, coupleData, partnerData,
    onOpenPropose, // opens ring shop
    onOpenCoupleCard, // opens couple card
    onDivorce, // calls divorceCouple
    onNotification
  }) => {
    // Incoming proposals
    var [pendingProposals, setPendingProposals] = useState([]);
    var [sentProposals, setSentProposals] = useState([]);
    var [proposerProfiles, setProposerProfiles] = useState({});

    // Listen for pending proposals sent TO this user
    useEffect(() => {
      if (!show || !currentUID) return;
      var unsub1 = window.couplesCollection.
      where('uid2', '==', currentUID).
      where('status', '==', 'pending').
      onSnapshot((snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPendingProposals(docs);
        // load proposer profiles
        var toLoad = docs.map((d) => d.uid1).filter((uid) => !proposerProfiles[uid]);
        if (toLoad.length > 0) {
          Promise.all(toLoad.map((uid) => window.usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null))).
          then((results) => {
            var map = { ...proposerProfiles };
            results.forEach((u) => {if (u) map[u.id] = u;});
            setProposerProfiles(map);
          });
        }
      }, () => {});

      // Outgoing proposals
      var unsub2 = window.couplesCollection.
      where('uid1', '==', currentUID).
      where('status', '==', 'pending').
      onSnapshot((snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSentProposals(docs);
        // load target profiles
        var toLoad = docs.map((d) => d.uid2).filter((uid) => !proposerProfiles[uid]);
        if (toLoad.length > 0) {
          Promise.all(toLoad.map((uid) => window.usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null))).
          then((results) => {
            var map = { ...proposerProfiles };
            results.forEach((u) => {if (u) map[u.id] = u;});
            setProposerProfiles(map);
          });
        }
      }, () => {});

      return () => { unsub1(); unsub2(); };
    }, [show, currentUID]);

    useEffect(() => {
      if (!show) return;
      setLoadingFeed(true);
      var unsub = window.couplesCollection.
      where('status', '==', 'accepted').
      orderBy('marriageDate', 'desc').
      limit(30).
      onSnapshot(async (snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCouples(docs);
        // Batch-load all user profiles not yet cached
        var uids = new Set();
        docs.forEach((c) => {uids.add(c.uid1);uids.add(c.uid2);});
        var toLoad = [...uids].filter((uid) => !coupleProfiles[uid]);
        if (toLoad.length > 0) {
          var chunks = [];
          for (var i = 0; i < toLoad.length; i += 10) chunks.push(toLoad.slice(i, i + 10));
          var profiles = { ...coupleProfiles };
          await Promise.all(chunks.map(async (chunk) => {
            var snap = await window.usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
            snap.docs.forEach((d) => {profiles[d.id] = { id: d.id, ...d.data() };});
          }));
          setCoupleProfiles(profiles);
        }
        setLoadingFeed(false);
      }, () => setLoadingFeed(false));
      return () => unsub();
    }, [show]);

    if (!show) return null;

    var ring = window.RINGS_DATA.find((r) => r.id === coupleData?.ringId) || window.RINGS_DATA[0];

    var fmtTime = (ts) => {
      if (!ts) return '';
      var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    var handleOpenCouple = (coupleDoc) => {
      var u1 = coupleProfiles[coupleDoc.uid1];
      var u2 = coupleProfiles[coupleDoc.uid2];
      if (!u1 || !u2) return;
      if (coupleDoc.uid1 === currentUID || coupleDoc.uid2 === currentUID) {
        onOpenCoupleCard && onOpenCoupleCard();
        return;
      }
      setViewCouple(coupleDoc);setViewSelf(u1);setViewPartner(u2);
      setShowViewCard(true);
    };

    var handleInternalDivorce = async () => {
      if (!coupleData) return;
      setDivorcing(true);
      try {
        await onDivorce(coupleData);
        setDivorceConfirm(false);
        onClose();
      } catch (e) {
        console.error("Divorce failed", e);
      } finally {
        setDivorcing(false);
      }
    };

    var Av = ({ user, size = 44 }) => React.createElement('div', {
      style: { width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(236,72,153,0.4)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(size * 0.45), position: 'relative' }
    },
    user?.photoURL ? React.createElement('img', { src: user.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '😎',
    user?.isVIP && React.createElement('div', { style: { position: 'absolute', inset: 0, border: '2px solid gold', borderRadius: '50%', pointerEvents: 'none' } })
    );

    return React.createElement(window.PortalModal, null,
    React.createElement('div', {
      onClick: onClose,
      style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4, background: 'rgba(5,5,15,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
    React.createElement('div', {
      className: 'animate-pop',
      onClick: (e) => e.stopPropagation(),
      style: { width: '100%', maxWidth: '480px', height: '90vh', background: 'linear-gradient(180deg, #111128 0%, #080815 100%)', borderRadius: '32px 32px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -20px 80px rgba(236,72,153,0.25)', border: '1px solid rgba(236,72,153,0.2)', borderBottom: 'none' }
    },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '12px 0 6px' } }, React.createElement('div', { style: { width: '44px', height: '5px', borderRadius: '5px', background: 'rgba(255,255,255,0.12)' } })),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 18px', flexShrink: 0 } },
    React.createElement('div', null,
    React.createElement('div', { style: { fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '0.5px', textShadow: '0 0 15px rgba(236,72,153,0.4)' } }, '💒 ' + (lang === 'ar' ? 'قاعة الأفراح' : 'Wedding Hall')),
    React.createElement('div', { style: { fontSize: '11px', color: '#fba0ca', marginTop: '4px', opacity: 0.9, fontWeight: 600 } }, lang === 'ar' ? 'اكتشف الكابلز وأرسل طلبك' : 'Discover couples & send your proposal')
    ),
    React.createElement('button', { onClick: onClose, style: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', color: '#9ca3af', fontSize: '18px', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' } }, '✕')
    ),
    React.createElement('div', { style: { display: 'flex', gap: '10px', padding: '0 20px 18px', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' } },
    React.createElement('button', { onClick: () => onOpenPropose && onOpenPropose(), style: { flexShrink: 0, padding: '12px 18px', borderRadius: '18px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ec4899 0%,#be185d 100%)', color: 'white', fontSize: '13px', fontWeight: 900, boxShadow: '0 6px 20px rgba(236,72,153,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💍'), lang === 'ar' ? 'خطبة' : 'Propose'),
    React.createElement('button', { onClick: () => setTab('proposals'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'proposals' ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(236,72,153,0.08)', border: tab === 'proposals' ? 'none' : '1px solid rgba(236,72,153,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative', transition: 'all 0.2s' } },
    React.createElement('div', { style: { position: 'relative', display: 'inline-block' } }, React.createElement('span', { style: { fontSize: '20px' } }, '📩'), pendingProposals.length > 0 && React.createElement('div', { style: { position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '2px solid #0d0d1a', animation: 'pulse-ring 1.2s ease-in-out infinite' } })),
    lang === 'ar' ? 'طلباتي' : 'Proposals'
    ),
    React.createElement('button', { onClick: () => setTab('feed'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'feed' ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(124,58,237,0.08)', border: tab === 'feed' ? 'none' : '1px solid rgba(124,58,237,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💒'), lang === 'ar' ? 'أفراح' : 'Weddings'),
    React.createElement('button', { onClick: () => setTab('divorce'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'divorce' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'rgba(59,130,246,0.08)', border: tab === 'divorce' ? 'none' : '1px solid rgba(59,130,246,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💔'), lang === 'ar' ? 'طلقني' : 'Divorce')
    ),
    React.createElement('div', { style: { height: '1px', background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.2), transparent)', flexShrink: 0 } }),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' } },
    tab === 'feed' && (loadingFeed ? React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : 
      couples.length === 0 ? React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px' } }, React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px', opacity: 0.5 } }, '🕯️'), React.createElement('div', { style: { color: '#6b7280', fontSize: '14px', fontWeight: 600 } }, lang === 'ar' ? 'لا يوجد متزوجين حالياً' : 'No marriages yet'), React.createElement('div', { style: { color: '#4b5563', fontSize: '12px', marginTop: '4px' } }, lang === 'ar' ? 'كن أول من يعقد قرانه!' : 'Be the first to tie the knot!')) :
      couples.map((c) => {
        var u1 = coupleProfiles[c.uid1],u2 = coupleProfiles[c.uid2];
        var cRing = window.RINGS_DATA.find((r) => r.id === c.ringId) || window.RINGS_DATA[0];
        return React.createElement('div', { key: c.id, onClick: () => handleOpenCouple(c), style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'transform 0.2s' } },
          React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, transparent, ${cRing.color}, transparent)`, opacity: 0.6 } }),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' } }, 
            React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' } }, 
              React.createElement('span', { style: { color: '#7c3aed' } }, '✨'),
              `${u1?.displayName || '—'} & ${u2?.displayName || '—'}`
            ), 
            React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '8px' } }, fmtTime(c.marriageDate))
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' } }, 
            React.createElement(Av, { user: u1, size: 56 }), 
            React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' } }, 
              React.createElement('div', { style: { height: '3px', width: '100%', background: `linear-gradient(90deg, transparent, ${cRing.color}80, transparent)`, borderRadius: '3px' } }), 
              React.createElement('div', { style: { position: 'absolute', background: '#0d0d1a', padding: '8px', borderRadius: '50%', border: `2px solid ${cRing.color}40`, boxShadow: `0 0 20px ${cRing.color}30` } }, 
                React.createElement('div', { style: { fontSize: '26px', filter: `drop-shadow(0 0 10px ${cRing.color})` } }, cRing.emoji)
              )
            ), 
            React.createElement(Av, { user: u2, size: 56 })
          )
        );
      })
    ),

    tab === 'proposals' && React.createElement(React.Fragment, null,
      React.createElement('div', { style: { color: 'white', fontSize: '15px', fontWeight: 900, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' } }, 
        React.createElement('span', { style: { color: '#ec4899' } }, '↓'), 
        lang === 'ar' ? 'طلبات واردة' : 'Incoming Proposals'
      ),
      pendingProposals.length === 0 ? React.createElement('div', { style: { padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', color: '#4b5563', fontSize: '13px' } }, lang === 'ar' ? 'لا توجد طلبات واردة حالياً' : 'No incoming requests yet') :
      pendingProposals.map(p => {
        var sender = proposerProfiles[p.uid1];
        var pRing = window.RINGS_DATA.find(r => r.id === p.ringId) || window.RINGS_DATA[0];
        return React.createElement('div', { key: p.id, className: 'animate-pop', style: { background: 'rgba(236,72,153,0.08)', backdropFilter: 'blur(5px)', border: '1px solid rgba(236,72,153,0.25)', borderRadius: '20px', padding: '16px', marginBottom: '12px', boxShadow: '0 8px 32px rgba(236,72,153,0.1)' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' } },
            React.createElement(Av, { user: sender, size: 50 }),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: '14px', fontWeight: 900, color: 'white' } }, sender?.displayName || '—'),
              React.createElement('div', { style: { fontSize: '12px', color: '#ec4899', fontWeight: 700, marginTop: '2px' } }, (lang === 'ar' ? 'مغامرة بالحب مع ' : 'Marry me with ') + pRing.emoji + ' ' + (lang === 'ar' ? pRing.nameAr : pRing.name))
            )
          ),
          p.message && React.createElement('div', { style: { background: 'rgba(5,5,15,0.4)', padding: '12px 14px', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '14px', borderLeft: '3px solid #ec4899' } }, `"${p.message}"`),
          React.createElement('div', { style: { display: 'flex', gap: '10px' } },
            React.createElement('button', { onClick: () => window.handleAcceptProposal?.(p), style: { flex: 1, padding: '12px', borderRadius: '14px', background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', border: 'none', fontWeight: 900, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' } }, lang === 'ar' ? 'قبلت' : 'Accept'),
            React.createElement('button', { onClick: () => window.handleDeclineProposal?.(p), style: { flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, fontSize: '13px', cursor: 'pointer' } }, lang === 'ar' ? 'رفض' : 'Decline')
          )
        );
      }),
      React.createElement('div', { style: { color: 'white', fontSize: '15px', fontWeight: 900, margin: '24px 0 12px', display: 'flex', alignItems: 'center', gap: '8px' } }, 
        React.createElement('span', { style: { color: '#3b82f6' } }, '↑'), 
        lang === 'ar' ? 'طلبات مرسلة' : 'Sent Proposals'
      ),
      sentProposals.length === 0 ? React.createElement('div', { style: { padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', color: '#4b5563', fontSize: '13px' } }, lang === 'ar' ? 'لم تقم بإرسال أي طلبات' : 'No outgoing proposals') :
      sentProposals.map(p => {
        var target = proposerProfiles[p.uid2];
        return React.createElement('div', { key: p.id, style: { background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '18px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement(Av, { user: target, size: 40 }),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: 'white' } }, target?.displayName || '—'),
            React.createElement('div', { style: { fontSize: '11px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' } }, React.createElement('span', { className: 'animate-pulse' }, '●'), lang === 'ar' ? 'في انتظار القبول...' : 'Waiting for response...')
          )
        );
      })
    ),

    tab === 'divorce' && React.createElement(React.Fragment, null,
      !coupleData ? React.createElement('div', { style: { textAlign: 'center', padding: '60px 20px' } }, React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px', opacity: 0.5 } }, '🕊️'), React.createElement('div', { style: { color: '#6b7280', fontSize: '14px', fontWeight: 600 } }, lang === 'ar' ? 'أنت غير متزوج حالياً' : 'You are not married'), React.createElement('div', { style: { color: '#4b5563', fontSize: '12px', marginTop: '4px' } }, lang === 'ar' ? 'اعثر على شريك حياة في القبيلة!' : 'Find a partner in your family!')) :
      React.createElement('div', { className: 'animate-pop', style: { textAlign: 'center', padding: '10px 0' } },
        React.createElement('div', { style: { position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '30px', marginBottom: '36px' } },
          React.createElement('div', { style: { position: 'relative' } }, 
            React.createElement(Av, { user: currentUserData, size: 90 }),
            React.createElement('div', { style: { position: 'absolute', bottom: '-4px', right: '-4px', background: '#0d0d1a', borderRadius: '50%', padding: '4px' } }, '👤')
          ),
          React.createElement('div', { style: { zIndex: 1, background: '#0d0d1a', padding: '14px', borderRadius: '50%', border: `2px solid ${ring.color}`, boxShadow: `0 0 30px ${ring.color}40`, animation: 'bounce-light 3s ease-in-out infinite' } }, 
            React.createElement('div', { style: { fontSize: '38px', filter: `drop-shadow(0 0 12px ${ring.color})` } }, ring.emoji)
          ),
          React.createElement('div', { style: { position: 'relative' } }, 
            React.createElement(Av, { user: partnerData, size: 90 }),
            React.createElement('div', { style: { position: 'absolute', bottom: '-4px', right: '-4px', background: '#0d0d1a', borderRadius: '50%', padding: '4px' } }, '❤️')
          )
        ),
        React.createElement('div', { style: { fontSize: '22px', fontWeight: 950, color: 'white', marginBottom: '8px', letterSpacing: '0.3px' } }, `${currentUserData?.displayName || '—'} & ${partnerData?.displayName || '—'}`),
        React.createElement('div', { style: { color: ring.color, fontSize: '13px', fontWeight: 800, marginBottom: '24px', opacity: 0.9 } }, ring.emoji + ' ' + (lang === 'ar' ? ring.nameAr : ring.name)),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '20px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.06)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' } }, React.createElement('span', { style: { color: '#9ca3af' } }, lang === 'ar' ? 'تاريخ الزواج' : 'Married date'), React.createElement('span', { style: { color: 'white', fontWeight: 700 } }, coupleData?.marriageDate?.toDate ? coupleData.marriageDate.toDate().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—')),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' } }, React.createElement('span', { style: { color: '#9ca3af' } }, lang === 'ar' ? 'نوع الخاتم' : 'Ring Type'), React.createElement('span', { style: { color: ring.color, fontWeight: 700 } }, lang === 'ar' ? ring.nameAr : ring.name))
        ),

        divorceConfirm ? React.createElement('div', { className: 'animate-pop', style: { padding: '24px', background: 'rgba(239,68,68,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px', boxShadow: '0 12px 40px rgba(239,68,68,0.15)' } },
          React.createElement('div', { style: { fontSize: '16px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' } }, lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'),
          React.createElement('div', { style: { fontSize: '12px', color: '#fca5a5', marginBottom: '20px', lineHeight: 1.5 } }, lang === 'ar' ? 'سيتم إنهاء العلاقة وحذف سجل الزواج بشكل نهائي.' : 'The relationship will end and the marriage record will be permanently deleted.'),
          React.createElement('div', { style: { display: 'flex', gap: '12px' } },
            React.createElement('button', { onClick: handleInternalDivorce, disabled: divorcing, style: { flex: 1, padding: '14px', borderRadius: '16px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 900, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' } }, divorcing ? '...' : (lang === 'ar' ? 'نعم، انفصال' : 'Yes, Break up')),
            React.createElement('button', { onClick: () => setDivorceConfirm(false), style: { flex: 1, padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, fontSize: '14px', cursor: 'pointer' } }, lang === 'ar' ? 'تراجع' : 'Cancel')
          )
        ) :
        React.createElement('button', { onClick: () => setDivorceConfirm(true), style: { padding: '16px 48px', borderRadius: '20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' } }, lang === 'ar' ? '💔 طلب انفصال' : '💔 Request Break up')
      )
    )
    )
    ))
    );
  };

  window.WeddingHallModal = WeddingHallModal;
})();
