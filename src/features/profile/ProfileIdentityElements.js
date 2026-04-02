/**
 * ProfileIdentityElements.js
 * Modular components for user identity elements: Avatar, Frame, User Title, and Badges.
 * Part of Phase 4: Batch 4 modularization.
 */

/**
 * UserTitleV11 Component
 * Renders the equipped user title (Image or Text).
 * 
 * @param {Object} props
 * @param {Object} props.equipped - Equipped items object.
 * @param {string} props.lang - Language code ('ar' or 'en').
 */
var UserTitleV11 = ({ equipped, lang }) => {
  var titleId = equipped?.titles;
  if (!titleId) return null;

  var title = window.SHOP_ITEMS.titles.find((t) => t.id === titleId);
  if (!title) return null;

  var displayName = lang === 'ar' ? (title.name_ar || title.name_en) : title.name_en;
  var hasImage = title.imageUrl && title.imageUrl.trim() !== '';

  if (hasImage) {
    // Dynamic width calculation matching FamilySignBadge logic for breathing room
    var charCount = displayName.length + (title.preview ? 2 : 0);
    var dynamicWidth = 45 + (charCount * 8); 
    
    return (/*#__PURE__*/
      React.createElement("div", { 
        className: "profile-user-title has-image", 
        style: { width: `${dynamicWidth}px`, height: '22px' } 
      }, /*#__PURE__*/
        React.createElement("img", { src: title.imageUrl, alt: "", className: "title-bg-image" }), /*#__PURE__*/
        React.createElement("span", { className: "title-overlay-name" }, title.preview, " ", displayName)
      ));
  }

  // Otherwise show text with emoji/preview
  return (/*#__PURE__*/
    React.createElement("span", { className: "profile-user-title is-text" },
      title.preview, " ", displayName
    ));

};

/**
 * UserBadgesV11 Component
 * Displays up to 10 equipped badges.
 * 
 * @param {Object} props
 * @param {Object} props.equipped - Equipped items object.
 * @param {string} props.lang - Language code ('ar' or 'en').
 */
var UserBadgesV11 = ({ equipped, lang }) => {
  var badges = equipped?.badges || [];
  if (badges.length === 0) return null;

  return (/*#__PURE__*/
    React.createElement("div", { className: "profile-badges-row" },
    badges.slice(0, 10).map((badgeId, idx) => {
      var badge = window.SHOP_ITEMS.badges.find((b) => b.id === badgeId);
      if (!badge) return null;

      return (/*#__PURE__*/
        React.createElement("div", { key: idx, className: `profile-badge-chip${badge.imageUrl ? ' has-image' : ''}` },
        badge.imageUrl ? /*#__PURE__*/
        React.createElement("img", { src: badge.imageUrl, alt: "", style: { width: 18, height: 18, objectFit: 'contain', background: 'transparent' } }) : /*#__PURE__*/

        React.createElement("span", null, badge.preview),

        !badge.imageUrl && /*#__PURE__*/React.createElement("span", null, lang === 'ar' ? badge.name_ar : badge.name_en)
        ));

    })
    ));

};

/**
 * AvatarWithFrameV11 Component
 * Fixed circular avatar display with an optional frame around it.
 * 
 * @param {Object} props
 * @param {string} props.photoURL - User avatar URL.
 * @param {Object} props.equipped - Equipped items object.
 * @param {string} [props.size='lg'] - Size preset ('sm', 'md', 'lg', 'xl').
 * @param {boolean} props.isOnline - Whether the user is online.
 * @param {string} [props.effectId] - Optional override for effect ID.
 * @param {Object} props.banData - User ban status data.
 * @param {string} props.lang - Language code ('ar' or 'en').
 */
var AvatarWithFrameV11 = ({ photoURL, equipped, size = 'lg', isOnline, effectId, banData, lang }) => {
  var sizeMap = {
    sm: { wrapper: 64, avatar: 36, frameSize: 56 },
    md: { wrapper: 80, avatar: 48, frameSize: 72 },
    lg: { wrapper: 96, avatar: 58, frameSize: 90 },
    xl: { wrapper: 150, avatar: 90, frameSize: 140 }
  };

  var s = sizeMap[size] || sizeMap.lg;
  var frame = equipped?.frames;
  var frameStyle = frame && window.SHOP_ITEMS ? window.SHOP_ITEMS.frames.find((f) => f.id === frame) : null;

  // Resolve profile effect (from prop or equipped)
  var resolvedEffectId = effectId || equipped?.profileEffects;
  var effect = resolvedEffectId && window.SHOP_ITEMS ? (window.SHOP_ITEMS.profileEffects || []).find((e) => e.id === resolvedEffectId) : null;
  var hasImageEffect = effect && effect.imageUrl && effect.imageUrl.trim() !== '';

  var showBan = banData?.isBanned && (
  !banData.expiresAt ||
  new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt)));


  return (/*#__PURE__*/
    React.createElement("div", { className: "profile-avatar-container", style: {
        position: 'relative',
        width: s.wrapper,
        height: s.wrapper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      } },

    frameStyle && frameStyle.preview && /*#__PURE__*/
    React.createElement("div", {
      className: "profile-avatar-frame",
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: s.frameSize,
        height: s.frameSize,
        borderRadius: '50%',
        overflow: 'visible', // Changed from 'hidden' to 'visible' to allow gems/decorations to show
        zIndex: 1,
        pointerEvents: 'none'
      } },

    frameStyle.preview.startsWith('http') ? /*#__PURE__*/
    React.createElement("img", { src: frameStyle.preview, alt: "", style: { width: '100%', height: '100%', objectFit: 'contain' } }) // Changed 'cover' to 'contain' for frames
    : /*#__PURE__*/
    React.createElement("div", { style: {
        width: '100%',
        height: '100%',
        background: frameStyle.preview,
        borderRadius: '50%'
      } })

    ), /*#__PURE__*/



    React.createElement("div", { style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: s.avatar,
        height: s.avatar,
        zIndex: 10,
        borderRadius: '50%',
        overflow: hasImageEffect ? 'hidden' : 'visible'
      } }, /*#__PURE__*/
    React.createElement("img", {
      src: photoURL || `https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=${s.avatar * 2}`,
      alt: "",
      className: "profile-avatar",
      style: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block',
        filter: showBan ? 'grayscale(70%) brightness(0.45)' : 'none'
      } }
    ),
    hasImageEffect && effect && window.ProfileEffectOverlayInline && /*#__PURE__*/
    React.createElement(window.ProfileEffectOverlayInline, { effectId: resolvedEffectId }),


    showBan && /*#__PURE__*/
    React.createElement("div", { style: {
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'rgba(200,0,0,0.6)',
        border: '2.5px solid rgba(255,60,60,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', zIndex: 11
      } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.9)', letterSpacing: '0px' } },
    lang === 'ar' ? 'محظور' : 'BANNED'
    )
    )

    ),

    isOnline !== undefined && /*#__PURE__*/
    React.createElement("div", { className: `profile-status-dot ${isOnline ? '' : 'offline'}` })

    ));

};

// Export to global scope
window.UserTitleV11 = UserTitleV11;
window.UserBadgesV11 = UserBadgesV11;
window.AvatarWithFrameV11 = AvatarWithFrameV11;