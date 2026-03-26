var { momentsCollection, notificationsCollection, TS, firebase, Z, PortalModal } = window;

var FriendsMomentsModal = ({ show, onClose, currentUser, currentUserData, currentUID, friendsData, lang, onOpenProfile }) => {
    const [moments, setMoments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedMoment, setSelectedMoment] = React.useState(null);
    const [commentText, setCommentText] = React.useState('');
    const [comments, setComments] = React.useState([]); 
    const [submittingComment, setSubmittingComment] = React.useState(false);
    const [likingId, setLikingId] = React.useState(null);
    const [showBell, setShowBell] = React.useState(false);
    const [bellNotifs, setBellNotifs] = React.useState([]);
    const [showCreatePost, setShowCreatePost] = React.useState(false);
    const [createText, setCreateText] = React.useState('');
    const [createImage, setCreateImage] = React.useState(null);
    const [createImageFile, setCreateImageFile] = React.useState(null);
    const [creating, setCreating] = React.useState(false);
    var fileRef = React.useRef(null);

    React.useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);
        // Unified Feed: Include current user's UID in the list of authors to fetch
        var friendUIDs = (friendsData || []).map(f => f.id || f.uid).filter(Boolean);
        var allUIDs = [...new Set([...friendUIDs, currentUID])].filter(Boolean); 

        if (allUIDs.length === 0) { setMoments([]); setLoading(false); return; }
        
        var chunks = [];
        for (var i = 0; i < allUIDs.length; i += 10) chunks.push(allUIDs.slice(i, i + 10));
        
        Promise.all(chunks.map(chunk =>
            momentsCollection.where('authorUID', 'in', chunk).limit(30).get()
                .catch(() => ({ docs: [] }))
        )).then(results => {
            var all = [];
            results.forEach(snap => snap.docs && snap.docs.forEach(d => {
                const data = d.data();
                all.push({ id: d.id, ...data });
            }));
            
            // Consistent sorting (Descending by createdAt)
            all.sort((a, b) => {
                var aT = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                var bT = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                return bT - aT;
            });
            
            setMoments(all.slice(0, 60));
            setLoading(false);
        }).catch(() => { setMoments([]); setLoading(false); });
    }, [show, currentUID, JSON.stringify((friendsData || []).map(f => f.id || f.uid).filter(Boolean).sort())]);

    // Real-time update for selected moment + Comments subcollection
    React.useEffect(() => {
        if (!selectedMoment?.id) {
            setComments([]);
            return;
        }
        
        // 1. Listen to the moment doc itself for likes/counts
        var unsubDoc = momentsCollection.doc(selectedMoment.id).onSnapshot(snap => {
            if (snap.exists) {
                var updated = { id: snap.id, ...snap.data() };
                setSelectedMoment(updated);
                setMoments(prev => prev.map(m => m.id === updated.id ? updated : m));
            }
        }, () => {});

        // 2. Listen to the comments subcollection (New Schema)
        var unsubComments = momentsCollection.doc(selectedMoment.id)
            .collection('comments')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => {
                setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }, err => console.error('Comments listener error:', err));

        return () => {
            unsubDoc();
            unsubComments();
        };
    }, [selectedMoment?.id]);

    var handleLike = async (moment, e) => {
        e?.stopPropagation();
        if (!currentUID || likingId === moment.id) return;
        setLikingId(moment.id);
        
        try {
            // Updated schema: likedBy (array) and likesCount (number)
            var likedBy = moment.likedBy || [];
            var alreadyLiked = likedBy.includes(currentUID);
            
            const ref = momentsCollection.doc(moment.id);
            await ref.update({
                likesCount: firebase.firestore.FieldValue.increment(alreadyLiked ? -1 : 1),
                likedBy: alreadyLiked
                    ? firebase.firestore.FieldValue.arrayRemove(currentUID)
                    : firebase.firestore.FieldValue.arrayUnion(currentUID)
            });

            // Local state update for immediate UI feedback
            const updatedLikedBy = alreadyLiked ? likedBy.filter(id => id !== currentUID) : [...likedBy, currentUID];
            const updatedLikesCount = (moment.likesCount || 0) + (alreadyLiked ? -1 : 1);

            setMoments(prev => prev.map(m => m.id === moment.id ? {
                ...m,
                likedBy: updatedLikedBy,
                likesCount: updatedLikesCount
            } : m));

            if (selectedMoment?.id === moment.id) {
                setSelectedMoment(prev => ({
                    ...prev,
                    likedBy: updatedLikedBy,
                    likesCount: updatedLikesCount
                }));
            }
        } catch(e) {
            console.error('Like error:', e);
        }
        setLikingId(null);
    };

    var handleComment = async () => {
        if (!commentText.trim() || !selectedMoment?.id || !currentUID || submittingComment) return;
        setSubmittingComment(true);
        try {
            const momentRef = momentsCollection.doc(selectedMoment.id);
            
            // 1. Add to subcollection (New Schema)
            await momentRef.collection('comments').add({
                authorUID: currentUID,
                authorName: currentUserData?.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUserData?.photoURL || null,
                content: commentText.trim(), // 'content' matches MomentsSystem.js
                createdAt: TS()
            });

            // 2. Increment count on main doc
            await momentRef.update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });

            setCommentText('');
        } catch(e) {
            console.error('Comment error:', e);
        }
        setSubmittingComment(false);
    };

    var fmtMomentTime = (ts) => {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        var diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
        return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
    };

    // Load bell notifications (moment likes/comments for current user)
    React.useEffect(() => {
        if (!show || !currentUID || !showBell) return;
        notificationsCollection
            .where('recipientUID', '==', currentUID)
            .where('type', 'in', ['moment_like', 'moment_comment'])
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get()
            .then(snap => setBellNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(() => {});
    }, [show, currentUID, showBell]);

    var handleCreateMoment = async () => {
        if (creating || (!createText.trim() && !createImageFile)) return;
        setCreating(true);
        try {
            var mediaUrl = null;
            if (createImageFile) {
                // Use the same robust storage path as MomentsSystem.js
                const fileName = `${Date.now()}_${createImageFile.name}`;
                const storageRef = firebase.storage().ref(`moments/${currentUID}/${fileName}`);
                
                // If it's the compressed dataURL (from the file picker reader)
                if (createImage && createImage.startsWith('data:image')) {
                     const blob = await (await fetch(createImage)).blob();
                     await storageRef.put(blob);
                } else {
                     await storageRef.put(createImageFile);
                }
                mediaUrl = await storageRef.getDownloadURL();
            }

            await momentsCollection.add({
                authorUID: currentUID,
                authorName: currentUserData?.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUserData?.photoURL || null,
                type: mediaUrl ? 'image' : 'text',
                content: createText.trim(),
                mediaUrl: mediaUrl || null,
                likedBy: [],
                likesCount: 0,
                commentsCount: 0,
                createdAt: TS(),
            });

            setCreateText(''); 
            setCreateImage(null); 
            setCreateImageFile(null); 
            setShowCreatePost(false);
        } catch(e) {
            console.error('Create moment error:', e);
        }
        setCreating(false);
    };

    if (!show) return null;

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    background:'linear-gradient(180deg,#0f0f1e,#0a0a14)', border:'1px solid rgba(0,242,255,0.2)',
                    borderRadius:'18px', width:'100%', maxWidth:'440px', maxHeight:'90vh',
                    display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
                }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <span style={{fontSize:'18px'}}>📸</span>
                            <div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white'}}>{lang==='ar'?'مومنت الأصدقاء':'Friends Moments'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280'}}>{moments.length} {lang==='ar'?'لحظة':'moments'}</div>
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                            {/* Bell — moment notifications */}
                            {currentUID && (
                                <div style={{position:'relative'}}>
                                    <button onClick={() => setShowBell(v => !v)}
                                        style={{width:'30px', height:'30px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background: showBell ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', color: bellNotifs.some(n=>!n.read) ? '#fbbf24' : '#6b7280', fontSize:'15px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                                    >🔔</button>
                                    {bellNotifs.some(n => !n.read) && (
                                        <div style={{position:'absolute', top:'-3px', right:'-3px', width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', border:'1.5px solid #0f0f1e'}} />
                                    )}
                                </div>
                            )}
                            {/* Camera — add moment */}
                            {currentUID && currentUser && !currentUser.isGuest && (
                                <button onClick={() => setShowCreatePost(v => !v)}
                                    style={{width:'30px', height:'30px', borderRadius:'8px', border:'1px solid rgba(0,242,255,0.3)', background: showCreatePost ? 'rgba(0,242,255,0.15)' : 'rgba(0,242,255,0.07)', color:'#00f2ff', fontSize:'15px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                                >📷</button>
                            )}
                            <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e => {
                                var f = e.target.files[0];
                                if (!f) return;
                                
                                // Add image compression matching MomentsSystem.js
                                const reader = new FileReader();
                                reader.onload = ev => {
                                    const img = new Image();
                                    img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const MAX_W = 800, MAX_H = 800;
                                        let w = img.width, h = img.height;
                                        if (w > MAX_W || h > MAX_H) {
                                            const ratio = Math.min(MAX_W / w, MAX_H / h);
                                            w = Math.round(w * ratio);
                                            h = Math.round(h * ratio);
                                        }
                                        canvas.width = w; canvas.height = h;
                                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                                        const compressed = canvas.toDataURL('image/jpeg', 0.6);
                                        setCreateImage(compressed);
                                        setCreateImageFile(f);
                                    };
                                    img.src = ev.target.result;
                                };
                                reader.readAsDataURL(f);
                            }} />
                            <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                        </div>
                    </div>

                    {/* Bell dropdown */}
                    {showBell && (
                        <div style={{padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.35)', maxHeight:'180px', overflowY:'auto'}}>
                            <div style={{fontSize:'10px', fontWeight:800, color:'#fbbf24', marginBottom:'6px'}}>🔔 {lang==='ar'?'إشعارات اللحظات':'Moments Alerts'}</div>
                            {bellNotifs.length === 0
                                ? <div style={{fontSize:'10px', color:'#4b5563', textAlign:'center', padding:'6px 0'}}>{lang==='ar'?'لا إشعارات':'No alerts yet'}</div>
                                : bellNotifs.map(n => (
                                    <div key={n.id} style={{display:'flex', alignItems:'center', gap:'7px', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                                        {n.senderPhoto
                                            ? <img src={n.senderPhoto} alt="" style={{width:'22px', height:'22px', borderRadius:'50%', objectFit:'cover'}} />
                                            : <div style={{width:'22px', height:'22px', borderRadius:'50%', background:'#374151', fontSize:'9px', display:'flex', alignItems:'center', justifyContent:'center'}}>👤</div>
                                        }
                                        <div style={{flex:1, fontSize:'10px', color:n.read?'#6b7280':'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                            <span style={{fontWeight:700, color:'#00f2ff'}}>{n.senderName}</span>
                                            {' '}{n.type==='moment_like'?(lang==='ar'?'أعجب بلحظتك':'liked your moment'):(lang==='ar'?'علّق على لحظتك':'commented on your moment')}
                                        </div>
                                        {!n.read && <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#ef4444', flexShrink:0}} />}
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Create moment panel */}
                    {showCreatePost && currentUID && (
                        <div style={{padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,242,255,0.04)'}}>
                            <div style={{fontSize:'11px', fontWeight:700, color:'#00f2ff', marginBottom:'8px'}}>
                                {lang==='ar'?'📷 أضف لحظة جديدة':'📷 Add a New Moment'}
                            </div>
                            {createImage && (
                                <div style={{marginBottom:'8px', position:'relative', display:'inline-block'}}>
                                    <img src={createImage} alt="" style={{height:'80px', borderRadius:'8px', objectFit:'cover'}} />
                                    <button onClick={() => { setCreateImage(null); setCreateImageFile(null); }}
                                        style={{position:'absolute', top:'-4px', right:'-4px', width:'18px', height:'18px', borderRadius:'50%', background:'#ef4444', color:'white', border:'none', fontSize:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                                </div>
                            )}
                            <div style={{display:'flex', gap:'6px'}}>
                                <input value={createText} onChange={e => setCreateText(e.target.value)}
                                    placeholder={lang==='ar'?'اكتب شيئاً...':'Write something...'}
                                    style={{flex:1, padding:'7px 10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'12px', outline:'none', direction:lang==='ar'?'rtl':'ltr'}}
                                />
                                <button onClick={() => fileRef.current?.click()} style={{width:'32px', height:'32px', borderRadius:'8px', border:'1px solid rgba(0,242,255,0.3)', background:'rgba(0,242,255,0.08)', color:'#00f2ff', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>🖼️</button>
                                <button onClick={handleCreateMoment} disabled={creating || (!createText.trim() && !createImageFile)}
                                    style={{width:'32px', height:'32px', borderRadius:'8px', border:'none', background: creating||(!createText.trim()&&!createImageFile)?'rgba(255,255,255,0.07)':'linear-gradient(135deg,#7000ff,#00f2ff)', color:'white', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {creating ? '⏳' : '➤'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
                        {loading ? <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>
                        : moments.length === 0 ? (
                            <div style={{textAlign:'center',padding:'40px'}}>
                                <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
                                <div style={{fontSize:'13px',color:'#6b7280'}}>{lang==='ar'?'لا مومنتات من أصدقائك بعد':'No moments from friends yet'}</div>
                                <div style={{fontSize:'11px',color:'#4b5563',marginTop:'6px'}}>{lang==='ar'?'أضف أصدقاء لتشاهد لحظاتهم':'Add friends to see their moments'}</div>
                            </div>
                        ) : (
                            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                {moments.map(moment => {
                                    var likedBy = moment.likedBy || [];
                                    var isLiked = likedBy.includes(currentUID);
                                    var commentsCount = moment.commentsCount || 0;
                                    return (
                                        <div key={moment.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden'}}>
                                            {/* Author row */}
                                            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px 8px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.1)'}}>
                                                    {moment.authorPhoto?<img src={moment.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>😎</div>}
                                                </div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{moment.authorName}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280'}}>{fmtMomentTime(moment.createdAt)}</div>
                                                </div>
                                                {onOpenProfile&&<button onClick={e=>{e.stopPropagation();onOpenProfile(moment.authorUID);}} style={{background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.2)',borderRadius:'6px',padding:'3px 8px',color:'#00f2ff',fontSize:'10px',cursor:'pointer'}}>👤</button>}
                                            </div>
                                            {/* Image */}
                                            {moment.type==='image'&&moment.mediaUrl&&<div style={{maxHeight:'260px',overflow:'hidden',cursor:'pointer'}} onClick={()=>setSelectedMoment(moment)}><img src={moment.mediaUrl} alt="" style={{width:'100%',objectFit:'cover',display:'block'}}/></div>}
                                            {/* Content */}
                                            {moment.content&&<div style={{padding:'8px 12px',fontSize:'12px',color:'#d1d5db',lineHeight:1.5,cursor:'pointer'}} onClick={()=>setSelectedMoment(moment)}>{moment.content}</div>}
                                            {/* Actions */}
                                            <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:'14px'}}>
                                                <button onClick={(e)=>handleLike(moment,e)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',color:isLiked?'#f87171':'#6b7280',fontSize:'12px',fontWeight:isLiked?700:400,padding:'3px 0',transition:'color 0.2s'}}>
                                                    {isLiked ? '❤️' : '🤍'} <span>{moment.likesCount || 0}</span>
                                                </button>
                                                <button onClick={()=>setSelectedMoment(moment)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',color:'#6b7280',fontSize:'12px',padding:'3px 0'}}>
                                                    💬 <span>{commentsCount}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Detail / Comment Modal ── */}
                {selectedMoment && (
                    <div className="modal-overlay" onClick={()=>{setSelectedMoment(null);setCommentText('');}} style={{zIndex:Z.MODAL_HIGH+1}}>
                        <div className="animate-pop" onClick={e=>e.stopPropagation()} style={{
                            background:'linear-gradient(180deg,#0d0d1f,#08080f)',
                            border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',
                            maxWidth:'420px',width:'95%',overflow:'hidden',maxHeight:'88vh',
                            display:'flex',flexDirection:'column'
                        }}>
                            {/* Header */}
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                    <div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,0.1)'}}>
                                        {selectedMoment.authorPhoto?<img src={selectedMoment.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'14px',lineHeight:'28px',display:'block',textAlign:'center'}}>😎</span>}
                                    </div>
                                    <div>
                                        <div style={{fontSize:'12px',fontWeight:700,color:'white'}}>{selectedMoment.authorName}</div>
                                        <div style={{fontSize:'10px',color:'#6b7280'}}>{fmtMomentTime(selectedMoment.createdAt)}</div>
                                    </div>
                                </div>
                                <button onClick={()=>{setSelectedMoment(null);setCommentText('');}} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'18px',cursor:'pointer'}}>✕</button>
                            </div>
                            {/* Content */}
                            <div style={{overflowY:'auto',flex:1}}>
                                {selectedMoment.type==='image'&&selectedMoment.mediaUrl&&<img src={selectedMoment.mediaUrl} alt="" style={{width:'100%',display:'block'}}/>}
                                {selectedMoment.content&&<div style={{padding:'12px 14px',fontSize:'13px',color:'#e2e8f0',lineHeight:1.6}}>{selectedMoment.content}</div>}
                                {/* Like / counts */}
                                <div style={{padding:'8px 14px',display:'flex',alignItems:'center',gap:'16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                                    <button onClick={(e)=>handleLike(selectedMoment,e)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',color:(selectedMoment.likedBy||[]).includes(currentUID)?'#f87171':'#6b7280',fontSize:'13px',fontWeight:(selectedMoment.likedBy||[]).includes(currentUID)?700:400,padding:'4px 0'}}>
                                        {(selectedMoment.likedBy||[]).includes(currentUID) ? '❤️' : '🤍'} {(selectedMoment.likesCount||0)}
                                    </button>
                                    <span style={{fontSize:'13px',color:'#6b7280'}}>💬 {selectedMoment.commentsCount||0}</span>
                                </div>
                                {/* Comments list */}
                                <div style={{padding:'10px 14px',display:'flex',flexDirection:'column',gap:'10px'}}>
                                    {comments.length===0 && (
                                        <div style={{textAlign:'center',padding:'16px',color:'#4b5563',fontSize:'11px'}}>{lang==='ar'?'لا تعليقات بعد':'No comments yet'}</div>
                                    )}
                                    {comments.map((c,i)=>(
                                        <div key={c.id || i} style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                                            <div style={{width:'26px',height:'26px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.08)'}}>
                                                {c.authorPhoto?<img src={c.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'12px',lineHeight:'26px',display:'block',textAlign:'center'}}>😎</span>}
                                            </div>
                                            <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'7px 10px'}}>
                                                <div style={{fontSize:'10px',fontWeight:700,color:'#a78bfa',marginBottom:'2px'}}>{c.authorName}</div>
                                                <div style={{fontSize:'12px',color:'#d1d5db',lineHeight:1.5}}>{c.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Comment Input */}
                            {currentUID && (
                                <div style={{display:'flex',gap:'8px',padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.3)'}}>
                                    <input
                                        value={commentText}
                                        onChange={e=>setCommentText(e.target.value)}
                                        onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleComment())}
                                        placeholder={lang==='ar'?'اكتب تعليقاً...':'Write a comment...'}
                                        style={{flex:1,padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none'}}
                                    />
                                    <button onClick={handleComment} disabled={!commentText.trim()||submittingComment} style={{width:'36px',height:'36px',borderRadius:'10px',border:'none',cursor:'pointer',background:commentText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.07)',color:commentText.trim()?'white':'#4b5563',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                        {submittingComment ? '⏳' : '➤'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PortalModal>
    );
};

window.FriendsMomentsModal = FriendsMomentsModal;
