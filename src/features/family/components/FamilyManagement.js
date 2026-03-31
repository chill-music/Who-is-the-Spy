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
  var FamilyService = window.FamilyService || {};
  var FamilyConstants = window.FamilyConstants || {};
  var { FAMILY_ROLE_CONFIG = {}, FAMILY_SIGN_LEVELS = [] } = FamilyConstants;

  // Late-bind helper functions
  var getFamilyRole = FamilyConstants.getFamilyRole || (() => 'member');
  var getFamilyLevelConfig = FamilyService.getFamilyLevelConfig || (() => ({}));
  var getFamilySignLevelData = FamilyService.getFamilySignLevelData || (() => null);

  var myRole = propMyRole || getFamilyRole(family, currentUID);
  var canManage = propCanManage || myRole === 'owner' || myRole === 'admin';
  var meProfile = familyMembers && familyMembers.find((m) => m.id === currentUID);
  var actorName = meProfile?.displayName || (lang === 'ar' ? 'مسؤول' : 'Admin');
  var actorPhoto = meProfile?.photoURL || null;
  var newsActor = (uid) => ({ uid: uid || currentUID, name: actorName, photo: actorPhoto });

  // Fallback notification if not provided
  var notify = onNotification || window.showToast || ((msg) => console.info('[FamilyMgmt]', msg));
  var [editName, setEditName] = React.useState(family?.name || '');
  var [editTag, setEditTag] = React.useState(family?.tag || '');
  var [editDesc, setEditDesc] = React.useState(family?.description || '');
  var [editAnnouncement, setEditAnnouncement] = React.useState(family?.announcement || '');
  var [joinMode, setJoinMode] = React.useState(family?.joinMode || 'open');
  var [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  var [savingInfo, setSavingInfo] = React.useState(false);
  var [savingTag, setSavingTag] = React.useState(false);
  var [savingAnn, setSavingAnn] = React.useState(false);
  var [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = React.useState(false);
  var [showLeaveFamilyConfirm, setShowLeaveFamilyConfirm] = React.useState(false);
  var [kickTargetUID, setKickTargetUID] = React.useState(null);
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
      FamilyService.postNews(family.id, 'settings_change',
      lang === 'ar' ? `${actorName} عدّل صورة القبيلة 🖼️` : `${actorName} updated the family photo 🖼️`,
      0, newsActor(currentUID));
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
      FamilyService.postNews(family.id, 'settings_change',
      lang === 'ar' ? `${actorName} عدّل اسم/وصف/انضمام القبيلة 📝` : `${actorName} edited family name/description/join mode 📝`,
      0, newsActor(currentUID));
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
      FamilyService.postNews(family.id, 'settings_change',
      lang === 'ar' ? `${actorName} غيّر وسم القبيلة إلى ${editTag} 🏷️` : `${actorName} changed family tag to ${editTag} 🏷️`,
      0, newsActor(currentUID));
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
        updates: { announcement: editAnnouncement.trim(), announcementBy: familyMembers.find((m) => m.id === currentUID)?.displayName || 'Admin' },
        currentUID
      });
      FamilyService.postNews(family.id, 'settings_change',
      lang === 'ar' ? `${actorName} عدّل إعلان القبيلة 📢` : `${actorName} updated the family announcement 📢`,
      0, newsActor(currentUID));
      onNotification(lang === 'ar' ? '✅ تم حفظ الإعلان' : '✅ Announcement saved');
    } catch (e) {
      onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
    }
    setSavingAnn(false);
  };

  var handleJoinRequest = async (targetUID, accept) => {
    try {
      await FamilyService.handleJoinRequest({ family, targetUID, accept, lang });
      onNotification(accept ? lang === 'ar' ? '✅ تم قبول العضو' : '✅ Member accepted' : lang === 'ar' ? '❌ تم رفض الطلب' : '❌ Request rejected');
    } catch (e) {
      onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
    }
  };

  var handleKickMember = async (targetUID) => {
    setKickTargetUID(targetUID);
  };

  var confirmKickMember = async () => {
    if (!kickTargetUID) return;
    var targetUID = kickTargetUID;
    setKickTargetUID(null);
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
    setShowLeaveFamilyConfirm(true);
  };

  var confirmLeaveFamily = async () => {
    setShowLeaveFamilyConfirm(false);
    try {
      await FamilyService.leaveFamily({ family, currentUID, currentUserData: familyMembers.find((m) => m.id === currentUID), lang });
      onNotification(lang === 'ar' ? '✅ غادرت العائلة' : '✅ Left family');
      if (onLeaveFamily) onLeaveFamily();
    } catch (e) {
      onNotification(lang === 'ar' ? '❌ خطأ' : e.message || '❌ Error');
    }
  };

  var requests = family?.joinRequests || [];
  var fLvl = getFamilyLevelConfig(family.level || 1);
  var signData = getFamilySignLevelData(family.lastWeekActiveness || 0) || { level: 0, color: '#4b5563', name_ar: 'بدون شارة', name_en: 'No Sign', threshold: 0 };

  var mainContent = (/*#__PURE__*/
    React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' } },

    !canManage && /*#__PURE__*/
    React.createElement("div", { style: { padding: '10px 14px', borderRadius: '10px', background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', fontSize: '11px', color: '#9ca3af', textAlign: 'center' } }, "\uD83D\uDC40 ",
    lang === 'ar' ? 'يمكنك الاطلاع فقط · التعديل للمسؤولين' : 'View only · Editing is for admins'
    ), /*#__PURE__*/



    React.createElement("div", { style: S.card }, /*#__PURE__*/
    React.createElement("div", { style: S.sectionTitle }, "\uD83D\uDCDD ", lang === 'ar' ? 'معلومات العائلة' : 'Family Info'), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, /*#__PURE__*/
    React.createElement("div", { style: { width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: `2px solid ${fLvl?.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' } },
    family.photoURL ? /*#__PURE__*/React.createElement("img", { src: family.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: "" }) : family.emblem || '🏠'
    ), /*#__PURE__*/
    React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' } }, "\uD83D\uDDBC\uFE0F ", lang === 'ar' ? 'صورة العائلة' : 'Family Photo'),
    canManage && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("input", { type: "file", ref: photoFileRef, style: { display: 'none' }, accept: "image/*", onChange: handlePhotoUpload }), /*#__PURE__*/
    React.createElement("button", { onClick: () => photoFileRef.current?.click(), disabled: uploadingPhoto, style: { ...S.btn, padding: '6px 12px', fontSize: '11px', background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', color: '#00f2ff' } },
    uploadingPhoto ? '⏳' : lang === 'ar' ? '📷 رفع صورة' : '📷 Upload Photo'
    )
    )

    )
    ), /*#__PURE__*/

    React.createElement("div", { style: { marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' } }, "\uD83C\uDFE0 ", lang === 'ar' ? 'اسم العائلة' : 'Family Name'),
    canManage ? /*#__PURE__*/
    React.createElement("input", { value: editName, onChange: (e) => setEditName(e.target.value), maxLength: 10, style: S.input }) : /*#__PURE__*/
    React.createElement("div", { style: { ...S.input, color: '#d1d5db', cursor: 'default' } }, family.name)

    ), /*#__PURE__*/
    React.createElement("div", { style: { marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' } }, "\uD83C\uDFF7\uFE0F ", lang === 'ar' ? 'وسم القبيلة (Tag)' : 'Family Tag'),
    canManage ? /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, /*#__PURE__*/
    React.createElement("input", {
      value: editTag,
      onChange: (e) => setEditTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)),
      maxLength: 5,
      style: { ...S.input, flex: 1, letterSpacing: '3px', fontWeight: 800, color: '#00f2ff', fontSize: '14px' },
      placeholder: "TAG" }
    ), /*#__PURE__*/
    React.createElement("button", { onClick: handleSaveTag, disabled: savingTag || !editTag.trim(), style: { ...S.btn, padding: '8px 14px', fontSize: '11px', background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', flexShrink: 0 } },
    savingTag ? '⏳' : lang === 'ar' ? 'حفظ' : 'Save'
    )
    ) : /*#__PURE__*/

    React.createElement("div", { style: { ...S.input, color: '#00f2ff', cursor: 'default', letterSpacing: '3px', fontWeight: 800 } }, family.tag), /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '9px', color: '#4b5563', marginTop: '3px' } },
    lang === 'ar' ? '3-5 أحرف إنجليزية أو أرقام' : '3-5 English letters or numbers'
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { marginBottom: '10px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' } }, "\uD83D\uDCDD ", lang === 'ar' ? 'الوصف' : 'Description'),
    canManage ? /*#__PURE__*/
    React.createElement("textarea", { value: editDesc, onChange: (e) => setEditDesc(e.target.value), maxLength: 150, rows: 2, style: { ...S.input, resize: 'none', lineHeight: 1.5 } }) : /*#__PURE__*/
    React.createElement("div", { style: { ...S.input, color: '#d1d5db', cursor: 'default', minHeight: '48px', lineHeight: 1.5 } }, family.description || '—')

    ), /*#__PURE__*/

    React.createElement("div", { style: { marginBottom: '10px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '6px' } }, "\uD83D\uDEAA ", lang === 'ar' ? 'إعدادات الانضمام' : 'Join Settings'), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', gap: '6px' } },
    [['open', lang === 'ar' ? '🟢 مفتوح' : '🟢 Open'], ['approval', lang === 'ar' ? '🔐 بموافقة' : '🔐 Approval']].map(([mode, label]) => /*#__PURE__*/
    React.createElement("button", { key: mode, onClick: () => canManage && setJoinMode(mode), style: { flex: 1, padding: '7px', borderRadius: '8px', border: `1px solid ${joinMode === mode ? 'rgba(0,242,255,0.4)' : 'rgba(255,255,255,0.1)'}`, background: joinMode === mode ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.04)', color: joinMode === mode ? '#00f2ff' : '#6b7280', fontSize: '11px', fontWeight: joinMode === mode ? 800 : 500, cursor: canManage ? 'pointer' : 'default' } },
    label
    )
    )
    )
    ),
    canManage && /*#__PURE__*/
    React.createElement("button", { onClick: saveInfo, disabled: savingInfo, style: { ...S.btn, width: '100%', padding: '9px', fontSize: '12px', background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } },
    savingInfo ? '⏳' : `💾 ${lang === 'ar' ? 'حفظ المعلومات' : 'Save Info'}`
    )

    ), /*#__PURE__*/


    React.createElement("div", { style: S.card }, /*#__PURE__*/
    React.createElement("div", { style: S.sectionTitle }, "\uD83C\uDFF4 ", lang === 'ar' ? 'شارة القبيلة' : 'Family Sign'), /*#__PURE__*/


    React.createElement("div", { style: { marginBottom: '12px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '22px', fontWeight: 900, color: '#00f2ff', marginBottom: '2px' } },
    window.fmtFamilyNum ? window.fmtFamilyNum(family.weeklyActiveness || 0) : family.weeklyActiveness || 0
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } },
    lang === 'ar' ?
    'النشاط الأسبوعي (يُصفَّر كل أحد 0:00 GMT+3)' :
    'Weekly Activeness (Clears every Sunday at 0:00 GMT+3)'
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' } },
    FAMILY_SIGN_LEVELS.map((sl) => {
      var slImg = FamilyService.getFamilySignImage(sl.level);
      var wAct = family.weeklyActiveness || 0;
      var isEarned = wAct >= sl.threshold;
      var isCurrent = signData && signData.level === sl.level;
      var isNext = signData ? sl.level === signData.level + 1 : sl.level === 1;
      return (/*#__PURE__*/
        React.createElement("div", { key: sl.level, style: {
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '12px',
            background: isCurrent ?
            `linear-gradient(135deg,${sl.color}22,${sl.color}10)` :
            isEarned ? `${sl.color}10` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isCurrent ? sl.color + '66' : isEarned ? sl.color + '30' : 'rgba(255,255,255,0.07)'}`,
            position: 'relative', overflow: 'hidden'
          } }, /*#__PURE__*/

        React.createElement("div", { style: {
            width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, overflow: 'hidden',
            background: isEarned ? sl.bg : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isEarned ? sl.color + '44' : 'rgba(255,255,255,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: isEarned ? 'none' : 'grayscale(1) opacity(0.4)'
          } },
        slImg ? /*#__PURE__*/
        React.createElement("img", { src: slImg, style: { width: '100%', height: '100%', objectFit: 'contain' }, alt: "" }) : /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '22px' } }, sl.defaultIcon)

        ), /*#__PURE__*/
        React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: isEarned ? sl.color : '#4b5563' } },
        lang === 'ar' ? sl.name_ar : sl.name_en
        ), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginTop: '1px' } },
        lang === 'ar' ? 'النشاط المطلوب:' : 'Required Activeness:', "\xA0", /*#__PURE__*/
        React.createElement("span", { style: { color: isEarned ? '#4ade80' : sl.color, fontWeight: 700 } },
        sl.threshold.toLocaleString()
        )
        )
        ),

        isCurrent && /*#__PURE__*/
        React.createElement("div", { style: {
            fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
            background: `${sl.color}25`, color: sl.color, border: `1px solid ${sl.color}50`,
            flexShrink: 0
          } }, "\u2713 ", lang === 'ar' ? 'الحالي' : 'Current'),

        isNext && !isEarned && /*#__PURE__*/
        React.createElement("div", { style: {
            fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
            background: 'rgba(0,242,255,0.15)', color: '#00f2ff',
            border: '1px solid rgba(0,242,255,0.4)', flexShrink: 0
          } }, lang === 'ar' ? 'الأسبوع القادم' : 'Get next week'),

        isEarned && !isCurrent && /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '16px', flexShrink: 0 } }, "\u2705")

        ));

    })
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: S.card }, /*#__PURE__*/
    React.createElement("div", { style: S.sectionTitle }, "\uD83D\uDCE2 ", lang === 'ar' ? 'الإعلان' : 'Announcement'),
    canManage ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("textarea", { value: editAnnouncement, onChange: (e) => setEditAnnouncement(e.target.value), maxLength: 300, rows: 4,
      style: { ...S.input, resize: 'none', lineHeight: 1.6, fontSize: '12px' },
      placeholder: lang === 'ar' ? 'اكتب إعلانك هنا...' : 'Write your announcement here...' }), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', color: '#4b5563' } }, editAnnouncement.length, "/300"), /*#__PURE__*/
    React.createElement("button", { onClick: saveAnnouncement, disabled: savingAnn, style: { ...S.btn, background: 'rgba(0,242,255,0.12)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', padding: '7px 16px', fontSize: '11px' } },
    savingAnn ? '⏳' : lang === 'ar' ? '💾 حفظ' : '💾 Save'
    )
    )
    ) : /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, minHeight: '40px' } },
    family.announcement || /*#__PURE__*/React.createElement("span", { style: { color: '#4b5563' } }, lang === 'ar' ? 'لا يوجد إعلان' : 'No announcement')
    )

    ), /*#__PURE__*/


    React.createElement("div", { style: S.card }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } }, /*#__PURE__*/
    React.createElement("div", { style: S.sectionTitle }, "\uD83D\uDCE9 ", lang === 'ar' ? 'طلبات الانضمام' : 'Join Requests'),
    requests.length > 0 && /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c', fontWeight: 700 } }, requests.length)
    ),
    requests.length === 0 ? /*#__PURE__*/
    React.createElement("div", { style: { textAlign: 'center', padding: '16px', color: '#4b5563', fontSize: '11px' } }, lang === 'ar' ? 'لا طلبات معلّقة' : 'No pending requests') :
    joinRequesterProfiles.map((p) => /*#__PURE__*/
    React.createElement("div", { key: p.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } }, /*#__PURE__*/
    React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' } },
    p.photoURL ? /*#__PURE__*/React.createElement("img", { src: p.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } }, "\uD83D\uDE0E")
    ), /*#__PURE__*/
    React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#e2e8f0' } }, p.displayName), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, "\uD83C\uDFC6 ", p.stats?.wins || 0, " \xA0 \u2B50 ", p.charisma || 0)
    ),
    canManage ? /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => handleJoinRequest(p.id, true), style: { ...S.btn, padding: '5px 10px', fontSize: '11px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' } }, "\u2713"), /*#__PURE__*/
    React.createElement("button", { onClick: () => handleJoinRequest(p.id, false), style: { ...S.btn, padding: '5px 10px', fontSize: '11px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' } }, "\u2715")
    ) : /*#__PURE__*/

    React.createElement("span", { style: { fontSize: '10px', color: '#6b7280', fontStyle: 'italic' } }, lang === 'ar' ? 'معلّق' : 'Pending')

    )
    )
    ),


    myRole === 'owner' && /*#__PURE__*/
    React.createElement("div", { style: S.card }, /*#__PURE__*/
    React.createElement("div", { style: S.sectionTitle }, "\u26A1 ", lang === 'ar' ? 'طرد عضو' : 'Kick Member'), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
    familyMembers.filter((m) => m.id !== currentUID && m.id !== family.createdBy).map((m) => /*#__PURE__*/
    React.createElement("div", { key: m.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } }, /*#__PURE__*/
    React.createElement("div", { style: { width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flexShrink: 0 } },
    m.photoURL ? /*#__PURE__*/React.createElement("img", { src: m.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } }, "\uD83D\uDE0E")
    ), /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, fontSize: '12px', fontWeight: 600, color: '#d1d5db' } }, m.displayName),
    window.FamilyRoleBadge ? /*#__PURE__*/React.createElement(window.FamilyRoleBadge, { role: FamilyService.getFamilyRole(family, m.id), lang: lang, small: true }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: '#9ca3af' } }, FamilyService.getFamilyRole(family, m.id)), /*#__PURE__*/
    React.createElement("button", { onClick: () => handleKickMember(m.id), style: { ...S.btn, padding: '4px 10px', fontSize: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' } },
    lang === 'ar' ? 'طرد' : 'Kick'
    )
    )
    )
    )
    ), /*#__PURE__*/



    React.createElement("div", { style: { marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' } }, /*#__PURE__*/
    React.createElement("button", {
      onClick: handleLeaveFamily,
      style: { ...S.btn, width: '100%', padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.65)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, "\uD83D\uDEAA ",
    lang === 'ar' ? 'مغادرة العائلة' : 'Leave Family'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#4b5563', textAlign: 'center', marginTop: '6px' } }, lang === 'ar' ? 'لا يمكن التراجع عن هذا القرار' : 'This action cannot be undone')
    ),


    FamilyService.getFamilyRole(family, currentUID) === 'owner' && /*#__PURE__*/
    React.createElement("div", { style: { marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' } }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setShowDeleteFamilyConfirm(true),
      style: { ...S.btn, width: '100%', padding: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' } }, "\uD83D\uDDD1\uFE0F ",
    lang === 'ar' ? 'حذف العائلة نهائياً' : 'Delete Family Permanently'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '4px' } },
    lang === 'ar' ? 'سيتم حذف العائلة وطرد جميع الأعضاء' : 'All members will be removed and family deleted'
    )
    ),



    showDeleteFamilyConfirm && /*#__PURE__*/
    React.createElement("div", { style: {
        position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }, onClick: () => setShowDeleteFamilyConfirm(false) }, /*#__PURE__*/
    React.createElement("div", { style: {
        background: 'linear-gradient(135deg,#1a0808,#0f0505)',
        border: '2px solid rgba(239,68,68,0.5)',
        borderRadius: '20px', padding: '28px 24px',
        maxWidth: '320px', width: '100%',
        textAlign: 'center',
        boxShadow: '0 0 50px rgba(239,68,68,0.3)'
      }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '48px', marginBottom: '12px' } }, "\u26A0\uFE0F"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' } },
    lang === 'ar' ? 'حذف العائلة' : 'Delete Family'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '6px' } },
    lang === 'ar' ?
    `هل أنت متأكد من حذف "${family?.name || ''}"؟ سيتم طرد جميع الأعضاء وحذف كل البيانات نهائياً.` :
    `Are you sure you want to delete "${family?.name || ''}"? All members will be removed and all data will be permanently deleted.`

    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '20px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' } },
    lang === 'ar' ? '⚠️ هذا الإجراء لا يمكن التراجع عنه' : '⚠️ This action cannot be undone'
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setShowDeleteFamilyConfirm(false),
      style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } },
    lang === 'ar' ? 'تراجع' : 'Cancel'
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: handleDeleteFamily,
      style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' } },
    lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'
    )
    )
    )
    )

    ));

    return React.createElement(React.Fragment, null,
      mainContent,

      /* ── Leave Family Confirm Dialog ── */
      showLeaveFamilyConfirm && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }, onClick: () => setShowLeaveFamilyConfirm(false) },
      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,#0d0a1a,#1a0f08)',
          border: '2px solid rgba(249,115,22,0.5)',
          borderRadius: '20px', padding: '28px 24px',
          maxWidth: '320px', width: '100%', textAlign: 'center',
          boxShadow: '0 0 50px rgba(249,115,22,0.2)'
        }, onClick: (e) => e.stopPropagation() },
      React.createElement("div", { style: { fontSize: '48px', marginBottom: '12px' } }, "🚪"),
      React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, color: '#fb923c', marginBottom: '8px' } },
      lang === 'ar' ? 'مغادرة العائلة' : 'Leave Family'
      ),
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '20px' } },
      lang === 'ar' ? 'هل أنت متأكد من مغادرة العائلة؟' : 'Are you sure you want to leave the family?'
      ),
      React.createElement("div", { style: { display: 'flex', gap: '10px' } },
      React.createElement("button", {
        onClick: () => setShowLeaveFamilyConfirm(false),
        style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } },
      lang === 'ar' ? 'تراجع' : 'Cancel'
      ),
      React.createElement("button", {
        onClick: confirmLeaveFamily,
        style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#f97316', color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' } },
      lang === 'ar' ? 'نعم، غادر' : 'Yes, Leave'
      )
      )
      )
      ),

      /* ── Kick Member Confirm Dialog ── */
      kickTargetUID && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }, onClick: () => setKickTargetUID(null) },
      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,#1a0808,#0f0505)',
          border: '2px solid rgba(239,68,68,0.4)',
          borderRadius: '20px', padding: '28px 24px',
          maxWidth: '320px', width: '100%', textAlign: 'center',
          boxShadow: '0 0 40px rgba(239,68,68,0.2)'
        }, onClick: (e) => e.stopPropagation() },
      React.createElement("div", { style: { fontSize: '48px', marginBottom: '12px' } }, "⚡"),
      React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, color: '#f87171', marginBottom: '8px' } },
      lang === 'ar' ? 'طرد العضو' : 'Kick Member'
      ),
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '20px' } },
      lang === 'ar' ? 'هل أنت متأكد من طرد هذا العضو؟' : 'Are you sure you want to kick this member?'
      ),
      React.createElement("div", { style: { display: 'flex', gap: '10px' } },
      React.createElement("button", {
        onClick: () => setKickTargetUID(null),
        style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } },
      lang === 'ar' ? 'تراجع' : 'Cancel'
      ),
      React.createElement("button", {
        onClick: confirmKickMember,
        style: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' } },
      lang === 'ar' ? 'نعم، اطرد' : 'Yes, Kick'
      )
      )
      )
      )
    );

};

window.FamilyManagement = FamilyManagement;