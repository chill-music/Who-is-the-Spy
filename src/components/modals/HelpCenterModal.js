/**
 * HelpCenterModal Component
 * Modularized from 14-modals-misc.js
 */
var HelpCenterModal = ({ show, onClose, user, userData, lang, onNotification, isLoggedIn }) => {
    const [activeTab, setActiveTab] = React.useState('faq');
    const [faqs, setFaqs] = React.useState([]);
    const [openFaq, setOpenFaq] = React.useState(null);
    const [loadingFaqs, setLoadingFaqs] = React.useState(true);
    const [feedbackText, setFeedbackText] = React.useState('');
    const [feedbackRating, setFeedbackRating] = React.useState(5);
    const [sendingFeedback, setSendingFeedback] = React.useState(false);

    React.useEffect(() => {
        if (!show) return;
        setLoadingFaqs(true);
        const unsub = helpFaqCollection.onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => (a.order||99) - (b.order||99));
            setFaqs(data);
            setLoadingFaqs(false);
        }, () => setLoadingFaqs(false));
        return () => unsub();
    }, [show]);

    const handleSendFeedback = async () => {
        if (!feedbackText.trim() || !user) return;
        setSendingFeedback(true);
        try {
            await feedbackCollection.add({
                userId: user.uid,
                userName: userData?.displayName || 'User',
                userPhoto: userData?.photoURL || '',
                text: feedbackText.trim(),
                rating: feedbackRating,
                createdAt: TS(),
                status: 'new',
            });
            setFeedbackText('');
            setFeedbackRating(5);
            onNotification(lang==='ar' ? '✅ شكراً على رأيك!' : '✅ Thanks for your feedback!');
        } catch(e) { onNotification(lang==='ar' ? '❌ خطأ' : '❌ Error'); }
        setSendingFeedback(false);
    };

    if (!show) return null;

    const tabs = [
        { id: 'faq',      icon: '❓', label_ar: 'الأسئلة الشائعة', label_en: 'FAQ' },
        { id: 'tickets',  icon: '🎫', label_ar: 'التذاكر',          label_en: 'Tickets' },
        { id: 'feedback', icon: '📝', label_ar: 'فيدباك',           label_en: 'Feedback' },
    ];

    return (
        <PortalModal>
            <div style={{position:'fixed',inset:0,zIndex:Z.MODAL_HIGH,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'8px'}} onClick={onClose}>
                <div onClick={e=>e.stopPropagation()} style={{
                    width:'100%',maxWidth:'min(440px, calc(100vw - 16px))',maxHeight:'92vh',
                    background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                    border:'1px solid rgba(0,242,255,0.15)',borderRadius:'20px',overflow:'hidden',
                    display:'flex',flexDirection:'column',boxShadow:'0 28px 80px rgba(0,0,0,0.9)',
                    boxSizing:'border-box',
                }}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>💬</div>
                            <div>
                                <div style={{fontSize:'16px',fontWeight:900,color:'#e2e8f0'}}>{lang==='ar'?'مركز المساعدة':'Help Center'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'أسئلة، تذاكر، آراء':'FAQ, tickets & feedback'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'6px 10px',color:'#9ca3af',fontSize:'16px',cursor:'pointer'}}>✕</button>
                    </div>
                    {/* Tabs */}
                    <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0,background:'rgba(0,0,0,0.2)'}}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                flex:1,padding:'11px 0',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:700,
                                background:'transparent',
                                color:activeTab===tab.id?'#00f2ff':'#6b7280',
                                borderBottom:activeTab===tab.id?'2px solid #00f2ff':'2px solid transparent',
                                transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',
                            }}>
                                <span>{tab.icon}</span><span>{lang==='ar'?tab.label_ar:tab.label_en}</span>
                            </button>
                        ))}
                    </div>
                    {/* Content */}
                    <div style={{flex:1,overflowY:'auto'}}>

                        {/* ── FAQ TAB ── */}
                        {activeTab === 'faq' && (
                            <div style={{padding:'14px 16px'}}>
                                {loadingFaqs ? (
                                    <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>
                                ) : faqs.length === 0 ? (
                                    <div style={{textAlign:'center',padding:'40px',color:'#4b5563'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>❓</div>
                                        <div style={{fontSize:'13px',fontWeight:600,color:'#6b7280'}}>{lang==='ar'?'لا توجد أسئلة بعد':'No FAQs yet'}</div>
                                    </div>
                                ) : faqs.map(faq => (
                                    <div key={faq.id} style={{marginBottom:'8px',borderRadius:'14px',overflow:'hidden',border:`1px solid ${openFaq===faq.id?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.07)'}`,background:openFaq===faq.id?'rgba(0,242,255,0.05)':'rgba(255,255,255,0.03)'}}>
                                        <button onClick={()=>setOpenFaq(openFaq===faq.id?null:faq.id)} style={{
                                            width:'100%',padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
                                            background:'none',border:'none',cursor:'pointer',textAlign:'left',
                                        }}>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px',flex:1}}>
                                                <span style={{fontSize:'18px',flexShrink:0}}>{faq.emoji||'❓'}</span>
                                                <span style={{fontSize:'13px',fontWeight:700,color:openFaq===faq.id?'#00f2ff':'#e2e8f0',flex:1,textAlign:'left'}}>{lang==='ar'?faq.question_ar:faq.question_en}</span>
                                            </div>
                                            <span style={{fontSize:'14px',color:openFaq===faq.id?'#00f2ff':'#6b7280',flexShrink:0,marginLeft:'8px',transform:openFaq===faq.id?'rotate(180deg)':'none',transition:'transform 0.2s'}}>▾</span>
                                        </button>
                                        {openFaq === faq.id && (
                                            <div style={{padding:'0 16px 14px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                                                <div style={{fontSize:'12px',color:'#9ca3af',lineHeight:1.7,paddingTop:'10px'}}>{lang==='ar'?faq.answer_ar:faq.answer_en}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── TICKETS TAB ── */}
                        {activeTab === 'tickets' && (
                            <div>
                                {!isLoggedIn ? (
                                    <div style={{textAlign:'center',padding:'40px 24px',color:'#6b7280'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>🔐</div>
                                        <div style={{fontSize:'13px'}}>{lang==='ar'?'يجب تسجيل الدخول لإرسال تذكرة':'Login required to submit tickets'}</div>
                                    </div>
                                ) : (
                                    <div style={{padding:'0'}}>
                                        <SupportTicketSection user={user} userData={userData} lang={lang} onNotification={onNotification} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── FEEDBACK TAB ── */}
                        {activeTab === 'feedback' && (
                            <div style={{padding:'16px'}}>
                                {!isLoggedIn ? (
                                    <div style={{textAlign:'center',padding:'40px 24px',color:'#6b7280'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>🔐</div>
                                        <div style={{fontSize:'13px'}}>{lang==='ar'?'يجب تسجيل الدخول':'Login required'}</div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{marginBottom:'16px',textAlign:'center'}}>
                                            <div style={{fontSize:'14px',fontWeight:700,color:'#e2e8f0',marginBottom:'6px'}}>📝 {lang==='ar'?'شاركنا رأيك':'Share your feedback'}</div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'رأيك يساعدنا على التحسين':'Your opinion helps us improve'}</div>
                                        </div>
                                        {/* Rating stars */}
                                        <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'16px'}}>
                                            {[1,2,3,4,5].map(star => (
                                                <button key={star} onClick={()=>setFeedbackRating(star)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'28px',opacity:feedbackRating>=star?1:0.3,transition:'all 0.15s',filter:feedbackRating>=star?'drop-shadow(0 0 6px rgba(251,191,36,0.8))':'none'}}>⭐</button>
                                            ))}
                                        </div>
                                        <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value.slice(0,500))}
                                            style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',resize:'vertical',minHeight:'100px',outline:'none',boxSizing:'border-box',marginBottom:'10px',lineHeight:1.6}}
                                            placeholder={lang==='ar'?'اكتب رأيك هنا...':'Write your feedback here...'} />
                                        <div style={{fontSize:'10px',color:'#4b5563',textAlign:'right',marginBottom:'12px'}}>{feedbackText.length}/500</div>
                                        <button onClick={handleSendFeedback} disabled={sendingFeedback||!feedbackText.trim()}
                                            style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',background:feedbackText.trim()?'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.22))':'rgba(255,255,255,0.05)',color:feedbackText.trim()?'#00f2ff':'#4b5563',fontSize:'13px',fontWeight:800,cursor:feedbackText.trim()?'pointer':'default',transition:'all 0.2s',opacity:sendingFeedback?0.6:1}}>
                                            {sendingFeedback?'⏳...':`📤 ${lang==='ar'?'إرسال الفيدباك':'Send Feedback'}`}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

window.HelpCenterModal = HelpCenterModal;
