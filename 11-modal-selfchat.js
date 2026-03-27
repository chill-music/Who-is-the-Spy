(function() {
var SelfChatModal = ({ show, onClose, currentUser, userData, lang, currency }) => {
    var [messages, setMessages] = useState([]);
    var [inputText, setInputText] = useState('');
    var [sending, setSending] = useState(false);

    var uid         = currentUser?.uid || null;
    var displayName = currentUser?.displayName || userData?.displayName || (lang==='ar'?'أنا':'Me');
    var photoURL    = currentUser?.photoURL || userData?.photoURL || null;

    // ── localStorage key per user ──
    var _storageKey = uid ? `prospy_selfchat_${uid}` : null;

    var _load = () => {
        if (!_storageKey) return [];
        try { var r = localStorage.getItem(_storageKey); return r ? JSON.parse(r) : []; }
        catch { return []; }
    };
    var _save = (msgs) => {
        if (!_storageKey) return;
        try { localStorage.setItem(_storageKey, JSON.stringify(msgs.slice(-300))); }
        catch {}
    };

    // ── Load messages from localStorage when modal opens ──
    useEffect(() => {
        if (!show || !uid) return;
        setMessages(_load());
    }, [show, uid]);

    var sendNote = () => {
        if (!inputText.trim() || sending || !uid) return;
        setSending(true);
        var msg = {
            id:          `sc_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            text:        inputText.trim(),
            senderId:    uid,
            senderName:  displayName,
            senderPhoto: photoURL || null,
            timestamp:   Date.now(),
            type:        'note',
        };
        var updated = [...messages, msg];
        setMessages(updated);
        _save(updated);
        setInputText('');
        setSending(false);
    };

    var formatMsgTime = (ts) => {
        if (!ts) return '';
        var d = new Date(ts);
        if (isNaN(d)) return '';
        var now = new Date();
        if (d.toDateString() === now.toDateString())
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:Z.MODAL_TOP}}>
            <div
                className="animate-pop"
                onClick={e => e.stopPropagation()}
                style={{
                    background:'linear-gradient(180deg,#1a1a2e,#0f0f1a)',
                    border:'1px solid rgba(0,242,255,0.2)',
                    borderRadius:'18px',
                    width:'100%',
                    maxWidth:'400px',
                    maxHeight:'88vh',
                    display:'flex',
                    flexDirection:'column',
                    overflow:'hidden',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
                }}
            >
                {/* Header - like a real chat with profile photo */}
                <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px',
                    background:'linear-gradient(135deg,rgba(0,10,30,0.9),rgba(20,0,40,0.9))',
                    borderBottom:'1px solid rgba(255,255,255,0.06)'
                }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{position:'relative'}}>
                            <img
                                src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7000ff&color=fff&size=80`}
                                alt=""
                                style={{width:'42px',height:'42px',borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(0,242,255,0.4)'}}
                            />
                            <div style={{position:'absolute',bottom:'1px',right:'1px',width:'10px',height:'10px',borderRadius:'50%',background:'#4ade80',border:'2px solid #0f0f1a'}}/>
                        </div>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'white'}}>
                                {displayName}
                            </div>
                            <div style={{fontSize:'10px', color:'#4ade80', fontWeight:600}}>
                                {lang==='ar' ? '● شاتي الشخصي' : '● My Personal Chat'}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>

                {/* Messages */}
                <div style={{flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'10px', background:'rgba(0,0,0,0.2)'}}>
                    {messages.length === 0 && (
                        <div style={{textAlign:'center', marginTop:'50px', color:'#4b5563'}}>
                            <div style={{fontSize:'40px', marginBottom:'8px'}}>💬</div>
                            <div style={{fontSize:'12px', color:'#6b7280'}}>{lang==='ar' ? 'ابدأ محادثتك...' : 'Start chatting...'}</div>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} style={{display:'flex', justifyContent:'flex-end'}}>
                            {msg.type === 'gift' ? (
                                /* Gift notification bubble */
                                <div style={{
                                    background:GR.GOLD_SOFT,
                                    border:'1px solid rgba(255,215,0,0.3)',
                                    borderRadius:'14px 14px 4px 14px',
                                    padding:'10px 14px',
                                    maxWidth:'85%'
                                }}>
                                    <div style={{fontSize:'9px', color:'#fbbf24', fontWeight:700, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                                        🎁 {lang==='ar' ? 'هدية لنفسك' : 'Self Gift'}
                                    </div>
                                    <div style={{fontSize:'20px', marginBottom:'4px'}}>{msg.giftEmoji || '🎁'}</div>
                                    <div style={{fontSize:'12px', color:'#f3f4f6', fontWeight:700}}>{msg.giftName}</div>
                                    <div style={{fontSize:'10px', color:'#9ca3af', marginTop:'2px'}}>{lang==='ar'?'تكلفة:':'Cost:'} {msg.giftCost} 🧠</div>
                                    <div style={{fontSize:'10px', color:'#9ca3af'}}>{lang==='ar'?'كاريزما:':'Charisma:'} +{msg.charismaGain}</div>                                    <div style={{fontSize:'9px', color:'#4b5563', marginTop:'4px', textAlign:'right'}}>{formatMsgTime(msg.timestamp)}</div>
                                </div>
                            ) : (
                                /* Regular note bubble */
                                <div style={{
                                    background:'linear-gradient(135deg,rgba(0,242,255,0.1),rgba(112,0,255,0.1))',
                                    border:'1px solid rgba(0,242,255,0.2)',
                                    borderRadius:'14px 14px 4px 14px',
                                    padding:'10px 14px',
                                    maxWidth:'85%'
                                }}>
                                    <div style={{fontSize:'13px', color:'#e2e8f0', lineHeight:1.5}}>{msg.text}</div>
                                    <div style={{fontSize:'9px', color:'#4b5563', marginTop:'4px', textAlign:'right'}}>{formatMsgTime(msg.timestamp)}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    display:'flex', gap:'8px', padding:'12px 14px',
                    borderTop:'1px solid rgba(255,255,255,0.07)',
                    background:'rgba(0,0,0,0.2)'
                }}>
                    <input
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendNote(); } }}
                        placeholder={lang==='ar' ? 'اكتب رسالة...' : 'Write a message...'}
                        style={{
                            flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                            borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'13px', outline:'none'
                        }}
                    />
                    <button
                        onClick={sendNote}
                        disabled={!inputText.trim() || sending}
                        style={{
                            padding:'10px 14px', borderRadius:'10px', fontSize:'14px', cursor:'pointer', border:'none',
                            background: inputText.trim() ? 'linear-gradient(135deg,#00f2ff,#7000ff)' : 'rgba(255,255,255,0.06)',
                            color: inputText.trim() ? '#000' : '#4b5563',
                            fontWeight:800, transition:'all 0.2s',
                            opacity: sending ? 0.6 : 1
                        }}
                    >
                        {sending ? '...' : '➤'}
                    </button>
                </div>
            </div>
        </div>
    );
};

window.SelfChatModal = SelfChatModal;

})();
