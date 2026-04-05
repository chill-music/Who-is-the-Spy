(function () {
  var { useState, useEffect, useRef, useMemo } = React;

  // ─────────────────────────────────────────────
  // 🤝 BFF MODAL — Full BFF management screen
  // ─────────────────────────────────────────────
  var BFFModal = ({
    show, onClose, lang,
    currentUID, currentUserData,
    onNotification,
    friendsData,
    coupleData,
    couplePartnerData
  }) => {
    // ── Late-binding: read from window at render time ──
    var PortalModal = window.PortalModal || (({ children }) => children);
    var getBFFLevel = window.getBFFLevel || (() => ({ level: 1, icon: '⭐', color: '#60a5fa', glow: 'rgba(96,165,250,0.3)', name_ar: '', name_en: '', pct: 0 }));
    var sendBFFRequest = window.sendBFFRequest || (() => Promise.resolve());
    var buyBFFExtraSlot = window.buyBFFExtraSlot || (() => Promise.resolve());
    var BFFRequestItem = window.BFFRequestItem || null;
    var BFFCardModal = window.BFFCardModal || null;

    var [tab, setTab] = useState('relationships'); // 'relationships' | 'requests' | 'send'
    var [myRelationships, setMyRelationships] = useState([]);
    var [pendingRequests, setPendingRequests] = useState([]);
    var [partnerProfiles, setPartnerProfiles] = useState({});
    var [requesterProfiles, setRequesterProfiles] = useState({});
    var [loading, setLoading] = useState(true);
    var [selectedToken, setSelectedToken] = useState(null);
    var [targetId, setTargetId] = useState('');
    var [targetData, setTargetData] = useState(null);
    var [searching, setSearching] = useState(false);
    var [searchErr, setSearchErr] = useState('');
    var [sending, setSending] = useState(false);
    var [buyingSlot, setBuyingSlot] = useState(false);
    var [viewCard, setViewCard] = useState(null);
    var [viewSelf, setViewSelf] = useState(null);
    var [viewPartner, setViewPartner] = useState(null);

    useEffect(() => {
      if (!show || !currentUID) return;
      setLoading(true);

      // ── Single-field queries only (no composite indexes needed) ──
      var unsub1 = bffCollection.
      where('uid1', '==', currentUID).
      onSnapshot((snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Filter active client-side
        var active = docs.filter((r) => r.status === 'active');
        setMyRelationships((prev) => {
          var other = prev.filter((r) => r.uid2 === currentUID);
          var merged = [...active, ...other];
          merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
          return merged;
        });
        setLoading(false);
      }, () => setLoading(false));

      var unsub2 = bffCollection.
      where('uid2', '==', currentUID).
      onSnapshot((snap) => {
        var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        var active = docs.filter((r) => r.status === 'active');
        var pending = docs.filter((r) => r.status === 'pending');
        setMyRelationships((prev) => {
          var other = prev.filter((r) => r.uid1 === currentUID);
          var merged = [...other, ...active];
          merged.sort((a, b) => (b.acceptedAt?.seconds || 0) - (a.acceptedAt?.seconds || 0));
          return merged;
        });
        setPendingRequests(pending);
        var toLoad = pending.map((d) => d.uid1).filter((uid) => !requesterProfiles[uid]);
        if (toLoad.length > 0) {
          Promise.all(toLoad.map((uid) =>
          usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
          )).then((results) => {
            var map = {};
            results.forEach((u) => {if (u) map[u.id] = u;});
            setRequesterProfiles((p) => ({ ...p, ...map }));
          });
        }
      }, () => {});

      return () => {unsub1();unsub2();};
    }, [show, currentUID]);

    // Load partner profiles
    useEffect(() => {
      if (!myRelationships.length) return;
      var toLoad = myRelationships.map((r) => r.uid1 === currentUID ? r.uid2 : r.uid1).filter((uid) => !partnerProfiles[uid]);
      if (!toLoad.length) return;
      Promise.all(toLoad.map((uid) =>
      usersCollection.doc(uid).get().then((d) => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
      )).then((results) => {
        var map = {};
        results.forEach((u) => {if (u) map[u.id] = u;});
        setPartnerProfiles((p) => ({ ...p, ...map }));
      });
    }, [myRelationships.length]);

    if (!show) return null;

    var extraSlots = currentUserData?.bffExtraSlots || 0;
    var maxSlots = BFF_CONFIG.freeSlots + extraSlots;
    var myTokens = currentUserData?.inventory?.bff_tokens || [];
    var currency = currentUserData?.currency || 0;

    var searchUser = async () => {
      if (!targetId.trim()) return;
      setSearching(true);setSearchErr('');setTargetData(null);
      try {
        var snap = await usersCollection.where('customId', '==', targetId.trim()).limit(1).get();
        if (snap.empty) {
          setSearchErr(lang === 'ar' ? 'لم يُعثر على المستخدم' : 'User not found');
        } else {
          var d = { id: snap.docs[0].id, ...snap.docs[0].data() };
          if (d.id === currentUID) {
            setSearchErr(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself');
          } else {setTargetData(d);}
        }
      } catch (e) {setSearchErr('Error');}
      setSearching(false);
    };

    var handleSend = async () => {
      if (!targetData || !selectedToken || sending) return;
      setSending(true);
      await sendBFFRequest({
        fromUID: currentUID, toUID: targetData.id,
        fromData: currentUserData, tokenId: selectedToken.id,
        onNotification, lang
      });
      setSending(false);
      setTab('relationships');
      setTargetData(null);setTargetId('');setSelectedToken(null);
    };

    var openCard = (rel) => {
      var partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
      var partner = partnerProfiles[partnerUID];
      if (!partner) return;
      setViewCard(rel);
      setViewSelf(currentUserData);
      setViewPartner(partner);
    };

    return (/*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", { onClick: onClose, style: {
          position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        } }, /*#__PURE__*/
      React.createElement("div", { className: "animate-pop", onClick: (e) => e.stopPropagation(), style: {
          width: '100%', maxWidth: '480px', height: '88vh',
          background: '#0d0d1a', borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 -10px 60px rgba(100,150,255,0.15)',
          border: '1px solid rgba(100,150,255,0.15)', borderBottom: 'none'
        } }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', justifyContent: 'center', padding: '10px 0 4px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' } })
      ), /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, color: 'white' } }, "❤️ ", lang === 'ar' ? 'BFF الخاص بي' : 'My BFF'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#a78bfa', marginTop: '2px' } },
      myRelationships.length, "/", maxSlots, " ", lang === 'ar' ? 'علاقات' : 'relationships'
      )
      ), /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: {
          background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px',
          color: '#9ca3af', fontSize: '18px', width: '34px', height: '34px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        } }, "✕")
      ), /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', gap: '8px', padding: '0 16px 12px', flexShrink: 0 } },
      [
      { id: 'relationships', label_ar: 'علاقاتي', label_en: 'My BFFs', icon: '🤝' },
      { id: 'requests', label_ar: 'طلبات', label_en: 'Requests', icon: '📩', badge: pendingRequests.length },
      { id: 'send', label_ar: 'إرسال', label_en: 'Send', icon: '➕' }].
      map((t) => /*#__PURE__*/
      React.createElement("button", { key: t.id, onClick: () => setTab(t.id), style: {
          flex: 1, padding: '9px 4px', borderRadius: '12px', cursor: 'pointer',
          background: tab === t.id ? 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))' : 'rgba(255,255,255,0.04)',
          border: tab === t.id ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
          color: tab === t.id ? '#e9d5ff' : '#6b7280',
          fontSize: '11px', fontWeight: 700, position: 'relative'
        } },
      t.icon, " ", lang === 'ar' ? t.label_ar : t.label_en,
      t.badge > 0 && /*#__PURE__*/
      React.createElement("span", { style: {
          position: 'absolute', top: '-4px', right: '-4px',
          background: '#ef4444', color: 'white', borderRadius: '50%',
          width: '16px', height: '16px', fontSize: '9px', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-ring 1.2s ease-in-out infinite'
        } }, t.badge)
      )
      )
      ), /*#__PURE__*/

      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '0 16px 16px' } },

      tab === 'relationships' && (
      loading ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, "⌛") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },

      coupleData && couplePartnerData && (() => {
        var ring = typeof RINGS_DATA !== 'undefined' ?
        RINGS_DATA.find((r) => r.id === coupleData.ringId) :
        null;
        var diff = coupleData?.marriageDate ?
        (() => {var s = coupleData.marriageDate.toDate ? coupleData.marriageDate.toDate() : new Date(coupleData.marriageDate.seconds * 1000);return Math.floor((Date.now() - s.getTime()) / 86400000);})() :
        0;
        // CP level from LOVE_LEVELS if available
        var cpLevel = 1;
        if (typeof LOVE_LEVELS !== 'undefined') {
          var lv = 1;
          for (var l of LOVE_LEVELS) {if (diff >= l.days) lv++;else break;}
          cpLevel = lv;
        }
        return (/*#__PURE__*/
          React.createElement("div", { style: {
              borderRadius: '16px', overflow: 'hidden',
              background: 'linear-gradient(135deg, #f9a8d4, #ec4899, #be185d)',
              padding: '14px 12px',
              position: 'relative'
            } }, /*#__PURE__*/

          React.createElement("div", { style: { position: 'absolute', top: 6, left: 10, fontSize: '10px', opacity: 0.6 } }, "✦"), /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', top: 8, right: 14, fontSize: '8px', opacity: 0.5 } }, "✦"), /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', bottom: 10, left: 20, fontSize: '7px', opacity: 0.4 } }, "✦"), /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', bottom: 8, right: 10, fontSize: '9px', opacity: 0.5 } }, "✦"), /*#__PURE__*/

          React.createElement("div", { style: { textAlign: 'center', marginBottom: '10px' } }, /*#__PURE__*/
          React.createElement("span", { style: {
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: '#fff', fontSize: '11px', fontWeight: 900,
              padding: '3px 14px', borderRadius: '20px',
              boxShadow: '0 2px 10px rgba(168,85,247,0.5)'
            } }, "CP LV", cpLevel)
          ), /*#__PURE__*/

          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' } }, /*#__PURE__*/

          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 } }, /*#__PURE__*/
          React.createElement("div", { style: {
              width: '60px', height: '60px', borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.7)',
              overflow: 'hidden', background: 'rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            } },
          currentUserData?.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: currentUserData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' } }, "😊")
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', maxWidth: '70px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          currentUserData?.displayName || '...'
          )
          ), /*#__PURE__*/

          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '32px', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.5))' } },
          ring?.imageURL ? /*#__PURE__*/
          React.createElement("img", { src: ring.imageURL, alt: "", style: { width: '38px', height: '38px', objectFit: 'contain' } }) :
          ring?.emoji || '💍'
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'center' } },
          lang === 'ar' ? `معاً ${diff} يوم` : `Be together ${diff} days`
          )
          ), /*#__PURE__*/

          React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 } }, /*#__PURE__*/
          React.createElement("div", { style: {
              width: '60px', height: '60px', borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.7)',
              overflow: 'hidden', background: 'rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            } },
          couplePartnerData?.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: couplePartnerData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' } }, "😊")
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', maxWidth: '70px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          couplePartnerData?.displayName || '...'
          )
          )
          )
          ));
      })(),

      myRelationships.length === 0 && !coupleData ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px 20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '48px', marginBottom: '12px' } }, "🤝"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', color: '#6b7280' } },
      lang === 'ar' ? 'لا علاقات بعد — أرسل طلب صداقة!' : 'No relationships yet — send a request!'
      )
      ) : /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px 10px'
        } },
      myRelationships.map((rel) => {
        var partnerUID = rel.uid1 === currentUID ? rel.uid2 : rel.uid1;
        var partner = partnerProfiles[partnerUID];
        var token = BFF_TOKEN_ITEMS.find((t) => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
        var lvInfo = getBFFLevel(rel.giftPoints || 0);
        return (/*#__PURE__*/
          React.createElement("div", {
            key: rel.id, onClick: () => openCard(rel),
            className: `shop-standard-item shop-rarity-${(token.rarity || 'Common').toLowerCase()}`,
            style: {
              height: '110px', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }
          }, /*#__PURE__*/

          React.createElement("div", { style: {
              position: 'absolute', top: '5px', left: '5px',
              background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}aa)`,
              borderRadius: '6px', padding: '1px 5px',
              fontSize: '8px', fontWeight: 900, color: '#000',
              display: 'flex', alignItems: 'center', gap: '2px',
              boxShadow: `0 2px 6px ${lvInfo.glow}`, zIndex: 2
            } }, /*#__PURE__*/
          React.createElement("span", null, lvInfo.icon), /*#__PURE__*/
          React.createElement("span", null, "LV", lvInfo.level)
          ), /*#__PURE__*/

          React.createElement("span", { style: { fontSize: '32px', zIndex: 1, filter: `drop-shadow(0 0 10px ${token.glow})` } },
          token.imageURL ? /*#__PURE__*/
          React.createElement("img", { src: token.imageURL, alt: "", style: { width: '36px', height: '36px', objectFit: 'contain' } }) :
          token.emoji
          ), /*#__PURE__*/

          React.createElement("div", { style: {
              position: 'absolute', bottom: '-15px',
              width: '32px', height: '32px', borderRadius: '50%',
              border: `2px solid ${lvInfo.color}`,
              overflow: 'hidden', background: '#0d0d1a',
              boxShadow: `0 2px 10px rgba(0,0,0,0.5), 0 0 6px ${lvInfo.glow}`,
              zIndex: 3
            } },
          partner?.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: partner.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "😎")
          )
          ));

      }),

      Array.from({ length: Math.max(0, maxSlots - myRelationships.length) }).map((_, i) => /*#__PURE__*/
      React.createElement("div", {
        key: `locked-${i}`,
        className: "shop-standard-item",
        style: { height: '110px', cursor: 'default', opacity: 0.3 }
      }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '24px' } }, "➕")
      )
      )
      ),

      React.createElement("button", { onClick: async () => {setBuyingSlot(true);await buyBFFExtraSlot({ uid: currentUID, userData: currentUserData, onNotification, lang });setBuyingSlot(false);},
        disabled: buyingSlot || currency < BFF_CONFIG.extraSlotCost,
        style: {
          width: '100%', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: currency >= BFF_CONFIG.extraSlotCost ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'rgba(255,255,255,0.05)',
          color: currency >= BFF_CONFIG.extraSlotCost ? 'white' : '#4b5563',
          fontSize: '11px', fontWeight: 700,
          marginTop: '14px'
        } },
      buyingSlot ? '⏳' : `+ ${lang === 'ar' ? 'فتح خانة جديدة' : 'Unlock New Slot'} (${BFF_CONFIG.extraSlotCost} 🧠)`
      )
      )),

      tab === 'requests' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      pendingRequests.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '12px' } }, "📩"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', color: '#6b7280' } },
      lang === 'ar' ? 'لا طلبات واردة' : 'No pending requests'
      )
      ) :
      pendingRequests.map((req) => /*#__PURE__*/
      React.createElement(BFFRequestItem, {
        key: req.id,
        bffDoc: req,
        fromData: requesterProfiles[req.uid1],
        lang: lang,
        onNotification: onNotification,
        onDone: () => {} }
      )
      )
      ),

      tab === 'send' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' } }, "🎫 ",
      lang === 'ar' ? 'توكناتي:' : 'My tokens:',
      myTokens.length === 0 && /*#__PURE__*/React.createElement("span", { style: { color: '#6b7280', fontWeight: 400, marginRight: '6px' } }, " (", lang === 'ar' ? 'لا توكنات — اشترِ من المتجر' : 'No tokens — buy from Shop', ")")
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
      BFF_TOKEN_ITEMS.filter((t) => myTokens.includes(t.id)).map((token) => /*#__PURE__*/
      React.createElement("button", { key: token.id, onClick: () => setSelectedToken(token), style: {
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
          background: selectedToken?.id === token.id ? `${token.color}25` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${selectedToken?.id === token.id ? token.color : 'rgba(255,255,255,0.1)'}`,
          color: selectedToken?.id === token.id ? token.color : '#9ca3af',
          fontSize: '11px', fontWeight: 700
        } }, /*#__PURE__*/
      React.createElement("span", null, token.emoji),
      lang === 'ar' ? token.name_ar : token.name_en
      )
      )
      )
      ),

      friendsData?.length > 0 && /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' } }, "👥 ",
      lang === 'ar' ? 'أصدقاؤك:' : 'Your Friends:'
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      friendsData.slice(0, 8).map((f) => {
        var fid = f.id || f.uid;
        var isSelected = targetData?.id === fid;
        return (/*#__PURE__*/
          React.createElement("button", { key: fid, onClick: () => {setTargetId(f.customId || '');setTargetData({ id: fid, ...f });setSearchErr('');}, style: {
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '6px 8px', borderRadius: '10px', cursor: 'pointer',
              border: `1px solid ${isSelected ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.1)'}`,
              background: isSelected ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
              minWidth: '52px'
            } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${isSelected ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.15)'}` } },
          f.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: f.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '100%', height: '100%', background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "😊")
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '8px', color: isSelected ? '#e9d5ff' : '#9ca3af', fontWeight: 700, maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          f.displayName || '?'
          )
          ));
      })
      )
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '8px' } }, "🔍 ",
      lang === 'ar' ? 'أو ابحث بالـ ID:' : 'Or search by ID:'
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
      React.createElement("input", { value: targetId, onChange: (e) => {setTargetId(e.target.value);setTargetData(null);setSearchErr('');},
        onKeyDown: (e) => e.key === 'Enter' && searchUser(),
        placeholder: lang === 'ar' ? 'الـ ID الرقمي...' : 'Numeric ID...',
        style: { flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.3)', color: 'white', fontSize: '13px', outline: 'none' } }), /*#__PURE__*/
      React.createElement("button", { onClick: searchUser, disabled: searching, style: {
          padding: '10px 14px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
          color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
        } }, searching ? '⏳' : lang === 'ar' ? 'بحث' : 'Find')
      ),
      searchErr && /*#__PURE__*/React.createElement("div", { style: { fontSize: '11px', color: '#f87171', marginTop: '6px' } }, searchErr),
      targetData && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', marginTop: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 } },
      targetData.photoURL ? /*#__PURE__*/
      React.createElement("img", { src: targetData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "😊")
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#4ade80' } }, targetData.displayName)
      )
      ), /*#__PURE__*/

      React.createElement("button", { onClick: handleSend, disabled: !selectedToken || !targetData || sending || myTokens.length === 0,
        style: {
          width: '100%', padding: '13px', borderRadius: '14px', border: 'none', cursor: 'pointer',
          background: selectedToken && targetData && !sending ?
          `linear-gradient(135deg,${selectedToken.color},${selectedToken.color}88)` :
          'rgba(255,255,255,0.06)',
          color: selectedToken && targetData ? '#000' : '#4b5563',
          fontSize: '13px', fontWeight: 800,
          boxShadow: selectedToken && targetData ? `0 4px 20px ${selectedToken?.glow}` : 'none'
        } },
      sending ? '⏳' : `🤝 ${lang === 'ar' ? 'إرسال طلب الصداقة' : 'Send Friendship Request'}`
      )
      )
      )
      )
      ),

      viewCard && /*#__PURE__*/
      React.createElement(BFFCardModal, {
        show: !!viewCard,
        onClose: () => {setViewCard(null);setViewSelf(null);setViewPartner(null);},
        bffDoc: viewCard,
        selfData: viewSelf,
        partnerData: viewPartner,
        currentUID: currentUID,
        lang: lang,
        onNotification: onNotification }
      )
      ));

  };

  // 🌍 Global Export
  window.BFFModal = BFFModal;
})();