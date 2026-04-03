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
    // UI State
    var [tab, setTab] = useState('feed'); // 'feed', 'proposals', 'divorce'
    var [loadingFeed, setLoadingFeed] = useState(false);
    var [couples, setCouples] = useState([]);
    var [coupleProfiles, setCoupleProfiles] = useState({});
    
    // Relationship Management
    var [divorceConfirm, setDivorceConfirm] = useState(false);
    var [divorcing, setDivorcing] = useState(false);

    // View Other Couples
    var [showViewCard, setShowViewCard] = useState(false);
    var [viewCouple, setViewCouple] = useState(null);
    var [viewSelf, setViewSelf] = useState(null);
    var [viewPartner, setViewPartner] = useState(null);

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
        var uids = docs.map((d) => d.uid1).filter((uid) => !proposerProfiles[uid]);
        if (uids.length > 0) {
          Promise.all(uids.map((uid) => window.usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null))).
          then((results) => {
            var map = { ...proposerProfiles };
            results.forEach((u) => {if (u) map[u.id] = u;});
            setProposerProfiles(map);
          });
        }
      });

      // Outgoing proposals
      var unsub2 = window.couplesCollection.
      where('uid1', '==', currentUID).
      where('status', '==', 'pending').
      onSnapshot((snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSentProposals(docs);
        // load target profiles
        var uids = docs.map((d) => d.uid2).filter((uid) => !proposerProfiles[uid]);
        if (uids.length > 0) {
          Promise.all(uids.map((uid) => window.usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null))).
          then((results) => {
            var map = { ...proposerProfiles };
            results.forEach((u) => {if (u) map[u.id] = u;});
            setProposerProfiles(map);
          });
        }
      });

      return () => { unsub1(); unsub2(); };
    }, [show, currentUID]);

    useEffect(() => {
      if (!show || tab !== 'feed') return;
      setLoadingFeed(true);
      var unsub = window.couplesCollection.
      where('status', '==', 'accepted').
      orderBy('marriageDate', 'desc').
      limit(30).
      onSnapshot(async (snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCouples(docs);
        var uids = new Set();
        docs.forEach((c) => {uids.add(c.uid1);uids.add(c.uid2);});
        var toLoad = [...uids].filter((uid) => !coupleProfiles[uid]);
        if (toLoad.length > 0) {
          var chunks = [];
          for (var i = 0; i < toLoad.length; i += 10) chunks.push(toLoad.slice(i, i + 10));
          var profiles = { ...coupleProfiles };
          await Promise.all(chunks.map(async (chunk) => {
            var s = await window.usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
            s.docs.forEach((d) => {profiles[d.id] = { id: d.id, ...d.data() };});
          }));
          setCoupleProfiles(profiles);
        }
        setLoadingFeed(false);
      }, () => setLoadingFeed(false));
      return () => unsub();
    }, [show, tab]);

    if (!show) return null;

    var ring = window.RINGS_DATA.find((r) => r.id === coupleData?.ringId) || window.RINGS_DATA[0];

    var handleOpenCouple = (c) => {
      var u1 = coupleProfiles[c.uid1];
      var u2 = coupleProfiles[c.uid2];
      if (!u1 || !u2) return;
      if (c.uid1 === currentUID || c.uid2 === currentUID) {
        onOpenCoupleCard && onOpenCoupleCard();
        return;
      }
      setViewCouple(c);setViewSelf(u1);setViewPartner(u2);
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
      React.createElement('button', { onClick: onClose, style: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', color: '#9ca3af', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '✕')
    ),
    /* Tabs */
    React.createElement('div', { style: { display: 'flex', gap: '10px', padding: '0 20px 18px', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' } },
      React.createElement('button', { onClick: onOpenPropose, style: { flexShrink: 0, padding: '12px 18px', borderRadius: '18px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', fontSize: '13px', fontWeight: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💍'), lang === 'ar' ? 'خطبة' : 'Propose'),
      React.createElement('button', { onClick: () => setTab('proposals'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'proposals' ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(236,72,153,0.08)', border: tab === 'proposals' ? 'none' : '1px solid rgba(236,72,153,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, 
        React.createElement('div', { style: { position: 'relative' } }, React.createElement('span', { style: { fontSize: '20px' } }, '📩'), pendingProposals.length > 0 && React.createElement('div', { style: { position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '2px solid #0d0d1a' } })),
        lang === 'ar' ? 'طلباتي' : 'Proposals'
      ),
      React.createElement('button', { onClick: () => setTab('feed'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'feed' ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(124,58,237,0.08)', border: tab === 'feed' ? 'none' : '1px solid rgba(124,58,237,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💒'), lang === 'ar' ? 'أفراح' : 'Weddings'),
      React.createElement('button', { onClick: () => setTab('divorce'), style: { flex: 1, minWidth: '90px', padding: '12px 10px', borderRadius: '18px', cursor: 'pointer', background: tab === 'divorce' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'rgba(59,130,246,0.08)', border: tab === 'divorce' ? 'none' : '1px solid rgba(59,130,246,0.2)', color: 'white', fontSize: '13px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, React.createElement('span', { style: { fontSize: '20px' } }, '💔'), lang === 'ar' ? 'طلاق' : 'Divorce')
    ),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '18px 20px' } },
      tab === 'feed' && (loadingFeed ? React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, '...') : 
        couples.length === 0 ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#6b7280' } }, lang === 'ar' ? 'لا توجد أفراح حالياً' : 'No marriages') :
        couples.map(c => {
          var p1 = coupleProfiles[c.uid1], p2 = coupleProfiles[c.uid2];
          var rItem = window.RINGS_DATA.find(r => r.id === c.ringId) || window.RINGS_DATA[0];
          return React.createElement('div', { key: c.id, onClick: () => handleOpenCouple(c), style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '20px', marginBottom: '14px', cursor: 'pointer' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '12px' } },
              React.createElement(Av, { user: p1, size: 50 }),
              React.createElement('span', { style: { fontSize: '22px' } }, rItem.emoji),
              React.createElement(Av, { user: p2, size: 50 })
            ),
            React.createElement('div', { style: { textAlign: 'center', fontSize: '14px', fontWeight: 800, color: 'white' } }, `${p1?.displayName || '—'} & ${p2?.displayName || '—'}`)
          );
        })
      ),
      tab === 'proposals' && React.createElement('div', null,
        pendingProposals.length === 0 && sentProposals.length === 0 ? React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, lang === 'ar' ? 'لا توجد طلبات' : 'No proposals') :
        pendingProposals.map(p => {
          var u = proposerProfiles[p.uid1];
          return React.createElement('div', { key: p.id, style: { background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '20px', padding: '16px', marginBottom: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } },
              React.createElement(Av, { user: u, size: 44 }),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { style: { color: 'white', fontWeight: 800, fontSize: '14px' } }, u?.displayName),
                React.createElement('div', { style: { color: '#fba0ca', fontSize: '11px' } }, lang === 'ar' ? 'يريد الارتباط بك!' : 'Wants to propose!')
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', { onClick: () => window.acceptProposal({ coupleDocId: p.id, uid1: p.uid1, uid2: p.uid2, lang, onNotification }), style: { flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontWeight: 800, cursor: 'pointer' } }, lang === 'ar' ? 'قبول' : 'Accept'),
              React.createElement('button', { onClick: () => window.declineProposal({ coupleDocId: p.id, fromUID: p.uid1, toUID: p.uid2, lang, onNotification }), style: { flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', fontWeight: 800, cursor: 'pointer' } }, lang === 'ar' ? 'رفض' : 'Decline')
            )
          );
        })
      ),
      tab === 'divorce' && (partnerData ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' } },
          React.createElement(Av, { user: currentUserData, size: 70 }),
          React.createElement('span', { style: { fontSize: '30px' } }, '💔'),
          React.createElement(Av, { user: partnerData, size: 70 })
        ),
        divorceConfirm ? React.createElement('div', { className: 'animate-pop', style: { padding: '20px', background: 'rgba(239,68,68,0.1)', borderRadius: '20px', border: '1px solid #ef4444' } },
          React.createElement('div', { style: { color: 'white', fontWeight: 800, marginBottom: '14px' } }, lang === 'ar' ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This action is permanent.'),
          React.createElement('div', { style: { display: 'flex', gap: '10px' } },
            React.createElement('button', { onClick: handleInternalDivorce, disabled: divorcing, style: { flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '14px', padding: '12px', fontWeight: 900 } }, lang === 'ar' ? 'نعم' : 'Yes'),
            React.createElement('button', { onClick: () => setDivorceConfirm(false), style: { flex: 1, background: 'gray', color: 'white', border: 'none', borderRadius: '14px', padding: '12px', fontWeight: 900 } }, lang === 'ar' ? 'تراجع' : 'No')
          )
        ) : React.createElement('button', { onClick: () => setDivorceConfirm(true), style: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '18px', padding: '14px 30px', fontWeight: 800, cursor: 'pointer' } }, lang === 'ar' ? 'طلب انفصال 💔' : 'Request Break up 💔')
      ) : React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, lang === 'ar' ? 'لست مرتبطاً' : 'Not married'))
    ),
    /* View Card Modal Overlay */
    showViewCard && viewCouple && viewSelf && viewPartner && React.createElement('div', {
      style: { position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
    },
    React.createElement('div', {
      className: 'animate-pop',
      style: { width: '100%', maxWidth: '360px', background: '#111128', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '32px', padding: '30px', textAlign: 'center', position: 'relative' }
    },
    React.createElement('button', { onClick: () => setShowViewCard(false), style: { position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'gray', fontSize: '20px' } }, '✕'),
    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' } },
      React.createElement(Av, { user: viewSelf, size: 66 }),
      React.createElement('span', { style: { fontSize: '24px' } }, '💍'),
      React.createElement(Av, { user: viewPartner, size: 66 })
    ),
    React.createElement('div', { style: { color: 'white', fontWeight: 900, fontSize: '18px', marginBottom: '8px' } }, `${viewSelf.displayName} & ${viewPartner.displayName}`),
    React.createElement('div', { style: { color: '#9ca3af', fontSize: '12px' } }, lang === 'ar' ? `متزوجان منذ ${viewCouple.marriageDate?.toDate ? viewCouple.marriageDate.toDate().toLocaleDateString('ar-EG') : '—'}` : `Married since ${viewCouple.marriageDate?.toDate ? viewCouple.marriageDate.toDate().toLocaleDateString() : '—'}`)
    )
    )
    )
    )
    );
  };

  window.WeddingHallModal = WeddingHallModal;
})();
