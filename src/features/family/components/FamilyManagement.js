var FamilyService = window.FamilyService;
var FamilyConstants = window.FamilyConstants;
var { FAMILY_ROLE_CONFIG, FAMILY_SIGN_LEVELS } = FamilyConstants;
var { useState, useEffect, useRef } = React;

var FamilyManagement = ({
    family,
    currentUID,
    lang,
    canManage: propCanManage,
    myRole: propMyRole,
    familyMembers,
    joinRequesterProfiles,
    S,
    Z,
    onNotification,
    onUpdateFamily,
    onLeaveFamily,
    onDeleteFamily
}) => {
    var myRole = propMyRole || window.FamilyConstants.getFamilyRole(family, currentUID);
    var canManage = propCanManage || (myRole === 'owner' || myRole === 'admin');
    
    // Fallback notification if not provided
    var notify = onNotification || window.showNotification || (() => {});
    const [editName, setEditName] = React.useState(family?.name || '');
    const [editTag, setEditTag] = React.useState(family?.tag || '');
    const [editDesc, setEditDesc] = React.useState(family?.description || '');
    const [editAnnouncement, setEditAnnouncement] = React.useState(family?.announcement || '');
    const [joinMode, setJoinMode] = React.useState(family?.joinMode || 'open');
    const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
    const [savingInfo, setSavingInfo] = React.useState(false);
    const [savingTag, setSavingTag] = React.useState(false);
    const [savingAnn, setSavingAnn] = React.useState(false);
    const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = React.useState(false);
    var photoFileRef = React.useRef(null);

    React.useEffect(() => {
        if (family) {
            setEditName(family.name || '');
            setEditTag(family.tag || '');
            setEditDesc(family.description || '');
            setEditAnnouncement(family.announcement || '');
            setJoinMode(family.joinMode || 'open');
        }
    }, [family]);

    var handlePhotoUpload = async (e) => {
        var file = e.target.files?.[0];
        if (!file || !family?.id || !canManage) return;
        setUploadingPhoto(true);
        try {
            var base64 = await FamilyService.handleImageUpload(file);
            await FamilyService.saveInfo({
                family,
                updates: { photoURL: base64 },
                currentUID
            });
            onNotification(lang === 'ar' ? '✅ تم تحديث صورة العائلة' : '✅ Family photo updated');
        } catch (err) {
            onNotification(lang === 'ar' ? '❌ خطأ في الرفع' : '❌ Upload error');
        }
        setUploadingPhoto(false);
    };

    var saveInfo = async () => {
        if (!family?.id || !canManage || !editName.trim()) return;
        setSavingInfo(true);
        try {
            await FamilyService.saveInfo({
                family,
                updates: {
                    name: editName.trim(),
                    description: editDesc.trim(),
                    joinMode: joinMode
                },
                currentUID
            });
            onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ في الحفظ' : '❌ Save error');
        }
        setSavingInfo(false);
    };

    var handleSaveTag = async () => {
        if (!family?.id || !canManage || !editTag.trim()) return;
        if (editTag.length < 3) {
            onNotification(lang === 'ar' ? '❌ الوسم 3 أحرف على الأقل' : '❌ Tag: min 3 chars');
            return;
        }
        setSavingTag(true);
        try {
            await FamilyService.saveTag({ family, newTag: editTag, currentUID });
            onNotification(lang === 'ar' ? '✅ تم تغيير الوسم' : '✅ Tag updated');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ الوسم مستخدم بالفعل' : '❌ Tag already taken');
        }
        setSavingTag(false);
    };

    var saveAnnouncement = async () => {
        if (!family?.id || !canManage) return;
        setSavingAnn(true);
        try {
            await FamilyService.saveInfo({
                family,
                updates: { announcement: editAnnouncement.trim(), announcementBy: familyMembers.find(m => m.id === currentUID)?.displayName || 'Admin' },
                currentUID
            });
            onNotification(lang === 'ar' ? '✅ تم حفظ الإعلان' : '✅ Announcement saved');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
        setSavingAnn(false);
    };

    var handleJoinRequest = async (targetUID, accept) => {
        try {
            await FamilyService.handleJoinRequest({ family, targetUID, accept, lang });
            onNotification(accept ? (lang === 'ar' ? '✅ تم قبول العضو' : '✅ Member accepted') : (lang === 'ar' ? '❌ تم رفض الطلب' : '❌ Request rejected'));
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    var handleKickMember = async (targetUID) => {
        if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من طرد هذا العضو؟' : 'Are you sure you want to kick this member?')) return;
        try {
            await FamilyService.kickMember({ family, targetUID, currentUID, lang });
            onNotification(lang === 'ar' ? '✅ تم الطرد' : '✅ Member kicked');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    var handleDeleteFamily = async () => {
        try {
            await FamilyService.deleteFamily({ family, currentUID });
            onNotification(lang === 'ar' ? '✅ تم حذف العائلة' : '✅ Family deleted');
            if (onDeleteFamily) onDeleteFamily();
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    var handleLeaveFamily = async () => {
        if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من مغادرة العائلة؟' : 'Are you sure you want to leave the family?')) return;
        try {
            await FamilyService.leaveFamily({ family, currentUID, currentUserData: familyMembers.find(m => m.id === currentUID), lang });
            onNotification(lang === 'ar' ? '✅ غادرت العائلة' : '✅ Left family');
            if (onLeaveFamily) onLeaveFamily();
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : (e.message || '❌ Error'));
        }
    };

    var requests = family?.joinRequests || [];
    var fLvl = FamilyService.getFamilyLevelConfig(family.level || 1);
    var signData = FamilyService.getFamilySignLevelData(family.lastWeekActiveness || 0) || { level: 0, color: '#4b5563', name_ar: 'بدون شارة', name_en: 'No Sign', threshold: 0 };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* ── Non-admin notice ── */}
            {!canManage && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                    👀 {lang === 'ar' ? 'يمكنك الاطلاع فقط · التعديل للمسؤولين' : 'View only · Editing is for admins'}
                </div>
            )}

            {/* ── Edit Family Info ── */}
            <div style={S.card}>
                <div style={S.sectionTitle}>📝 {lang === 'ar' ? 'معلومات العائلة' : 'Family Info'}</div>

                {/* Photo Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: `2px solid ${fLvl?.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                        {family.photoURL ? <img src={family.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (family.emblem || '🏠')}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>🖼️ {lang === 'ar' ? 'صورة العائلة' : 'Family Photo'}</div>
                        {canManage && (
                            <>
                                <input type="file" ref={photoFileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                                <button onClick={() => photoFileRef.current?.click()} disabled={uploadingPhoto} style={{ ...S.btn, padding: '6px 12px', fontSize: '11px', background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', color: '#00f2ff' }}>
                                    {uploadingPhoto ? '⏳' : (lang === 'ar' ? '📷 رفع صورة' : '📷 Upload Photo')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>🏠 {lang === 'ar' ? 'اسم العائلة' : 'Family Name'}</div>
                    {canManage
                        ? <input value={editName} onChange={e => setEditName(e.target.value)} maxLength={10} style={S.input} />
                        : <div style={{ ...S.input, color: '#d1d5db', cursor: 'default' }}>{family.name}</div>
                    }
                </div>
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>🏷️ {lang === 'ar' ? 'وسم القبيلة (Tag)' : 'Family Tag'}</div>
                    {canManage ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                value={editTag}
                                onChange={e => setEditTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                                maxLength={5}
                                style={{ ...S.input, flex: 1, letterSpacing: '3px', fontWeight: 800, color: '#00f2ff', fontSize: '14px' }}
                                placeholder='TAG'
                            />
                            <button onClick={handleSaveTag} disabled={savingTag || !editTag.trim()} style={{ ...S.btn, padding: '8px 14px', fontSize: '11px', background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', flexShrink: 0 }}>
                                {savingTag ? '⏳' : (lang === 'ar' ? 'حفظ' : 'Save')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ ...S.input, color: '#00f2ff', cursor: 'default', letterSpacing: '3px', fontWeight: 800 }}>{family.tag}</div>
                    )}
                    <div style={{ fontSize: '9px', color: '#4b5563', marginTop: '3px' }}>
                        {lang === 'ar' ? '3-5 أحرف إنجليزية أو أرقام' : '3-5 English letters or numbers'}
                    </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>📝 {lang === 'ar' ? 'الوصف' : 'Description'}</div>
                    {canManage
                        ? <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={150} rows={2} style={{ ...S.input, resize: 'none', lineHeight: 1.5 }} />
                        : <div style={{ ...S.input, color: '#d1d5db', cursor: 'default', minHeight: '48px', lineHeight: 1.5 }}>{family.description || '—'}</div>
                    }
                </div>
                {/* Join mode */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>🚪 {lang === 'ar' ? 'إعدادات الانضمام' : 'Join Settings'}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[['open', lang === 'ar' ? '🟢 مفتوح' : '🟢 Open'], ['approval', lang === 'ar' ? '🔐 بموافقة' : '🔐 Approval']].map(([mode, label]) => (
                            <button key={mode} onClick={() => canManage && setJoinMode(mode)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: `1px solid ${joinMode === mode ? 'rgba(0,242,255,0.4)' : 'rgba(255,255,255,0.1)'}`, background: joinMode === mode ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.04)', color: joinMode === mode ? '#00f2ff' : '#6b7280', fontSize: '11px', fontWeight: joinMode === mode ? 800 : 500, cursor: canManage ? 'pointer' : 'default' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                {canManage && (
                    <button onClick={saveInfo} disabled={savingInfo} style={{ ...S.btn, width: '100%', padding: '9px', fontSize: '12px', background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {savingInfo ? '⏳' : `💾 ${lang === 'ar' ? 'حفظ المعلومات' : 'Save Info'}`}
                    </button>
                )}
            </div>

            {/* ── Family Sign — Weekly Activeness System ── */}
            <div style={S.card}>
                <div style={S.sectionTitle}>🏴 {lang === 'ar' ? 'شارة القبيلة' : 'Family Sign'}</div>

                {/* Overview header */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#00f2ff', marginBottom: '2px' }}>
                        {window.fmtFamilyNum ? window.fmtFamilyNum(family.weeklyActiveness || 0) : (family.weeklyActiveness || 0)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {lang === 'ar'
                            ? 'النشاط الأسبوعي (يُصفَّر كل أحد 0:00 GMT+3)'
                            : 'Weekly Activeness (Clears every Sunday at 0:00 GMT+3)'}
                    </div>
                </div>

                {/* 5 sign levels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {FAMILY_SIGN_LEVELS.map(sl => {
                        var slImg = FamilyService.getFamilySignImage(sl.level);
                        var wAct = family.weeklyActiveness || 0;
                        var isEarned = wAct >= sl.threshold;
                        var isCurrent = signData && signData.level === sl.level;
                        var isNext = signData ? sl.level === signData.level + 1 : sl.level === 1;
                        return (
                            <div key={sl.level} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '12px',
                                background: isCurrent
                                    ? `linear-gradient(135deg,${sl.color}22,${sl.color}10)`
                                    : isEarned ? `${sl.color}10` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isCurrent ? sl.color + '66' : isEarned ? sl.color + '30' : 'rgba(255,255,255,0.07)'}`,
                                position: 'relative', overflow: 'hidden',
                            }}>
                                {/* Sign image or placeholder */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, overflow: 'hidden',
                                    background: isEarned ? sl.bg : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${isEarned ? sl.color + '44' : 'rgba(255,255,255,0.08)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    filter: isEarned ? 'none' : 'grayscale(1) opacity(0.4)',
                                }}>
                                    {slImg
                                        ? <img src={slImg} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                        : <span style={{ fontSize: '22px' }}>{sl.defaultIcon}</span>
                                    }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: isEarned ? sl.color : '#4b5563' }}>
                                        {lang === 'ar' ? sl.name_ar : sl.name_en}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>
                                        {lang === 'ar' ? 'النشاط المطلوب:' : 'Required Activeness:'}&nbsp;
                                        <span style={{ color: isEarned ? '#4ade80' : sl.color, fontWeight: 700 }}>
                                            {sl.threshold.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {/* Status badge */}
                                {isCurrent && (
                                    <div style={{
                                        fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
                                        background: `${sl.color}25`, color: sl.color, border: `1px solid ${sl.color}50`,
                                        flexShrink: 0,
                                    }}>✓ {lang === 'ar' ? 'الحالي' : 'Current'}</div>
                                )}
                                {isNext && !isEarned && (
                                    <div style={{
                                        fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
                                        background: 'rgba(0,242,255,0.15)', color: '#00f2ff',
                                        border: '1px solid rgba(0,242,255,0.4)', flexShrink: 0,
                                    }}>{lang === 'ar' ? 'الأسبوع القادم' : 'Get next week'}</div>
                                )}
                                {isEarned && !isCurrent && (
                                    <div style={{ fontSize: '16px', flexShrink: 0 }}>✅</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Announcement ── */}
            <div style={S.card}>
                <div style={S.sectionTitle}>📢 {lang === 'ar' ? 'الإعلان' : 'Announcement'}</div>
                {canManage ? (
                    <>
                        <textarea value={editAnnouncement} onChange={e => setEditAnnouncement(e.target.value)} maxLength={300} rows={4}
                            style={{ ...S.input, resize: 'none', lineHeight: 1.6, fontSize: '12px' }}
                            placeholder={lang === 'ar' ? 'اكتب إعلانك هنا...' : 'Write your announcement here...'} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#4b5563' }}>{editAnnouncement.length}/300</span>
                            <button onClick={saveAnnouncement} disabled={savingAnn} style={{ ...S.btn, background: 'rgba(0,242,255,0.12)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', padding: '7px 16px', fontSize: '11px' }}>
                                {savingAnn ? '⏳' : (lang === 'ar' ? '💾 حفظ' : '💾 Save')}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, minHeight: '40px' }}>
                        {family.announcement || <span style={{ color: '#4b5563' }}>{lang === 'ar' ? 'لا يوجد إعلان' : 'No announcement'}</span>}
                    </div>
                )}
            </div>

            {/* ── Join Requests ── */}
            <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={S.sectionTitle}>📩 {lang === 'ar' ? 'طلبات الانضمام' : 'Join Requests'}</div>
                    {requests.length > 0 && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c', fontWeight: 700 }}>{requests.length}</span>}
                </div>
                {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#4b5563', fontSize: '11px' }}>{lang === 'ar' ? 'لا طلبات معلّقة' : 'No pending requests'}</div>
                ) : joinRequesterProfiles.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
                            {p.photoURL ? <img src={p.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>😎</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>{p.displayName}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>🏆 {p.stats?.wins || 0} &nbsp; ⭐ {p.charisma || 0}</div>
                        </div>
                        {canManage ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleJoinRequest(p.id, true)} style={{ ...S.btn, padding: '5px 10px', fontSize: '11px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}>✓</button>
                                <button onClick={() => handleJoinRequest(p.id, false)} style={{ ...S.btn, padding: '5px 10px', fontSize: '11px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>✕</button>
                            </div>
                        ) : (
                            <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>{lang === 'ar' ? 'معلّق' : 'Pending'}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Kick Members (owner only) ── */}
            {myRole === 'owner' && (
                <div style={S.card}>
                    <div style={S.sectionTitle}>⚡ {lang === 'ar' ? 'طرد عضو' : 'Kick Member'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {familyMembers.filter(m => m.id !== currentUID && m.id !== family.createdBy).map(m => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                    {m.photoURL ? <img src={m.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>😎</span>}
                                </div>
                                <div style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>{m.displayName}</div>
                                {window.FamilyRoleBadge ? <window.FamilyRoleBadge role={FamilyService.getFamilyRole(family, m.id)} lang={lang} small /> : <span style={{fontSize:'10px', color:'#9ca3af'}}>{FamilyService.getFamilyRole(family, m.id)}</span>}
                                <button onClick={() => handleKickMember(m.id)} style={{ ...S.btn, padding: '4px 10px', fontSize: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                    {lang === 'ar' ? 'طرد' : 'Kick'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Leave Family — always at bottom ── */}
            <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={handleLeaveFamily}
                    style={{ ...S.btn, width: '100%', padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.65)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    🚪 {lang === 'ar' ? 'مغادرة العائلة' : 'Leave Family'}
                </button>
                <div style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center', marginTop: '6px' }}>{lang === 'ar' ? 'لا يمكن التراجع عن هذا القرار' : 'This action cannot be undone'}</div>
            </div>

            {/* ── Delete Family (Owner only) ── */}
            {FamilyService.getFamilyRole(family, currentUID) === 'owner' && (
                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <button
                        onClick={() => setShowDeleteFamilyConfirm(true)}
                        style={{ ...S.btn, width: '100%', padding: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        🗑️ {lang === 'ar' ? 'حذف العائلة نهائياً' : 'Delete Family Permanently'}
                    </button>
                    <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
                        {lang === 'ar' ? 'سيتم حذف العائلة وطرد جميع الأعضاء' : 'All members will be removed and family deleted'}
                    </div>
                </div>
            )}

            {/* ── Delete Family Confirm Modal ── */}
            {showDeleteFamilyConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                }} onClick={() => setShowDeleteFamilyConfirm(false)}>
                    <div style={{
                        background: 'linear-gradient(135deg,#1a0808,#0f0505)',
                        border: '2px solid rgba(239,68,68,0.5)',
                        borderRadius: '20px', padding: '28px 24px',
                        maxWidth: '320px', width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 0 50px rgba(239,68,68,0.3)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
                            {lang === 'ar' ? 'حذف العائلة' : 'Delete Family'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '6px' }}>
                            {lang === 'ar'
                                ? `هل أنت متأكد من حذف "${family?.name || ''}"؟ سيتم طرد جميع الأعضاء وحذف كل البيانات نهائياً.`
                                : `Are you sure you want to delete "${family?.name || ''}"? All members will be removed and all data will be permanently deleted.`
                            }
                        </div>
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '20px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {lang === 'ar' ? '⚠️ هذا الإجراء لا يمكن التراجع عنه' : '⚠️ This action cannot be undone'}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowDeleteFamilyConfirm(false)}
                                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                {lang === 'ar' ? 'تراجع' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleDeleteFamily}
                                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                                {lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.FamilyManagement = FamilyManagement;
