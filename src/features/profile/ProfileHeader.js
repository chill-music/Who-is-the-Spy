var ProfileHeader = ({
  isOwnProfile,
  isTargetGuest,
  isGuestViewer,
  lang,
  onClose,
  showOptionsMenu,
  setShowOptionsMenu,
  optionsRef,
  isBlocked,
  handleUnblockUser,
  setShowBlockConfirm,
  setShowReportModal,
  userData,
  currentUserUID,
  targetData,
  targetUID,
  setShowBanModal,
  setShowRoleModal,
  bannerURL,
  setBannerURL,
  bannerFileRef,
  bannerUploading,
  setBannerUploading,
  profileCoupleDoc,
  profilePartnerData,
  showProfileCoupleCard,
  setShowProfileCoupleCard,
  currentViewerData,
  onOpenMarriage,
  onOpenSettings,
  onOpenProfile
}) => {
  var handleBannerUpload = async (e) => {
    var file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;
    setBannerUploading(true);
    var reader = new FileReader();
    reader.onload = async (ev) => {
      var img = new Image();
      img.onload = async () => {
        var canvas = document.createElement('canvas');
        var W = 800,H = 200;
        canvas.width = W;canvas.height = H;
        var ctx = canvas.getContext('2d');
        var scale = Math.max(W / img.width, H / img.height);
        var sw = img.width * scale,sh = img.height * scale;
        ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
        var base64 = canvas.toDataURL('image/jpeg', 0.55);
        try {
          if (typeof usersCollection !== 'undefined') {
            await usersCollection.doc(targetUID).update({ bannerURL: base64 });
            setBannerURL(base64);
          }
        } catch (err) {}
        setBannerUploading(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (/*#__PURE__*/
    React.createElement("div", { style: { position: 'relative' } }, /*#__PURE__*/

    React.createElement("div", { className: "profile-header-bar" }, /*#__PURE__*/
    React.createElement("div", { style: { flex: 1 } }),

    !isOwnProfile && !isTargetGuest && !isGuestViewer && /*#__PURE__*/
    React.createElement("div", { className: "profile-options-container", ref: optionsRef }, /*#__PURE__*/
    React.createElement("button", {
      className: "profile-options-btn",
      onClick: () => setShowOptionsMenu(!showOptionsMenu) },
    "\u22EE"

    ),
    showOptionsMenu && /*#__PURE__*/
    React.createElement("div", { className: "profile-options-menu" },
    isBlocked ? /*#__PURE__*/
    React.createElement("button", { onClick: handleUnblockUser, className: "profile-options-item unblock" }, /*#__PURE__*/
    React.createElement("span", null, "\uD83D\uDD13"), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'إلغاء الحظر' : 'Unblock')
    ) : /*#__PURE__*/

    React.createElement("button", { onClick: () => {setShowBlockConfirm(true);setShowOptionsMenu(false);}, className: "profile-options-item block" }, /*#__PURE__*/
    React.createElement("span", null, "\uD83D\uDEAB"), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'حظر' : 'Block')
    ), /*#__PURE__*/

    React.createElement("button", { onClick: () => {setShowReportModal(true);setShowOptionsMenu(false);}, className: "profile-options-item report", style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', textAlign: 'center' } }, /*#__PURE__*/
    React.createElement("span", null, "\uD83D\uDEA8"), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'إبلاغ' : 'Report')
    ),
    isAdmin(currentUserUID) && !isTargetGuest && /*#__PURE__*/
    React.createElement("button", { onClick: () => {setShowBanModal(true);setShowOptionsMenu(false);},
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: 'none', borderTop: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left' } }, /*#__PURE__*/
    React.createElement("span", null, "\uD83D\uDD12"), /*#__PURE__*/
    React.createElement("span", null, isBannedUser(targetData) ? lang === 'ar' ? 'رفع الحظر' : 'Remove Ban' : lang === 'ar' ? 'حظر الحساب' : 'Ban Account')
    ),

    canManageRoles(userData, currentUserUID) && !isTargetGuest && /*#__PURE__*/
    React.createElement("button", { onClick: () => {setShowRoleModal(true);setShowOptionsMenu(false);},
      style: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '10px 14px', background: 'rgba(255,215,0,0.08)', border: 'none', borderTop: '1px solid rgba(255,215,0,0.15)', color: '#fbbf24', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left' } }, /*#__PURE__*/
    React.createElement("span", null, "\uD83D\uDC51"), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'إدارة الرتبة' : 'Manage Role')
    )

    )

    ), /*#__PURE__*/


    React.createElement("button", { onClick: onClose, className: "profile-close-btn" }, "\u2715")
    ), /*#__PURE__*/


    React.createElement("input", {
      type: "file",
      ref: bannerFileRef,
      style: { display: 'none' },
      accept: "image/*",
      onChange: handleBannerUpload }
    ), /*#__PURE__*/


    React.createElement("div", {
      className: "profile-cover",
      style: bannerURL ? {
        backgroundImage: `url(${bannerURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {} },

    isOwnProfile && !isTargetGuest && /*#__PURE__*/
    React.createElement("button", {
      className: "profile-banner-camera",
      onClick: () => bannerFileRef.current?.click(),
      title: lang === 'ar' ? 'تغيير البنر' : 'Change banner',
      disabled: bannerUploading },

    bannerUploading ? '⏳' : '📷'
    ), /*#__PURE__*/

    React.createElement("div", { className: "profile-avatar-wrapper" }, /*#__PURE__*/
    React.createElement(AvatarWithFrameV11, {
      photoURL: targetData?.photoURL,
      equipped: targetData?.equipped,
      size: "lg",
      isOnline: targetData?.isOnline,
      effectId: targetData?.equipped?.profileEffects,
      banData: targetData?.ban,
      lang: lang }
    )
    ),

    profileCoupleDoc && profilePartnerData ? /*#__PURE__*/
    React.createElement(React.Fragment, null,
    (() => {
      var ringData = typeof RINGS_DATA !== 'undefined' ? RINGS_DATA.find((r) => r.id === profileCoupleDoc.ringId) : null;
      var ringEmoji = ringData?.emoji || '💍';
      var ringImageURL = ringData?.imageURL || null;
      var ringGlow = ringData?.glow || 'rgba(236,72,153,0.6)';
      return (/*#__PURE__*/
        React.createElement("div", {
          className: "profile-couple-badge",
          onClick: () => setShowProfileCoupleCard(true),
          title: lang === 'ar' ? `مرتبط بـ ${profilePartnerData.displayName}` : `Coupled with ${profilePartnerData.displayName}` }, /*#__PURE__*/

        React.createElement("span", { className: "cb-ring", style: { filter: ringImageURL ? undefined : `drop-shadow(0 0 5px ${ringGlow})` } },
        ringImageURL ? /*#__PURE__*/
        React.createElement("img", { src: ringImageURL, alt: "", style: { width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', mixBlendMode: 'screen', display: 'block' } }) :
        ringEmoji

        ), /*#__PURE__*/
        React.createElement("div", { className: "cb-avatar" },
        profilePartnerData.photoURL ? /*#__PURE__*/
        React.createElement("img", { src: profilePartnerData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) :
        '😍'

        ), /*#__PURE__*/
        React.createElement("span", { className: "cb-name" }, profilePartnerData.displayName)
        ));

    })(),

    typeof CoupleCardModal !== 'undefined' && /*#__PURE__*/
    React.createElement(CoupleCardModal, {
      show: showProfileCoupleCard,
      onClose: () => setShowProfileCoupleCard(false),
      coupleDoc: profileCoupleDoc,
      currentUID: currentUserUID,
      selfData: targetData,
      partnerData: profilePartnerData,
      lang: lang,
      onNotification: () => {},
      viewOnly: currentUserUID !== profileCoupleDoc?.uid1 && currentUserUID !== profileCoupleDoc?.uid2,
      onOpenProfile: onOpenProfile,
      currentUserData: currentViewerData }
    )

    ) :
    isOwnProfile && !isTargetGuest && /*#__PURE__*/
    React.createElement("div", {
      className: "profile-couple-add-nudge",
      style: {
        position: 'absolute', bottom: '-16px', right: '16px',
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(15,20,40,0.85)', backdropFilter: 'blur(8px)',
        border: '1px dashed rgba(236,72,153,0.35)',
        borderRadius: '20px', padding: '4px 10px 4px 6px',
        cursor: 'pointer', zIndex: 10,
        fontSize: '10px', color: 'rgba(249,168,212,0.7)', fontWeight: 700
      },
      onClick: () => {if (onOpenMarriage) onOpenMarriage();else if (onOpenSettings) onOpenSettings();} }, /*#__PURE__*/

    React.createElement("span", { style: { fontSize: '13px' } }, "\uD83D\uDC8D"),
    lang === 'ar' ? 'أضف شريكك' : 'Add Partner'
    )

    )
    ));

};

window.ProfileHeader = ProfileHeader;