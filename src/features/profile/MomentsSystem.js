/**
 * MomentsSystem.js
 * Comprehensive modular component for the Moments (social feed) system.
 * Handles Posting, Viewing, Liking, Commenting, and Reporting moments.
 * 
 * Part of Phase 4: Batch 5 modularization.
 */

if (!window.useState) {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
} else {
    var { useState, useEffect, useRef, useMemo, useCallback } = window;
}

// Max file size: 2MB images, 5MB videos (10 sec max)
var MAX_IMAGE_SIZE = 2 * 1024 * 1024;
var MAX_VIDEO_SIZE = 5 * 1024 * 1024;
var MAX_VIDEO_DURATION = 10;

var AllMomentsModal = ({ show, onClose, moments, ownerName, ownerPhoto, lang, onSelectMoment }) => {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:Z.MODAL_HIGH}}>
            <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                background:'linear-gradient(180deg,#0f0f1e,#0a0a14)',
                border:'1px solid rgba(0,242,255,0.2)',
                borderRadius:'18px', width:'100%', maxWidth:'420px',
                maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
            }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <button onClick={onClose} style={{width:'28px', height:'28px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.07)', color:'#9ca3af', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            ‹
                        </button>
                        {ownerPhoto
                            ? <img src={ownerPhoto} alt="" style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(0,242,255,0.4)'}} />
                            : <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'rgba(0,242,255,0.1)', border:'2px solid rgba(0,242,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px'}}>📸</div>
                        }
                        <div>
                            <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{lang==='ar'?'كل اللحظات':'All Moments'}</div>
                            <div style={{fontSize:'9px', color:'#6b7280'}}>{ownerName} · {moments.length} {lang==='ar'?'لحظة':'moments'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px'}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px'}}>
                        {moments.map(moment => (
                            <div key={moment.id} onClick={() => { onSelectMoment(moment); onClose(); }} style={{
                                aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                                background:GR.CYAN_SOFT,
                                border:'1px solid rgba(0,242,255,0.15)', cursor:'pointer', position:'relative',
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px',
                                transition:'transform 0.15s'
                            }}>
                                {moment.type === 'image' && moment.mediaUrl ? (
                                    <img src={moment.mediaUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                ) : moment.type === 'video' && moment.mediaUrl ? (
                                    <video src={moment.mediaUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} muted />
                                ) : (
                                    <div style={{fontSize:'11px',color:'#e2e8f0',padding:'8px',textAlign:'center',lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical'}}>
                                        {moment.content}
                                    </div>
                                )}
                                <div style={{position:'absolute', top:'3px', left:'3px', fontSize:'7px', background:'rgba(0,0,0,0.6)', borderRadius:'3px', padding:'1px 3px', color:'#00f2ff', fontWeight:700}}>
                                    {moment.type === 'text' ? '✏️' : moment.type === 'image' ? '🖼️' : '🎥'}
                                </div>
                                {(moment.likesCount||0) > 0 && (
                                    <div style={{position:'absolute', bottom:'2px', right:'3px', fontSize:'7px', color:'#f87171', fontWeight:700}}>❤️{moment.likesCount}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

var VIP_MOMENT_BG_URLS = [
    'https://firebasestorage.googleapis.com/v0/b/super-spy-88.appspot.com/o/moments-bg%2Fvip1.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/super-spy-88.appspot.com/o/moments-bg%2Fvip2.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/super-spy-88.appspot.com/o/moments-bg%2Fvip3.jpg?alt=media'
];

var MomentsSection = ({ ownerUID, ownerName, ownerPhoto, currentUser, isOwnProfile, lang, onOpenProfile }) => {
    var [moments, setMoments] = useState([]);
    var [loading, setLoading] = useState(true);
    var [showCreate, setShowCreate] = useState(false);
    var [showAll, setShowAll] = useState(false);
    var [selectedMoment, setSelectedMoment] = useState(null);

    useEffect(() => {
        if (!ownerUID) return;
        setLoading(true);
        var q = momentsCollection
            .where('authorUID', '==', ownerUID)
            .limit(50);

        var unsub = q.onSnapshot(snap => {
            var list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Replicate original JS sort logic (Descending by createdAt)
            list.sort((a, b) => {
                var ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                var tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                return tb - ta;
            });

            setMoments(list); 
            setLoading(false);
        }, err => {
            console.error('MomentsSection error:', err);
            setLoading(false);
        });
        return () => unsub();
    }, [ownerUID]);

    var previewMoments = moments.slice(0, 3);

    return (
        <div style={{padding:'4px 2px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', padding:'0 10px'}}>
                <div style={{fontSize:'13px', fontWeight:900, color:'white', display:'flex', alignItems:'center', gap:'6px'}}>
                    📸 {lang==='ar'?'اللحظات':'Moments'}
                    <span style={{fontSize:'10px', color:'#6b7280'}}>{moments.length}</span>
                </div>
                {isOwnProfile && (
                    <button onClick={() => setShowCreate(true)} style={{background:GR.NEON, border:'none', borderRadius:'6px', color:'white', padding:'4px 10px', fontSize:'11px', fontWeight:800, cursor:'pointer'}}>
                        {lang==='ar'?'+ نشر':'+ Post'}
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{padding:'40px 0', display:'flex', justifyContent:'center'}}>
                    <div className="profile-loading-spinner" style={{width:'20px', height:'20px'}} />
                </div>
            ) : moments.length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)', borderRadius:'12px', padding:'40px 20px', textAlign:'center', border:'1px dashed rgba(255,255,255,0.1)'}}>
                    <div style={{fontSize:'12px', color:'#6b7280'}}>{lang==='ar'?'لا توجد لحظات بعد':'No moments yet'}</div>
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'8px', padding:'0 10px'}}>
                    {previewMoments.map(m => (
                        <MomentCard key={m.id} moment={m} currentUser={currentUser} lang={lang} onSelect={() => setSelectedMoment(m)} onOpenProfile={onOpenProfile} />
                    ))}
                    {moments.length >= 3 && (
                        <button onClick={() => setShowAll(true)} style={{width:'100%', padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#9ca3af', fontSize:'11px', fontWeight:700, cursor:'pointer', marginTop:'4px'}}>
                            {lang==='ar'?'عرض كل اللحظات':'View All Moments'}
                        </button>
                    )}
                </div>
            )}

            <CreateMomentModal
                show={showCreate}
                currentUser={currentUser}
                lang={lang}
                onClose={() => setShowCreate(false)}
            />
            <AllMomentsModal
                show={showAll}
                moments={moments}
                ownerName={ownerName}
                ownerPhoto={ownerPhoto}
                lang={lang}
                onSelectMoment={m => setSelectedMoment(m)}
                onClose={() => setShowAll(false)}
                onOpenProfile={onOpenProfile}
            />
            <MomentDetailModal
                show={!!selectedMoment}
                moment={selectedMoment}
                currentUser={currentUser}
                lang={lang}
                onClose={() => setSelectedMoment(null)}
                onOpenProfile={onOpenProfile}
            />
        </div>
    );
};

             /**
 * MomentDetailModal
 * Full-screen detailed view of a moment, including comments and interactions.
 */
/**
 * MomentDetailModal
 * Displays full moment content, comments, and media.
 */
var MomentDetailModal = ({ show, onClose, moment, currentUser, lang, onOpenProfile }) => {
    var [commentText, setCommentText] = useState('');
    var [comments, setComments] = useState([]);
    var [sending, setSending] = useState(false);
    var [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!show || !moment?.id) return;
        var q = momentsCollection.doc(moment.id).collection('comments').orderBy('createdAt', 'desc');
        var unsub = q.onSnapshot(snap => {
            setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, err => console.error('Comments error:', err));
        return () => unsub();
    }, [show, moment?.id]);

    if (!show || !moment) return null;

    var isLiked = moment.likedBy?.includes(currentUser?.uid);
    var isOwner = moment.authorUID === currentUser?.uid;
    var isVIP = moment.authorVipLevel > 0;

    var onLike = async () => {
        if (!currentUser) return;
        var ref = momentsCollection.doc(moment.id);
        if (isLiked) {
            await ref.update({
                likesCount: firebase.firestore.FieldValue.increment(-1),
                likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });
        } else {
            await ref.update({
                likesCount: firebase.firestore.FieldValue.increment(1),
                likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
        }
    };

    var onDelete = async (id) => {
        try {
            await momentsCollection.doc(id).delete();
            onClose();
        } catch (e) {
            console.error('Delete error:', e);
        }
    };

    var onComment = async () => {
        if (!commentText.trim() || !currentUser || sending) return;
        setSending(true);
        try {
            await momentsCollection.doc(moment.id).collection('comments').add({
                authorUID: currentUser.uid,
                authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUser.photoURL || null,
                content: commentText.trim(),
                createdAt: TS()
            });
            await momentsCollection.doc(moment.id).update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });
            setCommentText('');
        } catch (e) {
            console.error('Comment error:', e);
        } finally {
            setSending(false);
        }
    };

    return (
        <PortalModal>
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.MODAL_HIGH, padding:'16px'}} onClick={onClose}>
                <div 
                    onClick={e => e.stopPropagation()} 
                    style={{
                        background: isVIP ? `url(${VIP_MOMENT_BG_URLS[0]}) center/cover no-repeat` : GR.DARK_CARD,
                        border: '1px solid rgba(0,242,255,0.2)',
                        borderRadius: '24px', width: '100%', maxWidth: '440px',
                        height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.85)', position: 'relative'
                    }}
                >
                    {isVIP && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1}} />}
                    
                    <div style={{zIndex:2, display:'flex', flexDirection:'column', height:'100%'}}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {moment.authorPhoto 
                                    ? <img src={moment.authorPhoto} alt="" style={{width:'36px', height:'36px', borderRadius:'50%', border:'2px solid rgba(0,242,255,0.3)'}} />
                                    : <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'rgba(0,242,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center'}}>📸</div>
                                }
                                <div>
                                    <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{moment.authorName}</div>
                                    <div style={{fontSize:'9px', color:'#9ca3af'}}>{moment.createdAt?.seconds ? new Date(moment.createdAt.seconds*1000).toLocaleString() : ''}</div>
                                </div>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                 {isOwner && (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{background:'rgba(239,68,68,0.1)', border:'none', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer'}}>🗑️</button>
                                 )}
                                 <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'white'}}>✕</button>
                            </div>
                        </div>

                        <div style={{flex:1, overflowY:'auto', padding:'20px'}} className="custom-scrollbar">
                            <div style={{fontSize:'15px', lineHeight:1.6, color:'#f1f5f9', whiteSpace:'pre-wrap', marginBottom:'15px'}}>
                                {moment.content}
                            </div>
                            {moment.mediaUrl && (
                                <div style={{borderRadius:'16px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', marginBottom:'20px', background:'black'}}>
                                    {moment.type === 'image' ? (
                                        <img src={moment.mediaUrl} alt="" style={{width:'100%', display:'block'}} />
                                    ) : (
                                        <video src={moment.mediaUrl} controls style={{width:'100%', display:'block'}} />
                                    )}
                                </div>
                            )}
                            <div style={{display:'flex', alignItems:'center', gap:'20px', padding:'15px 0', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                <div onClick={onLike} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                                    <span style={{fontSize:'20px'}}>{isLiked ? '❤️' : '🤍'}</span>
                                    <span style={{fontSize:'14px', fontWeight:800, color:isLiked?'#f87171':'#9ca3af'}}>{moment.likesCount || 0}</span>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                    <span style={{fontSize:'20px'}}>💬</span>
                                    <span style={{fontSize:'14px', fontWeight:800, color:'#9ca3af'}}>{moment.commentsCount || 0}</span>
                                </div>
                            </div>
                            <div style={{marginTop:'20px'}}>
                                <div style={{fontSize:'12px', fontWeight:800, color:'#6b7280', marginBottom:'15px'}}>{lang==='ar'?'التعليقات':'Comments'} ({comments.length})</div>
                                {comments.map(c => (
                                    <div key={c.id} style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                                        {c.authorPhoto 
                                            ? <img src={c.authorPhoto} alt="" style={{width:'28px', height:'28px', borderRadius:'50%'}} />
                                            : <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,255,255,0.05)'}} />
                                        }
                                        <div style={{flex:1, background:'rgba(255,255,255,0.03)', borderRadius:'0 14px 14px 14px', padding:'8px 12px'}}>
                                            <div style={{fontSize:'11px', fontWeight:800, color:'#00f2ff', marginBottom:'2px'}}>{c.authorName}</div>
                                            <div style={{fontSize:'13px', color:'#e2e8f0'}}>{c.content}</div>
                                            <div style={{fontSize:'8px', color:'#6b7280', marginTop:'4px'}}>{c.createdAt?.seconds ? new Date(c.createdAt.seconds*1000).toLocaleTimeString() : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{padding:'16px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,10,20,0.5)'}}>
                             <div style={{display:'flex', gap:'10px'}}>
                                <input 
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder={lang==='ar'?'أكتب تعليقاً...':'Write a comment...'}
                                    style={{flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', padding:'10px 14px', fontSize:'13px', outline:'none'}}
                                />
                                <button 
                                    onClick={onComment}
                                    disabled={sending || !commentText.trim()}
                                    style={{background:GR.NEON, border:'none', borderRadius:'10px', padding:'0 18px', color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer', opacity:(sending||!commentText.trim())?0.5:1}}
                                >
                                    {sending ? '...' : (lang==='ar'?'نشر':'Post')}
                                </button>
                             </div>
                        </div>
                    </div>

                    {showDeleteConfirm && (
                        <PortalModal>
                            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.MODAL_HIGH+10, padding:'16px'}} onClick={() => setShowDeleteConfirm(false)}>
                                <div style={{background:GR.DARK_CARD, border:'1px solid rgba(239,68,68,0.3)', borderRadius:'14px', padding:'22px 24px', textAlign:'center', maxWidth:'260px', width:'100%'}} onClick={e => e.stopPropagation()}>
                                    <div style={{fontSize:'32px', marginBottom:'8px'}}>🗑️</div>
                                    <div style={{fontSize:'14px', fontWeight:800, color:'white', marginBottom:'6px'}}>{lang === 'ar' ? 'حذف اللحظة؟' : 'Delete Moment?'}</div>
                                    <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'18px'}}>{lang === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}</div>
                                    <div style={{display:'flex', gap:'8px'}}>
                                        <button onClick={() => setShowDeleteConfirm(false)} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                        <button onClick={() => { setShowDeleteConfirm(false); onDelete(moment.id); }} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(239,68,68,0.18)', border:'1px solid rgba(239,68,68,0.4)', color:'#f87171', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                                    </div>
                                </div>
                            </div>
                        </PortalModal>
                    )}
                </div>
            </div>
        </PortalModal>
    );
};

/**
 * CreateMomentModal
 * Interactive modal for users to create and post new moments (Text, Image, or Video).
 */
var CreateMomentModal = ({ show, onClose, currentUser, lang, onPosted }) => {
    var [momentType, setMomentType] = useState('text');
    var [textContent, setTextContent] = useState('');
    var [mediaFile, setMediaFile] = useState(null);
    var [mediaPreview, setMediaPreview] = useState(null);
    var [error, setError] = useState('');
    var [uploading, setUploading] = useState(false);
    var fileRef = useRef(null);

    var handleFileChange = (e) => {
        var file = e.target.files?.[0];
        if (!file) return;
        setError('');

        if (momentType === 'image') {
            if (file.size > MAX_IMAGE_SIZE) {
                setError(lang === 'ar' ? 'حجم الصورة كبير جداً (الحد 2MB)' : 'Image too large (max 2MB)');
                return;
            }
            var reader = new FileReader();
            reader.onload = ev => {
                var img = new Image();
                img.onload = () => {
                    var canvas = document.createElement('canvas');
                    var MAX_W = 800, MAX_H = 800;
                    var w = img.width, h = img.height;
                    if (w > MAX_W || h > MAX_H) {
                        var ratio = Math.min(MAX_W / w, MAX_H / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    var compressed = canvas.toDataURL('image/jpeg', 0.6);
                    setMediaPreview(compressed);
                    setMediaFile(file);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (momentType === 'video') {
            if (file.size > MAX_VIDEO_SIZE) {
                setError(lang === 'ar' ? 'حجم الفيديو كبير جداً (الحد 5MB)' : 'Video too large (max 5MB)');
                return;
            }
            var url = URL.createObjectURL(file);
            var video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                if (video.duration > MAX_VIDEO_DURATION) {
                    setError(lang === 'ar' ? `الفيديو يجب أن يكون ${MAX_VIDEO_DURATION} ثواني فقط` : `Video must be max ${MAX_VIDEO_DURATION} seconds`);
                    return;
                }
                var reader = new FileReader();
                reader.onload = ev => setMediaPreview(ev.target.result);
                reader.readAsDataURL(file);
                setMediaFile(file);
            };
        }
    };

    var handleSubmit = async () => {
        if (!currentUser) return;
        if (momentType === 'text' && !textContent.trim()) return;
        if ((momentType === 'image' || momentType === 'video') && !mediaFile) return;
        setUploading(true);
        setError('');

        try {
            var finalMediaUrl = null;
            
            // Upload to Storage if not text
            if (momentType === 'image' || momentType === 'video') {
                var fileExt = mediaFile.name.split('.').pop();
                var fileName = `${currentUser.uid}_${Date.now()}.${fileExt}`;
                var storageRef = storage.ref(`moments/${fileName}`);
                var snapshot = await storageRef.put(mediaFile);
                finalMediaUrl = await snapshot.ref.getDownloadURL();
            }

            var momentData = {
                authorUID: currentUser.uid,
                authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUser.photoURL || null,
                authorVipLevel: window.getVIPLevel(currentUser) || 0,
                type: momentType,
                content: textContent.trim(),
                mediaUrl: finalMediaUrl,
                likesCount: 0,
                likedBy: [],
                commentsCount: 0,
                createdAt: TS()
            };
            await momentsCollection.add(momentData);
            // Track mission progress
            try {
                var today = new Date().toDateString();
                var dp = currentUser?.missionProgress?.daily || {};
                var now2 = new Date(); var soy = new Date(now2.getFullYear(),0,1);
                var wNum = Math.ceil(((now2-soy)/86400000+soy.getDay()+1)/7);
                var wStr = `${now2.getFullYear()}-W${wNum}`;
                var wp = currentUser?.missionProgress?.weekly || {};
                var mUpdates = {};
                if (dp.resetDate !== today) {
                    mUpdates['missionProgress.daily.resetDate'] = today;
                    mUpdates['missionProgress.daily.momentsPosted'] = 1;
                } else {
                    mUpdates['missionProgress.daily.momentsPosted'] = firebase.firestore.FieldValue.increment(1);
                }
                if (wp.resetWeek !== wStr) {
                    mUpdates['missionProgress.weekly.resetWeek'] = wStr;
                    mUpdates['missionProgress.weekly.momentsPosted'] = 1;
                } else {
                    mUpdates['missionProgress.weekly.momentsPosted'] = firebase.firestore.FieldValue.increment(1);
                }
                await usersCollection.doc(currentUser.uid).update(mUpdates);
            } catch (me) {}
            if (onPosted) onPosted();
            onClose();
        } catch (e) {
            setError(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again');
        }
        setUploading(false);
    };

    if (!show) return null;
    return (
        <PortalModal>
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.MODAL_HIGH, padding:'16px'}} onClick={onClose}>
                <div style={{background:GR.DARK_CARD, border:'1px solid rgba(0,242,255,0.25)', borderRadius:'16px', width:'100%', maxWidth:'360px', overflow:'hidden'}} onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                        <span style={{fontWeight:800, fontSize:'15px', color:'white'}}>{lang === 'ar' ? '📸 لحظة جديدة' : '📸 New Moment'}</span>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#9ca3af', fontSize:'16px', cursor:'pointer', borderRadius:'6px', padding:'4px 8px'}}>✕</button>
                    </div>

                    <div style={{padding:'16px'}}>
                        <div style={{display:'flex', gap:'6px', marginBottom:'14px'}}>
                            {[
                                {id:'text', icon:'✏️', ar:'نص', en:'Text'},
                                {id:'image', icon:'🖼️', ar:'صورة', en:'Image'},
                                {id:'video', icon:'🎥', ar:'فيديو', en:'Video'}
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setMomentType(t.id); setMediaFile(null); setMediaPreview(null); setError(''); }}
                                    style={{
                                        flex:1, padding:'8px 4px', borderRadius:'10px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                        background: momentType === t.id ? 'rgba(0,242,255,0.2)' : 'rgba(255,255,255,0.04)',
                                        border: momentType === t.id ? '1.5px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                                        color: momentType === t.id ? '#00f2ff' : '#9ca3af',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'
                                    }}
                                >
                                    {t.icon} {lang === 'ar' ? t.ar : t.en}
                                </button>
                            ))}
                        </div>

                        {momentType === 'text' && (
                            <textarea
                                value={textContent}
                                onChange={e => setTextContent(e.target.value)}
                                maxLength={280}
                                placeholder={lang === 'ar' ? 'اكتب لحظتك هنا...' : 'Write your moment here...'}
                                style={{width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'13px', fontFamily:'inherit', resize:'none', height:'100px', outline:'none'}}
                            />
                        )}

                        {(momentType === 'image' || momentType === 'video') && (
                            <div>
                                <input ref={fileRef} type="file" accept={momentType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} style={{display:'none'}} />
                                {mediaPreview ? (
                                    <div style={{position:'relative', borderRadius:'10px', overflow:'hidden', marginBottom:'8px'}}>
                                        {momentType === 'image'
                                            ? <img src={mediaPreview} alt="" style={{width:'100%', maxHeight:'180px', objectFit:'cover'}} />
                                            : <video src={mediaPreview} controls style={{width:'100%', maxHeight:'180px'}} />
                                        }
                                        <button onClick={() => { setMediaFile(null); setMediaPreview(null); setTextContent(''); }} style={{position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)', border:'none', color:'white', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        style={{border:'2px dashed rgba(0,242,255,0.3)', borderRadius:'10px', padding:'24px', textAlign:'center', cursor:'pointer', color:'#64748b', fontSize:'12px'}}
                                    >
                                        <div style={{fontSize:'28px', marginBottom:'6px'}}>{momentType === 'image' ? '🖼️' : '🎥'}</div>
                                        <div>{lang === 'ar' ? 'انقر لاختيار ملف' : 'Click to select file'}</div>
                                        <div style={{fontSize:'9px', marginTop:'4px', color:'#475569'}}>
                                            {momentType === 'image' ? (lang === 'ar' ? 'الحد الأقصى 2MB' : 'Max 2MB') : (lang === 'ar' ? 'الحد 10 ثواني / 5MB' : 'Max 10s / 5MB')}
                                        </div>
                                    </div>
                                )}
                                <textarea
                                    value={textContent}
                                    onChange={e => setTextContent(e.target.value)}
                                    maxLength={200}
                                    placeholder={lang === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a caption (optional)...'}
                                    style={{width:'100%', marginTop:'8px', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'8px 12px', color:'white', fontSize:'12px', fontFamily:'inherit', resize:'none', height:'56px', outline:'none'}}
                                />
                            </div>
                        )}

                        {error && <div style={{color:'#f87171', fontSize:'11px', marginTop:'6px', textAlign:'center'}}>{error}</div>}

                        <button
                            onClick={handleSubmit}
                            disabled={uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)}
                            style={{
                                width:'100%', marginTop:'12px', padding:'12px', borderRadius:'12px',
                                background:GR.NEON, color:'white',
                                fontSize:'14px', fontWeight:800, border:'none', cursor:'pointer',
                                opacity: (uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)) ? 0.5 : 1
                            }}
                        >
                            {uploading ? (lang === 'ar' ? 'جارٍ النشر...' : 'Posting...') : (lang === 'ar' ? 'نشر اللحظة 🚀' : 'Post Moment 🚀')}
                        </button>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

/**
 * MomentCard
 * A compact reusable card representing a single moment, used in feeds and sections.
 */
var MomentCard = ({ moment, currentUser, lang, onOpenProfile }) => {
    var [showDetail, setShowDetail] = useState(false);
    var isLiked = moment.likedBy?.includes(currentUser?.uid);

    var onLike = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;
        var ref = momentsCollection.doc(moment.id);
        if (isLiked) {
            await ref.update({
                likesCount: firebase.firestore.FieldValue.increment(-1),
                likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });
        } else {
            await ref.update({
                likesCount: firebase.firestore.FieldValue.increment(1),
                likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
        }
    };

    return (
        <>
            <div 
                onClick={() => setShowDetail(true)}
                style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'12px', cursor:'pointer', transition:'transform 0.15s'}}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div 
                            onClick={(e) => { e.stopPropagation(); onOpenProfile(moment.authorUID); }}
                            style={{width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', border:'1px solid rgba(0,242,255,0.2)'}}
                        >
                            {moment.authorPhoto ? <img src={moment.authorPhoto} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : <div style={{width:'100%', height:'100%', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px'}}>👤</div>}
                        </div>
                        <span style={{fontSize:'12px', fontWeight:800, color:'#e5e7eb'}}>{moment.authorName}</span>
                    </div>
                    <span style={{fontSize:'9px', color:'#4b5563'}}>{moment.createdAt?.toDate ? moment.createdAt.toDate().toLocaleDateString() : ''}</span>
                </div>

                {moment.type === 'text' ? (
                    <div style={{fontSize:'12px', color:'#94a3b8', lineHeight:1.5, marginBottom:'8px', maxHeight:'60px', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical'}}>
                        {moment.content}
                    </div>
                ) : (
                    <div style={{position:'relative', borderRadius:'8px', overflow:'hidden', marginBottom:'8px', background:'#000', height:'120px'}}>
                        {moment.type === 'image' 
                            ? <img src={moment.mediaUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> 
                            : <video src={moment.mediaUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} muted />
                        }
                        {moment.type === 'video' && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', background:'rgba(0,0,0,0.2)'}}>▶️</div>}
                    </div>
                )}

                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div onClick={onLike} style={{display:'flex', alignItems:'center', gap:'4px', color: isLiked ? '#ef4444' : '#6b7280', fontSize:'11px', fontWeight:800}}>
                        <span>{isLiked ? '❤️' : '🤍'}</span> {moment.likesCount}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'4px', color:'#6b7280', fontSize:'11px', fontWeight:800}}>
                        <span>💬</span> {moment.commentsCount}
                    </div>
                </div>
            </div>

            {showDetail && (
                <MomentDetailModal 
                    show={showDetail} 
                    onClose={() => setShowDetail(false)} 
                    moment={moment} 
                    currentUser={currentUser} 
                    lang={lang} 
                    onOpenProfile={onOpenProfile}
                />
            )}
        </>
    );
};

// --- Export to Global Scope ---
window.AllMomentsModal = AllMomentsModal;
window.MomentsSection = MomentsSection;
window.MomentDetailModal = MomentDetailModal;
window.CreateMomentModal = CreateMomentModal;
window.MomentCard = MomentCard;
window.MAX_IMAGE_SIZE = MAX_IMAGE_SIZE;
window.MAX_VIDEO_SIZE = MAX_VIDEO_SIZE;
window.MAX_VIDEO_DURATION = MAX_VIDEO_DURATION;
