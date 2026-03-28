(function() {
    var { useState, useEffect, useRef, useMemo } = React;

    // ─────────────────────────────────────────────
    // 📌 BFF STRIP — shown in profile above Guard
    // ─────────────────────────────────────────────
    var BFFStripProfile = ({
        targetUID, currentUID, currentUserData, lang,
        onNotification, friendsData,
        onOpenBFFModal,  // opens BFF modal from outside (for own profile)
    }) => {
        var [myRelationships, setMyRelationships] = useState([]);
        var [partnerProfiles, setPartnerProfiles] = useState({});
        var [targetData, setTargetData] = useState(null);
        var [showListModal, setShowListModal] = useState(false);
        // ✅ FIX 1: state to open card modal when ring image clicked
        var [cardModal, setCardModal] = useState(null); // { rel, self, partner }

        var isOwnProfile = targetUID === currentUID;

        useEffect(() => {
            if (!targetUID) return;
            // Single-field queries only — filter active client-side
            var unsub1 = bffCollection.where('uid1', '==', targetUID)
                .onSnapshot(snap => {
                    var active = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === 'active');
                    setMyRelationships(prev => {
                        var other = prev.filter(r => r.uid2 === targetUID);
                        return [...active, ...other];
                    });
                }, () => {});
            var unsub2 = bffCollection.where('uid2', '==', targetUID)
                .onSnapshot(snap => {
                    var active = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status === 'active');
                    setMyRelationships(prev => {
                        var other = prev.filter(r => r.uid1 === targetUID);
                        return [...other, ...active];
                    });
                }, () => {});

            // Load target data
            usersCollection.doc(targetUID).get().then(d => {
                if (d.exists) setTargetData({ id: d.id, ...d.data() });
            }).catch(() => {});

            return () => { unsub1(); unsub2(); };
        }, [targetUID]);

        // Load partner profiles
        useEffect(() => {
            if (!myRelationships.length) return;
            var partnerUIDs = myRelationships.map(r => r.uid1 === targetUID ? r.uid2 : r.uid1);
            var toLoad = partnerUIDs.filter(uid => !partnerProfiles[uid]);
            if (!toLoad.length) return;
            Promise.all(toLoad.map(uid =>
                usersCollection.doc(uid).get().then(d => d.exists ? { id: d.id, ...d.data() } : null).catch(() => null)
            )).then(results => {
                var map = {};
                results.forEach(u => { if (u) map[u.id] = u; });
                setPartnerProfiles(p => ({ ...p, ...map }));
            });
        }, [myRelationships.length]);

        if (!myRelationships.length && !isOwnProfile) return null;

        var handleClick = () => {
            if (isOwnProfile) {
                onOpenBFFModal && onOpenBFFModal();
            } else {
                if (myRelationships.length > 0) setShowListModal(true);
            }
        };

        // ✅ FIX 1: open card modal when token image clicked
        var handleTokenClick = (e, rel) => {
            e.stopPropagation();
            var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
            var partner = partnerProfiles[partnerUID];
            var self = targetData;
            if (partner) setCardModal({ rel, self, partner });
        };

        return (
            <>
                {/* ── BFF SECTION ── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(112,0,255,0.04))',
                    borderTop: '1px solid rgba(167,139,250,0.1)',
                    borderBottom: '1px solid rgba(167,139,250,0.1)',
                }}>
                    {/* Header row: BFF ❤️ [count] + arrow */}
                    <div
                        onClick={handleClick}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px 6px', cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                            userSelect: 'none',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#e5e7eb' }}>BFF</span>
                            <span style={{ fontSize: '13px' }}>❤️</span>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#f472b6' }}>{myRelationships.length}</span>
                            {isOwnProfile && (
                                <span style={{
                                    fontSize: '9px', fontWeight: 700, marginLeft: '4px',
                                    padding: '1px 6px', borderRadius: '5px',
                                    background: 'rgba(167,139,250,0.18)',
                                    border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa',
                                }}>
                                    {lang === 'ar' ? 'إدارة' : 'Manage'}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>›</span>
                    </div>

                    {/* 3 mini-cards row */}
                    {myRelationships.length > 0 ? (
                        <div style={{
                            display: 'flex', gap: '6px',
                            padding: '2px 10px 18px',
                        }}>
                            {myRelationships.slice(0, 3).map(rel => {
                                var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
                                var partner = partnerProfiles[partnerUID];
                                var token = BFF_TOKEN_ITEMS.find(t => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
                                var lvInfo = getBFFLevel(rel.giftPoints || 0);

                                return (
                                    <div key={rel.id}
                                        onClick={handleClick}
                                        style={{
                                            flex: 1,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            cursor: 'pointer',
                                            WebkitTapHighlightColor: 'transparent',
                                            // ✅ FIX 2: minimum touch target for mobile
                                            minHeight: '44px',
                                        }}
                                    >
                                        {/* Card body */}
                                        <div style={{
                                            width: '100%', height: '70px',
                                            borderRadius: '10px', position: 'relative',
                                            background: `linear-gradient(145deg, ${token.color}35, ${token.color}18)`,
                                            border: `1.5px solid ${token.color}55`,
                                            boxShadow: `0 2px 8px ${token.glow}35`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'visible',
                                        }}>
                                            {/* Diamond pattern overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0, borderRadius: '8px',
                                                background: `repeating-linear-gradient(45deg, ${token.color}0a 0, transparent 8px, ${token.color}04 8px, transparent 16px)`,
                                                pointerEvents: 'none', overflow: 'hidden',
                                            }} />

                                            {/* LV badge top-left — real earned level */}
                                            <div style={{
                                                position: 'absolute', top: '4px', left: '4px',
                                                background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}99)`,
                                                borderRadius: '4px', padding: '1px 4px',
                                                fontSize: '6px', fontWeight: 900, color: '#000',
                                                display: 'flex', alignItems: 'center', gap: '2px',
                                                zIndex: 2, boxShadow: `0 1px 5px ${lvInfo.glow}`,
                                            }}>
                                                <span>{lvInfo.icon}</span>
                                                <span>LV{lvInfo.level}</span>
                                            </div>

                                            {/* ✅ FIX 1: Token emoji/image — clicking opens BFFCardModal */}
                                            <span
                                                onClick={(e) => handleTokenClick(e, rel)}
                                                style={{
                                                    fontSize: '22px', zIndex: 1,
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    WebkitTapHighlightColor: 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    // ✅ FIX 2: bigger touch target on mobile
                                                    minWidth: '36px', minHeight: '36px',
                                                }}
                                            >
                                                {token.imageURL
                                                    ? <img src={token.imageURL} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                                    : token.emoji}
                                            </span>

                                            {/* Avatar at bottom (overlapping) */}
                                            <div style={{
                                                position: 'absolute', bottom: '-13px',
                                                width: '26px', height: '26px', borderRadius: '50%',
                                                border: `2px solid ${lvInfo.color}`,
                                                overflow: 'hidden', background: '#0d0d1a',
                                                boxShadow: `0 1px 6px rgba(0,0,0,0.6), 0 0 4px ${lvInfo.glow}`,
                                                zIndex: 3,
                                            }}>
                                                {partner?.photoURL
                                                    ? <img src={partner.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>😎</div>}
                                            </div>
                                        </div>

                                        {/* Name below card */}
                                        <div style={{
                                            marginTop: '16px',
                                            fontSize: '9px', fontWeight: 600,
                                            color: '#9ca3af', textAlign: 'center',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            width: '100%',
                                        }}>
                                            {partner?.displayName || '...'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : isOwnProfile ? (
                        <div onClick={handleClick} style={{
                            padding: '8px 14px 14px', cursor: 'pointer',
                            textAlign: 'center', fontSize: '11px', color: '#6b7280',
                            WebkitTapHighlightColor: 'transparent',
                        }}>
                            {lang === 'ar' ? '+ أضف علاقة BFF' : '+ Add BFF Relationship'}
                        </div>
                    ) : null}
                </div>

                {/* Full list modal for non-own profiles */}
                {!isOwnProfile && showListModal && (
                    <BFFProfileListModal
                        show={showListModal}
                        onClose={() => setShowListModal(false)}
                        relationships={myRelationships}
                        partnerProfiles={partnerProfiles}
                        targetUID={targetUID}
                        lang={lang}
                    />
                )}

                {/* ✅ FIX 1: BFF card modal opened when ring image is clicked */}
                {cardModal && (
                    <BFFCardModal
                        show={!!cardModal}
                        onClose={() => setCardModal(null)}
                        bffDoc={cardModal.rel}
                        selfData={cardModal.self}
                        partnerData={cardModal.partner}
                        currentUID={targetUID}
                        lang={lang}
                        onNotification={onNotification}
                        viewOnly={true}
                    />
                )}
            </>
        );
    };

    // 🌍 Global Export
    window.BFFStripProfile = BFFStripProfile;
})();
