/**
 * FamilyProfile.js - Component for displaying the family's profile/home tab.
 */
var FamilyProfile = ({
    family,
    familyMembers,
    currentUID,
    currentUserData,
    userData,
    lang,
    onUpdateInfo,
    isReadOnly,
    showDonatePanel,
    setShowDonatePanel
}) => {
    if (!family) return null;
    if (!familyMembers) familyMembers = family.members || [];
    if (isReadOnly === undefined) isReadOnly = false;

    var photoFileRef = React.useRef(null);
    var onNotification = window.showNotification || (() => {});

    var fLvl = window.FamilyConstants.getFamilyLevelConfig(family.level || 1);
    var myRole = window.FamilyConstants.getFamilyRole(family, currentUID);
    var canManage = myRole === 'owner' || myRole === 'admin';

    var handlePhotoUpload = async (e) => {
        var file = e.target.files[0];
        if (!file) return;
        try {
            var dataUrl = await window.FamilyService.handleImageUpload(file);
            await window.FamilyService.saveInfo({ family, updates: { photoURL: dataUrl }, currentUID });
            onNotification(lang === 'ar' ? '✅ تم تحديث الصورة' : '✅ Photo updated');
        } catch (err) {
            console.error(err);
        }
    };
    
    // signData: based on lastWeekActiveness (last week's activity → this week's sign)
    var SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    var lastWeekAct = family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : (family.weeklyActiveness || 0);
    var signData = window.FamilyConstants.getFamilySignLevelData(lastWeekAct) || SIGN_FALLBACK;

    return (
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', background:'#0d0d1f'}}>

            {/* ── Family Hero Card ── */}
            <div style={{
                background: family.photoURL ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.6)),url(${family.photoURL}) center/cover no-repeat` : 'linear-gradient(135deg,#1a1040,#0a0a2e)',
                padding:'18px 16px 14px', position:'relative',
            }}>
                <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                    {/* Photo */}
                    <div style={{position:'relative',flexShrink:0}}>
                        <div style={{width:'64px',height:'64px',borderRadius:'16px',border:`3px solid ${fLvl.color}`,overflow:'hidden',background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'30px',boxShadow:`0 0 20px ${fLvl.color}66`}}>
                            {family.photoURL ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (family.emblem || '🏠')}
                        </div>
                        {canManage && <button onClick={()=>photoFileRef.current?.click()} style={{position:'absolute',bottom:'-4px',right:'-4px',width:'22px',height:'22px',borderRadius:'50%',background:'rgba(0,242,255,0.9)',border:'2px solid #0d0d1f',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'11px'}}>📷</button>}
                        <input ref={photoFileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload}/>
                    </div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px',flexWrap:'wrap'}}>
                            <span style={{fontSize:'20px',fontWeight:900,color:'white',fontStyle:'italic',fontFamily:"'Outfit',sans-serif"}}>{family.name}</span>
                            {signData.level > 0 && <window.FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                        </div>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.6)',marginBottom:'4px'}}>ID · {family.id?.slice(-6).toUpperCase()}</div>
                        {/* Weekly Rank badge */}
                        {family.weeklyRank && (
                            <div style={{display:'inline-flex',alignItems:'center',gap:'4px',background:'rgba(255,215,0,0.2)',border:'1px solid rgba(255,215,0,0.5)',borderRadius:'20px',padding:'2px 10px',fontSize:'10px',fontWeight:800,color:'#ffd700'}}>
                                🏅 {lang==='ar'?'الترتيب الأسبوعي':'Weekly Rank'}: {family.weeklyRank}
                            </div>
                        )}
                    </div>
                </div>

                {/* Level Badge — supports imageURL */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'12px',flexWrap:'wrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'5px',background:`${fLvl.color}22`,border:`1px solid ${fLvl.color}66`,borderRadius:'20px',padding:'3px 10px'}}>
                        {fLvl.imageURL
                            ? <img src={fLvl.imageURL} alt="" style={{width:'18px',height:'18px',objectFit:'contain'}}/>
                            : <span style={{fontSize:'14px'}}>{fLvl.icon}</span>}
                        <span style={{color:fLvl.color,fontSize:'10px',fontWeight:900}}>LV.{fLvl.level} {lang==='ar'?fLvl.name_ar:fLvl.name_en}</span>
                    </div>
                    <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>👥 {family.members?.length||0}/{fLvl.maxMembers}</div>
                    {myRole && window.FamilyRoleBadge && <window.FamilyRoleBadge role={myRole} lang={lang} small />}
                </div>
            </div>

            <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>

            {/* ── Extracted Family Treasury Component ── */}
            <window.FamilyTreasury 
                family={family}
                familyMembers={familyMembers}
                currentUID={currentUID}
                currentUserData={currentUserData}
                lang={lang}
                canManage={canManage}
                onNotification={onNotification}
                isReadOnly={isReadOnly}
                showDonatePanel={showDonatePanel}
                setShowDonatePanel={setShowDonatePanel}
            />

            <div style={{height:'8px'}}/>
            </div>

            {/* ── Announcement ── */}
            {family.announcement && (
                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'16px',padding:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
                    <span style={{fontSize:'13px',fontWeight:800,color:'#e2e8f0',borderLeft:'3px solid #f59e0b',paddingLeft:'8px',display:'block',marginBottom:'8px'}}>📢 {lang==='ar'?'الإعلان':'Announcement'}</span>
                    <div style={{fontSize:'13px',color:'#d1d5db',lineHeight:1.7,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
                        {family.announcementBy && <span style={{fontSize:'10px',color:'#9ca3af',display:'block',marginBottom:'4px'}}>{lang==='ar'?'بواسطة:':'By:'} {family.announcementBy}</span>}
                        {family.announcement}
                    </div>
                </div>
            )}

            {/* ── Join button for external view ── */}
            {isReadOnly && !currentUserData?.familyId && (
                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'16px',padding:'18px',textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
                    <div style={{fontSize:'32px',marginBottom:'8px'}}>🏠</div>
                    <div style={{fontSize:'13px',fontWeight:800,color:'#e2e8f0',marginBottom:'12px'}}>{lang==='ar'?'انضم لهذه العائلة':'Join this Family'}</div>
                    <button onClick={()=>setView('join')} style={{padding:'10px 28px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#00f2ff,#7000ff)',color:'white',fontSize:'13px',fontWeight:800,cursor:'pointer'}}>
                        ➕ {lang==='ar'?'انضم الآن':'Join Now'}
                    </button>
                </div>
            )}

            <div style={{height:'8px'}}/>
        </div>
    );
};

window.FamilyProfile = FamilyProfile;
