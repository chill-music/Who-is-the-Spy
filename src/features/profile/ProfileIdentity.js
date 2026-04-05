// ════════════════════════════════════════════════════════════
// 🏗️ PROFILE IDENTITY COMPONENT
// ════════════════════════════════════════════════════════════
var ProfileIdentity = ({
  targetData,
  targetUID,
  lang,
  onOpenFamily,
  onOpenProfile,
  onOpenVIPCenter,
  setShowRoleInfoPopup,
  copiedId,
  setCopiedId,
  userData, // viewer data
  isOwnProfile
}) => {
  return (/*#__PURE__*/
    React.createElement("div", { className: "profile-identity" },

    window.getUserRole && window.getUserRole(targetData, targetUID) && /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: '4px' } }, /*#__PURE__*/
    React.createElement(window.StaffRoleBadge, {
      userData: targetData,
      uid: targetUID,
      lang: lang,
      size: "md",
      onClick: () => setShowRoleInfoPopup(true) }
    )
    ), /*#__PURE__*/



    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' } }, /*#__PURE__*/
    React.createElement(window.VIPName, {
      userData: targetData,
      displayName: targetData?.displayName,
      className: "profile-name" }
    ), /*#__PURE__*/
    React.createElement(window.VIPBadge, {
      userData: targetData,
      size: "md",
      onClick: (lvl) => {
        if (isOwnProfile && onOpenVIPCenter) onOpenVIPCenter();
      }
    })
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '0 8px', marginBottom: '6px', minHeight: '26px' } }, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap' } },
    targetData?.gender === 'male' && /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', color: '#60a5fa', lineHeight: 1 } }, "\u2642\uFE0F"),

    targetData?.gender === 'female' && /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', color: '#f472b6', lineHeight: 1 } }, "\u2640\uFE0F"),


    (() => {
      var { currentLevel: lvlData } = window.getCharismaLevel ? window.getCharismaLevel(targetData?.charisma || 0) : { currentLevel: null };
      if (!lvlData) return null;
      var hasGlow = lvlData.hasGlow;
      var isDivine = lvlData.isDivine;
      return (/*#__PURE__*/
        React.createElement("div", { style: {
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '20px',
            background: isDivine ? 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))' : hasGlow ? `${lvlData.color}18` : 'rgba(255,255,255,0.06)',
            border: isDivine ? '1px solid rgba(0,212,255,0.4)' : hasGlow ? `1px solid ${lvlData.color}55` : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isDivine ? '0 0 10px rgba(0,212,255,0.25)' : hasGlow ? `0 0 8px ${lvlData.color}44` : 'none',
            flexShrink: 0
          } },
        lvlData.iconType === 'image' && lvlData.iconUrl ? /*#__PURE__*/
        React.createElement("img", { src: lvlData.iconUrl, alt: "", style: { width: '16px', height: '16px', borderRadius: isDivine ? '50%' : '0', objectFit: 'cover' } }) : /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '13px' } }, lvlData.icon), /*#__PURE__*/

        React.createElement("span", { style: { fontSize: '10px', fontWeight: 800, color: isDivine ? '#00d4ff' : lvlData.color } }, "Lv.",
        lvlData.level
        )
        ));

    })(),

    targetData?.familyTag && window.FamilySignBadge && /*#__PURE__*/
    React.createElement("div", { style: { transform: 'scale(0.9)', transformOrigin: 'left center' } },
    (() => {
      // Sync with real family level if possible to avoid "stuck at Lv.1" issue
      var flvl = targetData.familySignLevel || 1;
      if (targetData.tribeFamilySignLevel) flvl = targetData.tribeFamilySignLevel;
      var fColor = targetData.familySignColor || window.FamilyConstants?.getFamilySignLevelDataByLevel?.(flvl)?.color || '#6b7280';
      var fImg = window.FamilyConstants?.getFamilySignImage?.(0, flvl) || targetData.familySignImageURL;
      return (/*#__PURE__*/
        React.createElement(window.FamilySignBadge, {
          tag: targetData.familyTag,
          color: fColor,
          signLevel: flvl,
          imageURL: fImg,
          small: true,
          isLarge: true,
          onClick: (onOpenFamily || window.onOpenFamily) ? () => (onOpenFamily || window.onOpenFamily)(targetData?.familyId) : undefined }
        ));

    })()
    )

    ), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 } },
    targetData?.country?.flag && window.FlagDisplay && /*#__PURE__*/
    React.createElement(window.FlagDisplay, {
      countryCode: targetData.country.code,
      flagEmoji: targetData.country.flag,
      size: 22 }
    )

    )
    ),


    (() => {
      var vipLvl = window.getVIPLevel ? window.getVIPLevel(targetData) : 0;
      var vipCfg = vipLvl > 0 && window.VIP_CONFIG ? window.VIP_CONFIG.find((v) => v.level === vipLvl) : null;
      var idBeforeImg = vipCfg?.idBeforeImageUrl || null;
      var idIconImg = (vipLvl >= 6 ?
      vipCfg?.idIconImageUrl || (typeof window.VIP_ID_ICONS !== 'undefined' ? window.VIP_ID_ICONS[vipLvl] : null) || null :
      null) || (typeof window.ID_ICON_IMAGE_URL !== 'undefined' ? window.ID_ICON_IMAGE_URL : null);
      var idValue = targetData?.customId || targetUID?.substring(0, 8);
      return (/*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', marginBottom: '6px', padding: '0 8px' } },
        idBeforeImg && /*#__PURE__*/
        React.createElement("img", { src: idBeforeImg, alt: "vip-id", style: { height: '22px', objectFit: 'contain', flexShrink: 0 } }), /*#__PURE__*/

        React.createElement("span", {
          className: "profile-id-display",
          style: { margin: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
          onClick: () => {
            navigator.clipboard.writeText(idValue);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
          } },

        copiedId ?
        lang === 'ar' ? '✓ تم النسخ!' : '✓ Copied!' :
        idIconImg ? /*#__PURE__*/
        React.createElement(React.Fragment, null, /*#__PURE__*/
        React.createElement("img", { src: idIconImg, alt: "id-icon",
          style: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(0,242,255,0.5))' } }),
        idValue
        ) :

        `ID: ${idValue}`

        )
        ));

    })(),


    window.UserBadgesV11 && /*#__PURE__*/React.createElement(window.UserBadgesV11, { equipped: targetData?.equipped, lang: lang }),


    window.UserTitleV11 && /*#__PURE__*/React.createElement(window.UserTitleV11, { equipped: targetData?.equipped, lang: lang }),


    window.CharismaDisplay && /*#__PURE__*/React.createElement(window.CharismaDisplay, { charisma: targetData?.charisma, lang: lang })
    ));

};

window.ProfileIdentity = ProfileIdentity;
