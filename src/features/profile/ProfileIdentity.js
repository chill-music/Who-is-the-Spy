// ════════════════════════════════════════════════════════════
// 🏗️ PROFILE IDENTITY COMPONENT
// ════════════════════════════════════════════════════════════
var ProfileIdentity = ({
    targetData,
    targetUID,
    lang,
    onOpenFamily,
    onOpenProfile,
    setShowRoleInfoPopup,
    copiedId,
    setCopiedId,
    userData, // viewer data
    isOwnProfile
}) => {
    return (
        <div className="profile-identity">
            {/* ══ ROW 0: Staff Role Badge (if any) ══ */}
            {getUserRole(targetData, targetUID) && (
                <div style={{display:'flex', justifyContent:'center', marginBottom:'4px'}}>
                    <StaffRoleBadge
                        userData={targetData}
                        uid={targetUID}
                        lang={lang}
                        size="md"
                        onClick={() => setShowRoleInfoPopup(true)}
                    />
                </div>
            )}

            {/* ══ ROW 1: الاسم + VIP Badge (وسط) ══ */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', flexWrap:'wrap', marginBottom:'6px'}}>
                <VIPName
                    displayName={targetData?.displayName || 'Unknown'}
                    userData={targetData}
                    className="profile-name"
                />
                <VIPBadge userData={targetData} size="md" onClick={(lvl) => {}} />
            </div>

            {/* ══ ROW 2: الجنس + الكاريزما + فاميلي ساين (يسار) | البلد (يمين) ══ */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'6px', padding:'0 8px', marginBottom:'6px', minHeight:'26px'}}>
                {/* يسار: الجنس + الكاريزما + فاميلي ساين */}
                <div style={{display:'flex', alignItems:'center', gap:'6px', flexShrink:0, flexWrap:'wrap'}}>
                    {targetData?.gender === 'male' && (
                        <span style={{fontSize:'18px', color:'#60a5fa', lineHeight:1}}>♂️</span>
                    )}
                    {targetData?.gender === 'female' && (
                        <span style={{fontSize:'18px', color:'#f472b6', lineHeight:1}}>♀️</span>
                    )}
                    {/* الكاريزما مباشرة بعد الجنس */}
                    {(() => {
                        var { currentLevel: lvlData } = getCharismaLevel(targetData?.charisma || 0);
                        if (!lvlData) return null;
                        var hasGlow = lvlData.hasGlow;
                        var isDivine = lvlData.isDivine;
                        return (
                            <div style={{
                                display:'flex', alignItems:'center', gap:'4px',
                                padding:'3px 10px', borderRadius:'20px',
                                background: isDivine ? 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))' : hasGlow ? `${lvlData.color}18` : 'rgba(255,255,255,0.06)',
                                border: isDivine ? '1px solid rgba(0,212,255,0.4)' : hasGlow ? `1px solid ${lvlData.color}55` : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: isDivine ? '0 0 10px rgba(0,212,255,0.25)' : hasGlow ? `0 0 8px ${lvlData.color}44` : 'none',
                                flexShrink:0,
                            }}>
                                {lvlData.iconType === 'image' && lvlData.iconUrl
                                    ? <img src={lvlData.iconUrl} alt="" style={{width:'16px', height:'16px', borderRadius: isDivine ? '50%' : '0', objectFit:'cover'}} />
                                    : <span style={{fontSize:'13px'}}>{lvlData.icon}</span>
                                }
                                <span style={{fontSize:'10px', fontWeight:800, color: isDivine ? '#00d4ff' : lvlData.color}}>
                                    Lv.{lvlData.level}
                                </span>
                            </div>
                        );
                    })()}
                    {/* فاميلي ساين جنب الكاريزما على الشمال */}
                    {targetData?.familyTag && window.FamilySignBadge && (
                        <div style={{transform:'scale(0.9)', transformOrigin:'left center'}}>
                            <window.FamilySignBadge
                                tag={targetData.familyTag}
                                color={targetData.familySignColor || window.FamilyConstants?.getFamilySignLevelDataByLevel?.(targetData.familySignLevel || 1)?.color || '#6b7280'}
                                signLevel={targetData.familySignLevel || 1}
                                imageURL={window.FamilyConstants?.getFamilySignImage?.(0, targetData.familySignLevel || 1)}
                                small={true}
                                onClick={onOpenFamily ? () => onOpenFamily(targetData?.familyId) : undefined}
                            />
                        </div>
                    )}
                </div>
                {/* يمين: البلد فقط */}
                <div style={{display:'flex', alignItems:'center', gap:'4px', flexShrink:0}}>
                    {targetData?.country?.flag && (
                        <FlagDisplay
                            countryCode={targetData.country.code}
                            flagEmoji={targetData.country.flag}
                            size={22}
                        />
                    )}
                </div>
            </div>

            {/* ══ ROW 4: ID على الشمال — صورة داخل الـ pill لو موجودة ══ */}
            {(() => {
                var vipLvl = window.getVIPLevel(targetData);
                var vipCfg = vipLvl > 0 ? VIP_CONFIG.find(v => v.level === vipLvl) : null;
                var idBeforeImg = vipCfg?.idBeforeImageUrl || null;
                var idIconImg = (vipLvl >= 6
                    ? (vipCfg?.idIconImageUrl || (typeof VIP_ID_ICONS !== 'undefined' ? VIP_ID_ICONS[vipLvl] : null) || null)
                    : null) || (typeof ID_ICON_IMAGE_URL !== 'undefined' ? ID_ICON_IMAGE_URL : null);
                var idValue = targetData?.customId || targetUID?.substring(0, 8);
                return (
                    <div style={{display:'flex', alignItems:'center', justifyContent:'flex-start', gap:'6px', marginBottom:'6px', padding:'0 8px'}}>
                        {idBeforeImg && (
                            <img src={idBeforeImg} alt="vip-id" style={{height:'22px', objectFit:'contain', flexShrink:0}} />
                        )}
                        <span
                            className="profile-id-display"
                            style={{margin:0, display:'inline-flex', alignItems:'center', gap:'5px', cursor:'pointer'}}
                            onClick={() => {
                                navigator.clipboard.writeText(idValue);
                                setCopiedId(true);
                                setTimeout(() => setCopiedId(false), 2000);
                            }}
                        >
                            {copiedId ? (
                                lang === 'ar' ? '✓ تم النسخ!' : '✓ Copied!'
                            ) : idIconImg ? (
                                <>
                                    <img src={idIconImg} alt="id-icon"
                                        style={{width:'24px', height:'24px', borderRadius:'50%', objectFit:'cover', flexShrink:0, filter:'drop-shadow(0 0 4px rgba(0,242,255,0.5))'}} />
                                    {idValue}
                                </>
                            ) : (
                                `ID: ${idValue}`
                            )}
                        </span>
                    </div>
                );
            })()}

            {/* ══ ROW 5: البادجات (max 10) ══ */}
            <UserBadgesV11 equipped={targetData?.equipped} lang={lang} />

            {/* ══ ROW 6: التايتلز — كل التايتلز المفعّلة ══ */}
            <UserTitleV11 equipped={targetData?.equipped} lang={lang} />

            {/* ══ Charisma ══ */}
            <CharismaDisplay charisma={targetData?.charisma} lang={lang} />
        </div>
    );
};

window.ProfileIdentity = ProfileIdentity;
