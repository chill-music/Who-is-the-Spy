(function() {
    var { useState, useEffect, useRef, useMemo } = React;

    // ─────────────────────────────────────────────
    // 👁️ BFF CARD MODAL — shows when clicking BFF strip
    // ─────────────────────────────────────────────
    var BFFCardModal = ({ show, onClose, bffDoc, selfData, partnerData, currentUID, lang, onNotification, viewOnly = false }) => {
        var [ending, setEnding] = useState(false);
        var [confirmEnd, setConfirmEnd] = useState(false);

        if (!show || !bffDoc) return null;
        var token = BFF_TOKEN_ITEMS.find(t => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];
        var isMyRelationship = bffDoc.uid1 === currentUID || bffDoc.uid2 === currentUID;
        var other = bffDoc.uid1 === currentUID ? partnerData : selfData;
        var me = bffDoc.uid1 === currentUID ? selfData : partnerData;

        // Level info
        var lvInfo = getBFFLevel(bffDoc.giftPoints || 0);
        var levelColors = ['#60a5fa','#4ade80','#f59e0b','#a78bfa','#ffd700','#f0abfc'];
        var levelColor = levelColors[(lvInfo.level - 1)] || '#60a5fa';

        var handleEnd = async () => {
            setEnding(true);
            await endBFFRelationship({ bffDocId: bffDoc.id, onNotification, lang });
            setEnding(false);
            setConfirmEnd(false);
            onClose();
        };

        // Stars row
        var StarsRow = ({ count, color }) => (
            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} style={{
                        fontSize: '11px',
                        filter: i < count ? `drop-shadow(0 0 4px ${color})` : 'none',
                        opacity: i < count ? 1 : 0.2,
                    }}>★</span>
                ))}
            </div>
        );

        return (
            <PortalModal>
                <div onClick={onClose} style={{
                    position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 5,
                    background: 'rgba(0,0,0,0.88)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
                }}>
                    <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                        width: '100%', maxWidth: '360px',
                        background: 'linear-gradient(160deg,#0c0018,#110a22)',
                        borderRadius: '26px', overflow: 'hidden',
                        boxShadow: `0 0 80px ${lvInfo.glow}, 0 30px 80px rgba(0,0,0,0.9)`,
                        border: `1.5px solid ${lvInfo.color}50`,
                    }}>

                        {/* ── Top gradient header ── */}
                        <div style={{
                            padding: '18px 18px 14px',
                            background: `linear-gradient(135deg,${lvInfo.color}28,${lvInfo.color}10,transparent)`,
                            borderBottom: `1px solid ${lvInfo.color}28`,
                            position: 'relative', overflow: 'hidden',
                        }}>
                            {/* glow blob */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: lvInfo.glow, filter: 'blur(50px)', pointerEvents: 'none', opacity: 0.5 }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {/* Level badge */}
                                    <div style={{
                                        width: '46px', height: '46px', borderRadius: '14px',
                                        background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}88)`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 4px 16px ${lvInfo.glow}`,
                                        flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#000', letterSpacing: '0.5px' }}>LV</span>
                                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#000', lineHeight: 1 }}>{lvInfo.level}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                                            {lang === 'ar' ? lvInfo.name_ar : lvInfo.name_en}
                                        </div>
                                        <div style={{ fontSize: '10px', color: lvInfo.color, fontWeight: 700, marginTop: '2px' }}>
                                            {token.emoji} {lang === 'ar' ? token.name_ar : token.name_en}
                                        </div>
                                        <StarsRow count={lvInfo.level} color={lvInfo.color} />
                                    </div>
                                </div>
                                <button onClick={onClose} style={{
                                    background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '9px',
                                    color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>✕</button>
                            </div>
                        </div>

                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                            {/* ── Relationship Card ── */}
                            <div style={{
                                borderRadius: '18px', overflow: 'hidden', position: 'relative',
                                background: `linear-gradient(145deg,${token.color}35,${token.color}15)`,
                                border: `1.5px solid ${token.color}60`,
                                boxShadow: `0 0 24px ${token.glow}55`,
                                padding: '20px 14px 14px',
                            }}>
                                {/* Pattern overlay */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: `repeating-linear-gradient(45deg, ${token.color}07 0, transparent 12px, ${token.color}04 12px, transparent 24px)`,
                                    pointerEvents: 'none',
                                }} />

                                {/* Decorative glow top */}
                                <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', background: token.glow, filter: 'blur(20px)', opacity: 0.45, pointerEvents: 'none' }} />

                                {/* Avatars row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                    {/* Left avatar */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
                                            border: `3px solid ${token.color}`,
                                            boxShadow: `0 0 18px ${token.glow}`,
                                        }}>
                                            {me?.photoURL
                                                ? <img src={me.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                                            {me?.displayName || '—'}
                                        </span>
                                    </div>

                                    {/* Center: token icon + level icon */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ fontSize: '32px', filter: `drop-shadow(0 0 14px ${token.glow})`, animation: 'float 2.2s ease-in-out infinite' }}>
                                            {token.imageURL
                                                ? <img src={token.imageURL} alt="" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                                                : token.emoji}
                                        </div>
                                        <div style={{
                                            background: `linear-gradient(135deg,${lvInfo.color},${lvInfo.color}88)`,
                                            color: '#000', fontSize: '8px', fontWeight: 900,
                                            padding: '2px 7px', borderRadius: '10px',
                                            boxShadow: `0 2px 8px ${lvInfo.glow}`,
                                        }}>LV{lvInfo.level} {lvInfo.icon}</div>
                                    </div>

                                    {/* Right avatar */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden',
                                            border: `3px solid ${token.color}`,
                                            boxShadow: `0 0 18px ${token.glow}`,
                                        }}>
                                            {other?.photoURL
                                                ? <img src={other.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>😎</div>}
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                                            {other?.displayName || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Level Progress ── */}
                            <div style={{
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${lvInfo.color}30`,
                                padding: '12px 14px',
                            }}>
                                {/* Level row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '15px' }}>{lvInfo.icon}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: lvInfo.color }}>
                                            {lang === 'ar' ? `المستوى ${lvInfo.level}` : `Level ${lvInfo.level}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                            {(bffDoc.giftPoints || 0).toLocaleString()}
                                        </span>
                                        {lvInfo.nextMinPts && (
                                            <span style={{ fontSize: '10px', color: '#4b5563' }}>
                                                / {lvInfo.nextMinPts.toLocaleString()} ⭐
                                            </span>
                                        )}
                                        {!lvInfo.nextMinPts && (
                                            <span style={{ fontSize: '10px', color: lvInfo.color, fontWeight: 700 }}>MAX</span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{
                                    height: '8px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.07)',
                                    overflow: 'hidden', marginBottom: '8px',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${lvInfo.pct}%`,
                                        borderRadius: '8px',
                                        background: `linear-gradient(90deg, ${lvInfo.color}99, ${lvInfo.color})`,
                                        boxShadow: `0 0 8px ${lvInfo.glow}`,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>

                                {/* All level milestones */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    {BFF_LEVELS.map(l => {
                                        var reached = (bffDoc.giftPoints || 0) >= l.minPts;
                                        var isCurrent = l.level === lvInfo.level;
                                        return (
                                            <div key={l.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <div style={{
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    background: reached
                                                        ? `linear-gradient(135deg,${l.color},${l.color}88)`
                                                        : 'rgba(255,255,255,0.06)',
                                                    border: isCurrent
                                                        ? `2px solid ${l.color}`
                                                        : `1.5px solid ${reached ? l.color + '60' : 'rgba(255,255,255,0.1)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px',
                                                    boxShadow: isCurrent ? `0 0 8px ${l.glow}` : 'none',
                                                }}>
                                                    {reached ? l.icon : <span style={{ fontSize: '8px', color: '#374151', fontWeight: 800 }}>{l.level}</span>}
                                                </div>
                                                <span style={{ fontSize: '6px', color: reached ? l.color : '#374151', fontWeight: 700 }}>LV{l.level}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Next level hint */}
                                {lvInfo.nextMinPts && (
                                    <div style={{ marginTop: '8px', fontSize: '9px', color: '#4b5563', textAlign: 'center' }}>
                                        {lang === 'ar'
                                            ? `🎁 تحتاج ${(lvInfo.nextMinPts - (bffDoc.giftPoints || 0)).toLocaleString()} نقطة للمستوى التالي`
                                            : `🎁 ${(lvInfo.nextMinPts - (bffDoc.giftPoints || 0)).toLocaleString()} pts needed for next level`}
                                    </div>
                                )}
                            </div>

                            {/* End relationship button */}
                            {!viewOnly && isMyRelationship && (
                                <div>
                                    {!confirmEnd
                                        ? <button onClick={() => setConfirmEnd(true)} style={{
                                            width: '100%', padding: '11px', borderRadius: '12px',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            background: 'rgba(239,68,68,0.08)',
                                            color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                        }}>💔 {lang === 'ar' ? 'إنهاء العلاقة' : 'End Relationship'}</button>
                                        : <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setConfirmEnd(false)} style={{
                                                flex: 1, padding: '10px', borderRadius: '11px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.05)', color: '#9ca3af',
                                                fontSize: '12px', cursor: 'pointer',
                                            }}>{lang === 'ar' ? 'تراجع' : 'Cancel'}</button>
                                            <button onClick={handleEnd} disabled={ending} style={{
                                                flex: 1, padding: '10px', borderRadius: '11px', border: 'none',
                                                background: 'rgba(239,68,68,0.7)', color: 'white',
                                                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                            }}>{ending ? '⏳' : (lang === 'ar' ? '💔 تأكيد' : '💔 Confirm')}</button>
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PortalModal>
        );
    };

    // 🌍 Global Export
    window.BFFCardModal = BFFCardModal;
})();
