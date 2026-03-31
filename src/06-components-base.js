(function () {
  var { useState, useEffect, useRef } = React;

  class ErrorBoundary extends React.Component {
    constructor(props) {super(props);this.state = { hasError: false, error: null };}
    static getDerivedStateFromError(error) {return { hasError: true, error };}
    componentDidCatch(error, errorInfo) {}
    render() {
      if (this.state.hasError) {
        return (/*#__PURE__*/
          React.createElement("div", { className: "min-h-screen flex items-center justify-center p-4" }, /*#__PURE__*/
          React.createElement("div", { className: "glass-panel rounded-xl p-6 text-center max-w-md" }, /*#__PURE__*/
          React.createElement("div", { className: "text-4xl mb-4" }, "\u26A0\uFE0F"), /*#__PURE__*/
          React.createElement("h2", { className: "text-xl font-bold mb-2" }, "Something went wrong"), /*#__PURE__*/
          React.createElement("p", { className: "text-sm text-gray-400 mb-4" }, "Please refresh the page"), /*#__PURE__*/
          React.createElement("button", { onClick: () => window.location.reload(), className: "btn-neon px-6 py-2 rounded-lg" }, "Refresh")
          )
          ));

      }
      return this.props.children;
    }
  }

  // Guest Banner
  var GuestBanner = ({ lang }) => {
    var t = TRANSLATIONS[lang];
    return /*#__PURE__*/React.createElement("div", { className: "guest-banner" }, " ", /*#__PURE__*/React.createElement("h3", { className: "guest-banner-title" }, t.guestTitle), " ", /*#__PURE__*/React.createElement("p", { className: "guest-banner-desc" }, t.guestDesc), " ");
  };

  // Notification Toast — Modern sliding pill from top
  var NotificationToast = ({ message, onClose }) => {
    var [visible, setVisible] = useState(false);
    var [exiting, setExiting] = useState(false);

    useEffect(() => {
      if (message) {
        setExiting(false);
        setVisible(true);
        var hideTimer = setTimeout(() => {
          setExiting(true);
          setTimeout(() => {setVisible(false);onClose();}, 350);
        }, 2500);
        return () => clearTimeout(hideTimer);
      }
    }, [message]);

    if (!message || !visible) return null;

    var emoji = message.match(/^(\p{Emoji})/u)?.[1] || '💬';
    var cleanMsg = message.replace(/^(\p{Emoji}\s?)/u, '');

    return (/*#__PURE__*/
      React.createElement("div", { className: `modern-notification ${exiting ? 'exiting' : ''}`,
        onClick: () => {setExiting(true);setTimeout(() => {setVisible(false);onClose();}, 350);} }, /*#__PURE__*/
      React.createElement("div", { className: "notification-accent" }), /*#__PURE__*/
      React.createElement("div", { className: "notification-icon" }, emoji), /*#__PURE__*/
      React.createElement("div", { className: "notification-text" }, cleanMsg), /*#__PURE__*/
      React.createElement("div", { className: "notification-progress-bar" }, /*#__PURE__*/
      React.createElement("div", { className: "notification-progress-fill" })
      )
      ));

  };

  // Modal Close Button
  var ModalCloseBtn = ({ onClose }) => /*#__PURE__*/React.createElement("button", { onClick: onClose, className: "modal-close-btn", "aria-label": "Close" }, "\xD7");

  // Charisma Display
  var CharismaDisplay = ({ charisma, lang, showDetails = true }) => {
    var t = TRANSLATIONS[lang];
    var { currentLevel, nextLevel } = getCharismaLevel(charisma || 0);
    var progress = getCharismaProgress(charisma || 0);
    var neededForNext = nextLevel ? nextLevel.threshold - (charisma || 0) : 0;
    var isMaxLevel = currentLevel.isMaxLevel;
    var hasGlow = currentLevel.hasGlow;
    var isDivine = currentLevel.isDivine; // ✨ Level 21 — Divine style

    var renderIcon = () => {
      if (currentLevel.iconType === 'image' && currentLevel.iconUrl) {
        return /*#__PURE__*/React.createElement("img", { src: currentLevel.iconUrl, alt: "level", className: `w-5 h-5 ${hasGlow ? 'animate-pulse' : ''}`, style: isDivine ? { borderRadius: '50%', objectFit: 'cover', filter: 'drop-shadow(0 0 8px #00d4ff) drop-shadow(0 0 16px rgba(0,212,255,0.5))' } : hasGlow ? { filter: 'drop-shadow(0 0 8px #ff6600)' } : {} });
      }
      return /*#__PURE__*/React.createElement("span", { className: "charisma-icon" }, currentLevel.icon);
    };

    return (/*#__PURE__*/
      React.createElement("div", { className: `charisma-container ${hasGlow ? 'has-glow' : ''} ${isDivine ? 'has-divine' : ''}`,
        style: isDivine ? { boxShadow: '0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px', padding: '4px' } : {} }, /*#__PURE__*/
      React.createElement("div", { className: "charisma-header" }, /*#__PURE__*/
      React.createElement("span", { className: "charisma-label" }, renderIcon(), t.charisma), /*#__PURE__*/
      React.createElement("span", {
        className: `charisma-level-badge ${currentLevel.badge_class} ${hasGlow ? 'glow-badge' : ''}`,
        style: isDivine ?
        { boxShadow: '0 0 15px rgba(0,212,255,0.7)', border: '1.5px solid rgba(0,212,255,0.7)', color: '#00d4ff', background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))' } :
        hasGlow ? { boxShadow: '0 0 15px ' + currentLevel.color } : {} },

      renderIcon(), " Lv.", currentLevel.level,
      isDivine && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', marginLeft: '2px', animation: 'divine-aura 3s ease-in-out infinite' } }, "\u2726")
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "charisma-bar-bg" }, /*#__PURE__*/
      React.createElement("div", { className: "charisma-bar-fill", style: {
          width: `${progress}%`,
          background: isDivine ? 'linear-gradient(90deg,#00d4ff,#7c3aed,#00d4ff)' : undefined,
          backgroundSize: isDivine ? '200% 100%' : undefined,
          animation: isDivine ? 'divine-bar-flow 3s linear infinite' : undefined
        } })
      ), /*#__PURE__*/
      React.createElement("div", { className: "charisma-info" }, /*#__PURE__*/
      React.createElement("span", { className: "charisma-current", style: isDivine ? { color: '#00d4ff' } : {} }, formatCharisma(charisma || 0)),
      isMaxLevel ? /*#__PURE__*/React.createElement("span", { className: "charisma-next", style: isDivine ? { color: '#00d4ff', fontWeight: 'bold', textShadow: '0 0 8px rgba(0,212,255,0.8)' } : { color: '#ffd700', fontWeight: 'bold' } }, isDivine ? '✦ ' : '', t.maxLevel) : nextLevel && showDetails && /*#__PURE__*/React.createElement("span", { className: "charisma-next" }, t.nextLevel, ": ", formatCharisma(neededForNext))
      )
      ));

  };

  // Avatar with Frame
  var AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick, banData, lang }) => {
    var sizeConfig = {
      sm: { wrapper: 48, avatar: 42, mask: 42 },
      md: { wrapper: 68, avatar: 60, mask: 60 },
      lg: { wrapper: 100, avatar: 88, mask: 88 },
      xl: { wrapper: 140, avatar: 124, mask: 124 }
    };
    var config = sizeConfig[size] || sizeConfig.md;
    var frameItem = (window.SHOP_ITEMS?.frames || []).find((f) => f.id === equipped?.frames);
    var showBan = banData?.isBanned && (
    !banData.expiresAt ||
    new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt)));

    var isImageURL = photoURL && (photoURL.startsWith('http') || photoURL.startsWith('data:') || photoURL.startsWith('/'));
    var avatarStyle = { width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', filter: showBan ? 'grayscale(70%) brightness(0.5)' : 'none' };

    var renderFrame = () => {
      if (!frameItem) {
        // FALLBACK: If frameItem not found by ID (e.g. legacy ref or straight string), try to find it
        if (typeof equipped?.frames === 'string' && equipped.frames.trim() !== '') {
          frameItem = (SHOP_ITEMS.frames || []).find((f) => f.id === equipped.frames || f.preview === equipped.frames);
        }
      }
      if (!frameItem) return null;

      var frameUrl = frameItem.preview || frameItem.imageUrl;
      if (!frameUrl) return null;

      if (frameUrl.startsWith('http') || frameUrl.startsWith('/') || frameUrl.startsWith('data:')) {
        return (/*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', overflow: 'hidden', zIndex: 1, pointerEvents: 'none' } }, /*#__PURE__*/
          React.createElement("img", { src: frameUrl, style: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }, alt: "frame",
            onError: (e) => {e.target.style.display = 'none';} }), /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'rgba(13,13,31,0.95)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' } })
          ));

      }
      return (/*#__PURE__*/
        React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', background: frameUrl, zIndex: 1 } }, /*#__PURE__*/
        React.createElement("div", { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' } })
        ));

    };

    return (/*#__PURE__*/
      React.createElement("div", { style: { position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }, onClick: onClick },
      renderFrame(),
      isImageURL ? /*#__PURE__*/
      React.createElement("img", { src: photoURL, style: { ...avatarStyle, objectFit: 'cover' }, alt: "avatar",
        onError: (e) => {e.target.onerror = null;e.target.src = `https://ui-avatars.com/api/?name=User&background=random`;} }) :
      photoURL ? /*#__PURE__*/
      React.createElement("div", { style: { ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,30,60,0.85)', fontSize: Math.round(config.avatar * 0.52) + 'px', userSelect: 'none' } },
      photoURL
      ) : /*#__PURE__*/

      React.createElement("img", { src: `https://ui-avatars.com/api/?name=User&background=random`, style: { ...avatarStyle, objectFit: 'cover' }, alt: "avatar" }),

      showBan && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: config.avatar + 'px', height: config.avatar + 'px',
          borderRadius: '50%', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(220,0,0,0.55)',
          border: '2px solid rgba(255,50,50,0.9)',
          flexDirection: 'column', gap: '0px'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: config.avatar > 35 ? '9px' : '7px', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.1, textShadow: '0 1px 3px rgba(0,0,0,0.8)', letterSpacing: '-0.2px' } },
      lang === 'ar' ? 'محظور' : 'BANNED'
      )
      )

      ));

  };

  // Notification Dropdown
  var NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
    var t = TRANSLATIONS[lang];
    if (!show) return null;
    var unreadCount = notifications.filter((n) => !n.read).length;
    var getNotificationIcon = (type) => {switch (type) {case 'friend_request':return '👥';case 'gift':return '🎁';case 'message':return '💬';case 'friend_request_accepted':return '✅';case 'achievement':return '🏆';default:return '🔔';}};

    return (/*#__PURE__*/
      React.createElement("div", { className: "notification-dropdown animate-pop" }, /*#__PURE__*/
      React.createElement("div", { className: "notification-dropdown-header" }, /*#__PURE__*/
      React.createElement("span", { className: "notification-dropdown-title" }, t.notifications, " ", unreadCount > 0 && `(${unreadCount})`),
      notifications.length > 0 && /*#__PURE__*/React.createElement("button", { onClick: onClearAll, className: "notification-clear-all" }, t.clearAll)
      ), /*#__PURE__*/
      React.createElement("div", { className: "notification-list" },
      notifications.length === 0 ? /*#__PURE__*/React.createElement("div", { className: "notification-empty" }, /*#__PURE__*/React.createElement("div", { className: "text-3xl mb-2" }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("p", null, t.noNotifications)) : notifications.map((notif) => /*#__PURE__*/
      React.createElement("div", { key: notif.id, className: `notification-item ${!notif.read ? 'unread' : ''}`, onClick: () => {onMarkRead(notif.id);onNotificationClick(notif);onClose();} }, /*#__PURE__*/
      React.createElement("span", { className: "notification-item-icon" }, getNotificationIcon(notif.type)), /*#__PURE__*/
      React.createElement("div", { className: "notification-item-content" }, /*#__PURE__*/
      React.createElement("div", { className: "notification-item-title" }, notif.fromName || 'System'), /*#__PURE__*/
      React.createElement("div", { className: "notification-item-message" }, notif.message), /*#__PURE__*/
      React.createElement("div", { className: "notification-item-time" }, formatTime(notif.timestamp))
      )
      )
      )
      )
      ));

  };

  // MiniProfilePopup
  var MiniProfilePopup = ({
    profile, onClose, currentUID, lang,
    onOpenProfile, onSendGift = null, onReport = null,
    onBlock = null, onUnblock = null, isBlocked = false,
    onOpenFamily = null, zIndex = window.Z?.OVERLAY || 1000
  }) => {
    var [showMenu, setShowMenu] = useState(false);
    var [reportModal, setReportModal] = useState(false);
    var [reportReason, setReportReason] = useState('');
    var [reportNote, setReportNote] = useState('');

    // 💍 Couple/CP Data
    var [coupleDoc, setCoupleDoc] = useState(null);
    var [partnerData, setPartnerData] = useState(null);

    useEffect(() => {
      if (!profile?.uid) return;
      var isMounted = true;
      var unsubPartner;

      var attachPartnerListener = (partnerUID) => {
        if (unsubPartner) unsubPartner();
        unsubPartner = window.usersCollection?.doc(partnerUID).onSnapshot((doc) => {
          if (doc.exists && isMounted) setPartnerData({ id: doc.id, ...doc.data() });
        });
      };

      // Search couples collection
      var p1 = window.couplesCollection?.where('uid1', '==', profile.uid).where('status', '==', 'accepted').limit(1).get().catch(() => null);
      var p2 = window.couplesCollection?.where('uid2', '==', profile.uid).where('status', '==', 'accepted').limit(1).get().catch(() => null);

      Promise.all([p1, p2]).then(([s1, s2]) => {
        if (!isMounted) return;
        var snap = (s1 && !s1.empty) ? s1 : (s2 && !s2.empty) ? s2 : null;
        if (!snap || snap.empty) {
          setCoupleDoc(null); setPartnerData(null); return;
        }
        var d = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setCoupleDoc(d);
        var partnerUID = d.uid1 === profile.uid ? d.uid2 : d.uid1;
        attachPartnerListener(partnerUID);
      });

      return () => { isMounted = false; if (unsubPartner) unsubPartner(); };
    }, [profile?.uid]);

    if (!profile) return null;

    var isSelf = profile.uid === currentUID;
    var hasMenu = onReport || onBlock || onUnblock || onOpenProfile;
    var t_add = lang === 'ar' ? 'إضافة' : 'Add';
    var t_friend = lang === 'ar' ? 'صديق' : 'Friends';
    var t_gift = lang === 'ar' ? 'إرسال هدية' : 'Send Gift';
    var t_my_profile = lang === 'ar' ? 'بروفايلي' : 'My Profile';

    var charismaLevel = (() => {
      if (typeof window.getCharismaLevel === 'undefined') return null;
      var { currentLevel: lvl } = window.getCharismaLevel(profile.charisma || 0);
      return lvl || null;
    })();

    var familySignEl = (() => {
      if (!profile.familyTag) return null;
      if (window.FamilySignBadge) {
          var flvl = profile.familySignLevel || 1;
          if (profile.tribeFamilySignLevel) flvl = profile.tribeFamilySignLevel;
          var fcolor = window.FamilyConstants?.getFamilySignLevelDataByLevel?.(flvl)?.color || profile.familySignColor || '#00f2ff';
          var imgURL = window.FamilyConstants?.getFamilySignImage?.(0, flvl) || profile.familySignImageURL;
          return React.createElement(window.FamilySignBadge, {
              tag: profile.familyTag,
              signLevel: flvl,
              color: fcolor,
              imageURL: imgURL,
              onClick: (onOpenFamily || window.onOpenFamily) ? () => { if (onClose) onClose(); (onOpenFamily || window.onOpenFamily)(profile.familyId); } : undefined
          });
      }
      return React.createElement("div", { className: "mp-calm-badge", onClick: (onOpenFamily || window.onOpenFamily) ? () => { if (onClose) onClose(); (onOpenFamily || window.onOpenFamily)(profile.familyId); } : undefined, style: { cursor: (onOpenFamily || window.onOpenFamily) ? 'pointer' : 'default'} }, profile.familyTag);
    })();

    var _submitReport = async () => {
      if (!reportReason) return;
      if (onReport) await onReport(profile, reportReason, reportNote);
      else if (typeof window.reportsCollection !== 'undefined') {
        try {
          await window.reportsCollection.add({
            type: 'user', reportedUID: profile.uid, reportedName: profile.name,
            reporterUID: currentUID, reason: reportReason, note: reportNote,
            createdAt: typeof window.TS === 'function' ? window.TS() : new Date(),
            status: 'pending'
          });
        } catch (e) {console.error(e);}
      }
      setReportModal(false);setReportReason('');setReportNote('');
      onClose();
    };

    var e = React.createElement;

    return e(window.PortalModal || React.Fragment, null,
      e("div", {
        style: { position: 'fixed', inset: 0, zIndex: zIndex, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
        onClick: () => { setShowMenu(false); onClose(); }
      },
      e("div", { className: "mp-card", onClick: (ev) => ev.stopPropagation(), style: { background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 28px 70px rgba(0,0,0,0.95)' } },
        e("div", { className: "mp-banner", style: { background: (profile.bannerUrl || profile.bannerURL) ? 'transparent' : 'linear-gradient(135deg,#0a0a2e,#1a1040,#0d1a3a)' } },
          (profile.bannerUrl || profile.bannerURL) && e("img", { src: (profile.bannerUrl || profile.bannerURL), className: "mp-banner-img" }),
          e("div", { className: "mp-banner-overlay" }),
          hasMenu && e("div", { className: "mp-menu-trigger", onClick: (ev) => { ev.stopPropagation(); setShowMenu((v) => !v); } }, "⋮"),
          hasMenu && showMenu && e("div", { className: "mp-menu-dropdown", onClick: (ev) => ev.stopPropagation() },
            onOpenProfile && e("div", { className: "mp-menu-item", onClick: () => { setShowMenu(false); onClose(); onOpenProfile(profile.uid); } }, "👤 ", lang === 'ar' ? 'فتح البروفايل' : 'Profile'),
            onReport && !isSelf && e("div", { className: "mp-menu-item danger", onClick: () => { setShowMenu(false); setReportModal(true); } }, "🚨 ", lang === 'ar' ? 'إبلاغ' : 'Report'),
            (onBlock || onUnblock) && !isSelf && e("div", { className: "mp-menu-item", onClick: async () => { setShowMenu(false); onClose(); isBlocked ? await onUnblock?.(profile.uid) : await onBlock?.(profile.uid); } }, isBlocked ? `✅ ${lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}` : `🚫 ${lang === 'ar' ? 'حظر' : 'Block'}`)
          ),
          
          (coupleDoc && partnerData) &&
          e("div", { className: "mp-cp-label", onClick: () => { onClose(); if (window.onOpenMarriage) window.onOpenMarriage(profile.uid); }, style: { cursor: 'pointer' } },
            e("div", { className: "mp-cp-pill" }, lang === 'ar' ? (partnerData.gender === 'male' ? '❤️ زوجي' : '❤️ زوجتي') : (partnerData.gender === 'male' ? '❤️ My Husband' : '❤️ My Wife')),
            e("div", { className: "mp-cp-avatar-wrap" },
              e("div", { className: "mp-cp-thumb" },
                e("div", { className: "mp-cp-thumb-inner" },
                  e("img", { src: partnerData.photo || partnerData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerData.name)}` })
                )
              ),
              e("div", { className: "mp-cp-hud-dot" }), e("div", { className: "mp-cp-hud-dot" }), e("div", { className: "mp-cp-hud-dot" })
            )
          )
        ),
        e("div", { className: "mp-body", style: { background: '#0d0d1f', color: '#fff' } },
          e("div", { className: "mp-badge-row" },
            e("div", { className: "mp-badge-strip" }),
            (profile.topBadges || []).slice(0, 5).map((badge, i) =>
              e("div", { key: i, className: "mp-badge-icon", title: badge.name_en || badge.title_en || '' },
                badge.imageUrl ? e("img", { src: badge.imageUrl, alt: '' }) : badge.icon || '🏅'
              )
            )
          ),
          e("div", { className: "mp-profile-row" },
            e("div", { className: "mp-flame-avatar" },
              e("div", { className: "mp-flame-ring" },
                e("div", { className: "mp-flame-ring-inner", onClick: () => { onClose(); if (onOpenProfile) onOpenProfile(profile.uid); }, style: { cursor: 'pointer', background: '#0d0d1f' } },
                  (() => {
                    var fSrc = profile.equippedFrame;
                    if (fSrc && fSrc !== 'none') {
                      if (!fSrc.startsWith('http') && !fSrc.startsWith('/') && !fSrc.startsWith('data:')) {
                        var found = (window.SHOP_ITEMS?.frames || []).find((f) => f.id === fSrc);
                        if (found) fSrc = found.preview || found.imageUrl;
                        else fSrc = null;
                      }
                      if (fSrc) return e("img", { src: fSrc, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 3, pointerEvents: 'none' } });
                    }
                    return null;
                  })(),
                  e("div", { className: "mp-avatar-pic", style: { width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden' } }, 
                    profile.photo ? e("img", { src: profile.photo, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : "🧑"
                  )
                )
              ),
              e("div", { className: "mp-wings" })
            ),
            e("div", { className: "mp-user-info" },
              e("div", { className: "mp-user-name" },
                 e("span", { className: "mp-gender-icon", style: { marginRight: '6px' } }, profile.gender === 'male' ? '♂️' : '♀️'),
                 window.VIPBadge && profile.vipLevel > 0 && e(window.VIPBadge, { userData: profile, size: 'sm', onClick: () => {} }),
                 window.VIPName ? e(window.VIPName, { displayName: profile.name, userData: profile, style: { fontSize: '18px', fontWeight: '900', color: profile.vipCfg?.nameColor || '#00f2ff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }) :
                 e("div", { className: "mp-user-name-text", style: { color: profile.vipCfg?.nameColor || '#00f2ff' } }, profile.name)
              ),
              e("div", { className: "mp-badges-line" },
                charismaLevel && e("div", { className: `mp-diamond-badge ${charismaLevel.hasGlow || charismaLevel.isDivine ? 'has-glow' : ''}` }, 
                  charismaLevel.iconType === 'image' ? e("img", { src: charismaLevel.iconUrl, style: { width: '14px', height: '14px', borderRadius: charismaLevel.isDivine ? '50%' : '0' } }) : e("span", null, charismaLevel.icon),
                  `Lv.${charismaLevel.level}`
                ),
                familySignEl
              ),
              e("div", { className: "mp-user-id", style: { color: 'rgba(255,255,255,0.4)' } }, "ID: ", profile.customId, 
                e("button", { className: "mp-copy-btn", style: { background: 'none', border: 'none', color: 'inherit' }, onClick: () => { navigator.clipboard?.writeText(profile.customId); window.showToast?.(lang === 'ar' ? 'تم نسخ المعرف' : 'ID Copied'); } }, "📑")
              )
            )
          ),
          e("div", { className: "mp-stats", style: { borderTopColor: 'rgba(255,255,255,0.1)' } },
            e("div", { className: "mp-stat" }, e("div", { className: "mp-stat-value", style: { color: '#fff' } }, profile.gamesPlayed ?? 0), e("div", { className: "mp-stat-label" }, lang === 'ar' ? 'مباريات' : 'GAMES')),
            e("div", { className: "mp-stat", style: { borderLeftColor: 'rgba(255,255,255,0.1)' } }, e("div", { className: "mp-stat-value", style: { color: '#00f2ff' } }, (profile.winRate ?? 0) + "%"), e("div", { className: "mp-stat-label" }, lang === 'ar' ? 'نسبة الفوز' : 'WIN RATE'))
          ),
          e("div", { style: { marginTop: '14px' } },
            isSelf ? e("button", { className: "mp-btn-ghost", style: { background: 'rgba(255,255,255,0.05)', color: '#00f2ff' }, onClick: () => { onClose(); if (onOpenProfile) onOpenProfile(profile.uid); } }, "👤 " + t_my_profile) :
            e("div", null,
              e("div", { className: "mp-multi-btns" },
                profile.isFriend ? e("button", { className: "mp-btn-half mp-friend-btn", style: { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' } }, "✅ " + t_friend) :
                e("button", { className: "mp-btn-half mp-add-btn", onClick: async () => { try { await window.usersCollection?.doc(profile.uid).update({ friendRequests: window.firebase.firestore.FieldValue.arrayUnion(currentUID) }); window.showToast?.(lang === 'ar' ? 'تم إرسال طلب الصداقة' : 'Request sent'); } catch(e){} } }, "➕ " + t_add),
                onSendGift && e("button", { className: "mp-btn-half mp-gift-half-btn", onClick: () => { onClose(); onSendGift(profile); } }, "🎁 " + t_gift)
              )
            )
          )
        )
      )
    ),
    reportModal && e("div", { style: { position: 'fixed', inset: 0, zIndex: zIndex + 1, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }, onClick: () => setReportModal(false) },
      e("div", { style: { width: '100%', maxWidth: '340px', background: '#0d0d1f', borderRadius: '20px', padding: '20px', border: '1px solid #ff4466' }, onClick: (ev) => ev.stopPropagation() },
        e("div", { style: { fontSize: '15px', fontWeight: 800, color: '#f87171', marginBottom: '14px' } }, "🚨 ", lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'),
        ['spam', 'harassment', 'cheating', 'inappropriate', 'other'].map((r) => e("button", { key: r, onClick: () => setReportReason(r), style: { display: 'block', width: '100%', margin: '4px 0', padding: '10px', borderRadius: '8px', border: reportReason === r ? '2px solid #ff4466' : '1px solid rgba(255,255,255,0.1)', background: reportReason === r ? 'rgba(255,68,102,0.15)' : 'rgba(255,255,255,0.05)', color: '#fff' } }, lang === 'ar' ? { spam: 'سبام', harassment: 'تحرش', cheating: 'غش', inappropriate: 'محتوى مسيء', other: 'أخرى' }[r] : r)),
        e("textarea", { value: reportNote, onChange: (ev) => setReportNote(ev.target.value), maxLength: 200, rows: 2, placeholder: lang === 'ar' ? 'تفاصيل...' : 'Details...', style: { width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', resize: 'none' } }),
        e("div", { style: { display: 'flex', gap: '8px', marginTop: '14px' } },
          e("button", { onClick: () => { setReportModal(false); setReportReason(''); setReportNote(''); }, style: { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold' } }, lang === 'ar' ? 'إلغاء' : 'Cancel'),
          e("button", { onClick: _submitReport, disabled: !reportReason, style: { flex: 1, padding: '10px', background: reportReason ? '#ff4466' : 'rgba(255,255,255,0.05)', color: reportReason ? '#fff' : '#aaa', borderRadius: '8px', border: 'none', fontWeight: 'bold' } }, lang === 'ar' ? 'إرسال' : 'Submit')
        )
      )
    )
    );
  };

  // Attach to window
  window.ErrorBoundary = ErrorBoundary;
  window.GuestBanner = GuestBanner;
  window.NotificationToast = NotificationToast;
  window.ModalCloseBtn = ModalCloseBtn;
  window.CharismaDisplay = CharismaDisplay;
  window.AvatarWithFrame = AvatarWithFrame;
  window.AvatarComponent = AvatarWithFrame; // Alias: legacy name for the same component
  window.NotificationDropdown = NotificationDropdown;
  window.MiniProfilePopup = MiniProfilePopup;

  // Global showToast helper
  window.showToast = (msg) => {
    if (typeof window.setGlobalNotification === 'function') {
      window.setGlobalNotification(msg);
    } else {
      // setGlobalNotification not ready yet — queue and retry once
      console.warn('[showToast] not ready, queuing:', msg);
      setTimeout(() => {
        if (typeof window.setGlobalNotification === 'function') {
          window.setGlobalNotification(msg);
        } else {
          console.warn('[showToast] still not ready, dropped:', msg);
        }
      }, 800);
    }
  };

})();