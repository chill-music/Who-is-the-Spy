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
    var [tab, setTab] = useState('feed'); // 'feed' | 'divorce' | 'proposals'
    var [couples, setCouples] = useState([]);
    var [loadingFeed, setLoadingFeed] = useState(true);
    var [coupleProfiles, setCoupleProfiles] = useState({}); // uid → userData
    var [viewCouple, setViewCouple] = useState(null);
    var [viewSelf, setViewSelf] = useState(null);
    var [viewPartner, setViewPartner] = useState(null);
    var [showViewCard, setShowViewCard] = useState(false);
    var [divorcing, setDivorcing] = useState(false);
    var [divorceConfirm, setDivorceConfirm] = useState(false);
    // Incoming proposals
    var [pendingProposals, setPendingProposals] = useState([]);
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
      return () => unsub1();
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

    var handleDivorce = async () => {
      if (!coupleData) return;
      setDivorcing(true);
      await window.divorceCouple({ coupleDocId: coupleData.id, uid1: coupleData.uid1, uid2: coupleData.uid2, onNotification, lang });
      setDivorcing(false);setDivorceConfirm(false);onClose();
    };

    var Av = ({ user, size = 44 }) => React.createElement('div', {
      style: { width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(236,72,153,0.4)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(size * 0.45) }
    }, user?.photoURL ? React.createElement('img', { src: user.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '😎');

    return React.createElement(window.PortalModal, null,
    React.createElement('div', {
      onClick: onClose,
      style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
    },
    React.createElement('div', {
      className: 'animate-pop',
      onClick: (e) => e.stopPropagation(),
      style: { width: '100%', maxWidth: '480px', height: '90vh', background: '#0d0d1a', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -10px 60px rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.15)', borderBottom: 'none' }
    },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '10px 0 4px' } }, React.createElement('div', { style: { width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' } })),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px', flexShrink: 0 } },
    React.createElement('div', null,
    React.createElement('div', { style: { fontSize: '16px', fontWeight: 900, color: 'white' } }, '💒 ' + (lang === 'ar' ? 'قاعة الأفراح' : 'Wedding Hall')),
    React.createElement('div', { style: { fontSize: '10px', color: '#f9a8d4', marginTop: '2px' } }, lang === 'ar' ? 'اكتشف الكابلز وأرسل طلبك' : 'Discover couples & send your proposal')
    ),
    React.createElement('button', { onClick: onClose, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px', color: '#9ca3af', fontSize: '18px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '✕')
    ),
    React.createElement('div', { style: { display: 'flex', gap: '10px', padding: '0 16px 14px', flexShrink: 0 } },
    React.createElement('button', { onClick: () => {onClose();setTimeout(() => onOpenPropose && onOpenPropose(), 50);}, style: { flex: 1, padding: '11px 6px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', fontSize: '12px', fontWeight: 800, boxShadow: '0 4px 16px rgba(236,72,153,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' } }, React.createElement('span', { style: { fontSize: '18px' } }, '💍'), lang === 'ar' ? 'خطبة' : 'Propose'),
    React.createElement('button', { onClick: () => setTab('proposals'), style: { flex: 1, padding: '11px 6px', borderRadius: '14px', cursor: 'pointer', background: tab === 'proposals' ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(236,72,153,0.12)', border: tab === 'proposals' ? 'none' : '1px solid rgba(236,72,153,0.3)', color: 'white', fontSize: '12px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative' } },
    React.createElement('div', { style: { position: 'relative', display: 'inline-block' } }, React.createElement('span', { style: { fontSize: '18px' } }, '📩'), pendingProposals.length > 0 && React.createElement('div', { style: { position: 'absolute', top: '-3px', right: '-3px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-ring 1.2s ease-in-out infinite' } })),
    lang === 'ar' ? 'طلباتي' : 'Proposals'
    ),
    React.createElement('button', { onClick: () => setTab('feed'), style: { flex: 1, padding: '11px 6px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: tab === 'feed' ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(124,58,237,0.15)', border: tab === 'feed' ? 'none' : '1px solid rgba(124,58,237,0.3)', color: 'white', fontSize: '12px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' } }, React.createElement('span', { style: { fontSize: '18px' } }, '💒'), lang === 'ar' ? 'أفراح' : 'Weddings'),
    React.createElement('button', { onClick: () => setTab('divorce'), style: { flex: 1, padding: '11px 6px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: tab === 'divorce' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'rgba(59,130,246,0.15)', border: tab === 'divorce' ? 'none' : '1px solid rgba(59,130,246,0.3)', color: 'white', fontSize: '12px', fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' } }, React.createElement('span', { style: { fontSize: '18px' } }, '💔'), lang === 'ar' ? 'طلاق' : 'Divorce')
    ),
    React.createElement('div', { style: { height: '1px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 } }),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '14px 16px' } },
    tab === 'feed' && couples.map((c) => {
      var u1 = coupleProfiles[c.uid1],u2 = coupleProfiles[c.uid2];
      var cRing = window.RINGS_DATA.find((r) => r.id === c.ringId) || window.RINGS_DATA[0];
      return React.createElement('div', { key: c.id, onClick: () => handleOpenCouple(c), style: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '14px 16px', cursor: 'pointer', marginBottom: '12px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } }, React.createElement('div', { style: { fontSize: '12px', fontWeight: 700, color: 'white' } }, `${u1?.displayName || '—'} & ${u2?.displayName || '—'}`), React.createElement('div', { style: { fontSize: '10px', color: '#6b7280' } }, fmtTime(c.marriageDate))),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' } }, React.createElement(Av, { user: u1, size: 48 }), React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' } }, React.createElement('div', { style: { height: '2px', width: '100%', background: `${cRing.color}40` } }), React.createElement('div', { style: { position: 'absolute', fontSize: '20px' } }, cRing.emoji)), React.createElement(Av, { user: u2, size: 48 }))
      );
    })
    )
    ))
    );
  };

  window.WeddingHallModal = WeddingHallModal;
})();