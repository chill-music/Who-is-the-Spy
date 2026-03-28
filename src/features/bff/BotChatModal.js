(function() {
    var { useState, useEffect, useRef, useMemo } = React;

    // ─────────────────────────────────────────────
    // 🤖 BOT CHAT MODAL — Official read-only chat channels
    // ─────────────────────────────────────────────
    var BotChatModal = ({
        show, onClose, botId, currentUID, currentUserData, lang,
        onOpenWeddingHall, onOpenBFFModal,
    }) => {
        // ── Late-binding: read from window at render time ──
        var PortalModal = window.PortalModal || (({ children }) => children);

        var [messages, setMessages] = useState([]);
        var [loading, setLoading] = useState(true);
        var chatEndRef = useRef(null);

        var botCfg = BOT_CHATS_CONFIG.find(b => b.id === botId) || BOT_CHATS_CONFIG[0];

        useEffect(() => {
            if (!show || !currentUID || !botId) return;
            setLoading(true);
            // Single-field query — filter by botId client-side
            var unsub = botChatsCollection
                .where('toUserId', '==', currentUID)
                .onSnapshot(snap => {
                    var allMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    // Filter by botId and sort by timestamp
                    var filtered = allMsgs
                        .filter(m => m.botId === botId)
                        .sort((a, b) => {
                            var tA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds * 1000) || 0;
                            var tB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds * 1000) || 0;
                            return tA - tB;
                        })
                        .slice(-50); // last 50
                    setMessages(filtered);
                    setLoading(false);
                    // Mark this bot's messages as read
                    snap.docs.forEach(d => {
                        if (d.data().botId === botId && !d.data().read) {
                            botChatsCollection.doc(d.id).update({ read: true }).catch(() => {});
                        }
                    });
                }, () => setLoading(false));
            return () => unsub();
        }, [show, botId, currentUID]);

        useEffect(() => {
            if (show) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
        }, [messages.length, show]);

        if (!show) return null;

        var fmtTime = (ts) => {
            if (!ts) return '';
            var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
            var diff = Date.now() - d.getTime();
            if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
            return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
        };

        return (
            <PortalModal>
                <div onClick={onClose} style={{
                    position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 6,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px',
                }}>
                    <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                        display: 'flex', flexDirection: 'column',
                        width: '100%', maxWidth: '420px',
                        height: '82vh', maxHeight: '680px',
                        background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                        border: `1px solid ${botCfg.color}30`,
                        borderRadius: '20px', overflow: 'hidden',
                        boxShadow: `0 28px 70px rgba(0,0,0,0.88), 0 0 30px ${botCfg.glow}`,
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px',
                            background: `linear-gradient(135deg,${botCfg.color}15,${botCfg.color}08)`,
                            borderBottom: `1px solid ${botCfg.color}25`, flexShrink: 0,
                        }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%',
                                    background: `linear-gradient(135deg,${botCfg.color}30,${botCfg.color}15)`,
                                    border: `2px solid ${botCfg.color}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', overflow: 'hidden',
                                }}>
                                    {botCfg.photoURL
                                        ? <img src={botCfg.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : botCfg.emoji}
                                </div>
                                {/* Official badge */}
                                <div style={{
                                    position: 'absolute', bottom: '-2px', right: '-2px',
                                    background: botCfg.color, borderRadius: '50%',
                                    width: '14px', height: '14px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid rgba(5,5,18,1)', fontSize: '8px',
                                }}>✓</div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
                                        {lang === 'ar' ? botCfg.name_ar : botCfg.name_en}
                                    </span>
                                    <span style={{
                                        fontSize: '8px', fontWeight: 900, background: botCfg.color,
                                        color: '#000', padding: '1px 5px', borderRadius: '4px',
                                    }}>{lang === 'ar' ? 'رسمي' : 'OFFICIAL'}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {lang === 'ar' ? botCfg.description_ar : botCfg.description_en}
                                </div>
                            </div>
                            <button onClick={onClose} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: '14px',
                            }}>✕</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>}
                            {!loading && messages.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.35, paddingTop: '50px' }}>
                                    <span style={{ fontSize: '40px' }}>{botCfg.emoji}</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {lang === 'ar' ? 'لا رسائل بعد' : 'No messages yet'}
                                    </span>
                                </div>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    display: 'flex', gap: '8px', alignItems: 'flex-end',
                                }}>
                                    {/* Bot avatar */}
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                        background: `linear-gradient(135deg,${botCfg.color}30,${botCfg.color}15)`,
                                        border: `1.5px solid ${botCfg.color}55`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden',
                                    }}>
                                        {botCfg.photoURL
                                            ? <img src={botCfg.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : botCfg.emoji}
                                    </div>
                                    <div style={{ maxWidth: '80%' }}>
                                        <div style={{ fontSize: '9px', color: botCfg.color, fontWeight: 700, marginBottom: '3px' }}>
                                            {lang === 'ar' ? botCfg.name_ar : botCfg.name_en}
                                        </div>
                                        {/* Message bubble */}
                                        <div style={{
                                            padding: '10px 14px', borderRadius: '4px 14px 14px 14px',
                                            background: `linear-gradient(135deg,${botCfg.color}12,${botCfg.color}08)`,
                                            border: `1px solid ${botCfg.color}30`,
                                            fontSize: '12px', color: '#e2e8f0', lineHeight: 1.6,
                                        }}>
                                            {msg.fromName && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: `1px solid ${botCfg.color}20` }}>
                                                    {msg.fromPhoto && (
                                                        <img src={msg.fromPhoto} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    )}
                                                    <span style={{ fontSize: '10px', fontWeight: 700, color: botCfg.color }}>{msg.fromName}</span>
                                                </div>
                                            )}
                                            <div style={{ wordBreak: 'break-word' }}>{msg.message}</div>
                                            {/* Action button for bff/proposal */}
                                            {(msg.bffDocId || msg.coupleDocId) && (
                                                <button
                                                    onClick={() => {
                                                        if (msg.coupleDocId && onOpenWeddingHall) {
                                                            onClose();
                                                            setTimeout(() => onOpenWeddingHall('proposals'), 100);
                                                        } else if (msg.bffDocId && onOpenBFFModal) {
                                                            onClose();
                                                            setTimeout(() => onOpenBFFModal('requests'), 100);
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'block', width: '100%', marginTop: '8px',
                                                        padding: '7px 12px', borderRadius: '8px', border: 'none',
                                                        background: `linear-gradient(135deg,${botCfg.color},${botCfg.color}88)`,
                                                        color: '#000', fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                                                    }}>
                                                    {lang === 'ar' ? '👉 الرد الآن' : '👉 Respond Now'}
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '9px', color: '#374151', marginTop: '2px', paddingLeft: '3px' }}>
                                            {fmtTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Read-only notice */}
                        <div style={{
                            padding: '10px 14px', borderTop: `1px solid ${botCfg.color}20`,
                            background: 'rgba(0,0,0,0.3)', flexShrink: 0, textAlign: 'center',
                            fontSize: '10px', color: '#4b5563',
                        }}>
                            🔒 {lang === 'ar' ? 'هذا شات رسمي للقراءة فقط' : 'This is an official read-only channel'}
                        </div>
                    </div>
                </div>
            </PortalModal>
        );
    };

    // 🌍 Global Export
    window.BotChatModal = BotChatModal;
})();
