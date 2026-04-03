(function () {
  var { useState, useEffect, useRef } = React;

  class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { }
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
          setTimeout(() => { setVisible(false); onClose(); }, 350);
        }, 2500);
        return () => clearTimeout(hideTimer);
      }
    }, [message]);

    if (!message || !visible) return null;

    var emoji = message.match(/^(\p{Emoji})/u)?.[1] || '💬';
    var cleanMsg = message.replace(/^(\p{Emoji}\s?)/u, '');

    return (/*#__PURE__*/
      React.createElement("div", {
        className: `modern-notification ${exiting ? 'exiting' : ''}`,
        onClick: () => { setExiting(true); setTimeout(() => { setVisible(false); onClose(); }, 350); }
      }, /*#__PURE__*/
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
      React.createElement("div", {
        className: `charisma-container ${hasGlow ? 'has-glow' : ''} ${isDivine ? 'has-divine' : ''}`,
        style: isDivine ? { boxShadow: '0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px', padding: '4px' } : {}
      }, /*#__PURE__*/
        React.createElement("div", { className: "charisma-header" }, /*#__PURE__*/
          React.createElement("span", { className: "charisma-label" }, renderIcon(), t.charisma), /*#__PURE__*/
          React.createElement("span", {
            className: `charisma-level-badge ${currentLevel.badge_class} ${hasGlow ? 'glow-badge' : ''}`,
            style: isDivine ?
              { boxShadow: '0 0 15px rgba(0,212,255,0.7)', border: '1.5px solid rgba(0,212,255,0.7)', color: '#00d4ff', background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))' } :
              hasGlow ? { boxShadow: '0 0 15px ' + currentLevel.color } : {}
          },

            renderIcon(), " Lv.", currentLevel.level,
            isDivine && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', marginLeft: '2px', animation: 'divine-aura 3s ease-in-out infinite' } }, "\u2726")
          )
        ), /*#__PURE__*/
        React.createElement("div", { className: "charisma-bar-bg" }, /*#__PURE__*/
          React.createElement("div", {
            className: "charisma-bar-fill", style: {
              width: `${progress}%`,
              background: isDivine ? 'linear-gradient(90deg,#00d4ff,#7c3aed,#00d4ff)' : undefined,
              backgroundSize: isDivine ? '200% 100%' : undefined,
              animation: isDivine ? 'divine-bar-flow 3s linear infinite' : undefined
            }
          })
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
      xs: { wrapper: 32, avatar: 22, frameSize: 32 },
      sm: { wrapper: 56, avatar: 36, frameSize: 56 },
      md: { wrapper: 72, avatar: 48, frameSize: 72 },
      lg: { wrapper: 90, avatar: 58, frameSize: 90 },
      xl: { wrapper: 140, avatar: 90, frameSize: 140 }
    };
    var config = sizeConfig[size] || sizeConfig.md;
    var frameItem = (window.SHOP_ITEMS?.frames || []).find((f) => f.id === equipped?.frames);
    var showBan = banData?.isBanned && (
      !banData.expiresAt ||
      new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt)));

    var isImageURL = photoURL && (
      photoURL.startsWith('http') || 
      photoURL.startsWith('data:') || 
      photoURL.startsWith('/') ||
      photoURL.startsWith('icos/')
    );
    
    // Detect if this is an effect that REQUIRES screen blending (e.g. black background glow)
    var shouldScreenBlend = (equipped?.isEffect || photoURL && (
      photoURL.toLowerCase().includes('_effect_') || 
      photoURL.toLowerCase().includes('_animate_') ||
      photoURL.toLowerCase().includes('aurora') ||
      photoURL.toLowerCase().includes('inferno')
    ));
    
    // Check if it's an animated format (GIF/WebP) but NOT necessarily an effect
    var isAnimated = photoURL && (
      photoURL.toLowerCase().includes('.gif') || 
      photoURL.toLowerCase().includes('.webp')
    );

    
    // Standardized Avatar Style (Matches Big Profile precision)
    var avatarStyle = { 
      width: config.avatar + 'px', 
      height: config.avatar + 'px', 
      borderRadius: '50%', 
      position: 'absolute', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      zIndex: 2, 
      border: (shouldScreenBlend || isAnimated) ? 'none' : '2px solid rgba(255,255,255,0.12)', 
      boxShadow: (shouldScreenBlend || isAnimated) ? 'none' : '0 4px 12px rgba(0,0,0,0.4)', 
      filter: showBan ? 'grayscale(80%) brightness(0.4)' : 'none',
      overflow: 'hidden',
      background: 'transparent',
      mixBlendMode: shouldScreenBlend ? 'screen' : 'normal' 
    };

    var renderFrame = () => {
      if (!equipped?.frames || equipped.frames === 'none') return null;
      
      if (!frameItem) {
        frameItem = (window.SHOP_ITEMS?.frames || []).find((f) => f.id === equipped.frames || f.preview === equipped.frames);
      }
      if (!frameItem) return null;

      var frameUrl = frameItem.preview || frameItem.imageUrl;
      if (!frameUrl) return null;

      // Handle CSS Gradients vs Image URLs
      var isGradient = frameUrl.includes('linear-gradient') || frameUrl.includes('radial-gradient');
      var frameNeedsScreenBlend = !isGradient && (
        frameUrl.toLowerCase().includes('.gif') || 
        frameUrl.toLowerCase().includes('fickle') || 
        frameUrl.toLowerCase().includes('pure') || 
        frameUrl.toLowerCase().includes('effect') || 
        frameUrl.toLowerCase().includes('animate')
      );

      return (/*#__PURE__*/
        React.createElement("div", { 
          style: { 
            position: 'absolute', 
            inset: 0, 
            zIndex: 10, 
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            overflow: 'visible' // Allow parts to go slightly outside
          } 
        }, isGradient ? /*#__PURE__*/
          React.createElement("div", { 
            style: { 
              width: '100%', 
              height: '100%', 
              background: frameUrl,
              opacity: 0.8,
              borderRadius: '50%'
            } 
          }) : /*#__PURE__*/
          React.createElement("img", {
            src: frameUrl, 
            style: { 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              mixBlendMode: frameNeedsScreenBlend ? 'screen' : 'normal',
              pointerEvents: 'none'
            }, 
            alt: "frame",
            onError: (e) => { e.target.style.display = 'none'; }
          })
        ));
    };

    var displayPhotoURL = photoURL;
    if (photoURL && frameItem && (photoURL === frameItem.preview || photoURL === frameItem.imageUrl)) {
      displayPhotoURL = `https://ui-avatars.com/api/?name=User&background=random`;
    }

    var displayIsImageURL = displayPhotoURL && (
      displayPhotoURL.startsWith('http') || 
      displayPhotoURL.startsWith('data:') || 
      displayPhotoURL.startsWith('/') ||
      displayPhotoURL.startsWith('icos/')
    );

    return (/*#__PURE__*/
      React.createElement("div", { style: { position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }, onClick: onClick },
        renderFrame(),
        displayIsImageURL ? /*#__PURE__*/
          React.createElement("img", {
            src: displayPhotoURL, style: { ...avatarStyle, objectFit: 'cover' }, alt: "avatar",
            onError: (e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=User&background=random`; }
          }) :
          displayPhotoURL ? /*#__PURE__*/
            React.createElement("div", { style: { ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', fontSize: Math.round(config.avatar * 0.52) + 'px', userSelect: 'none' } },
              displayPhotoURL
            ) : /*#__PURE__*/

            React.createElement("img", { src: `https://ui-avatars.com/api/?name=User&background=random`, style: { ...avatarStyle, objectFit: 'cover' }, alt: "avatar" }),

        showBan && /*#__PURE__*/
        React.createElement("div", {
          style: {
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: config.avatar + 'px', height: config.avatar + 'px',
            borderRadius: '50%', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(220,0,0,0.55)',
            border: '2px solid rgba(255,50,50,0.9)',
            flexDirection: 'column', gap: '0px'
          }
        }, /*#__PURE__*/
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
    var getNotificationIcon = (type) => { switch (type) { case 'friend_request': return '👥'; case 'gift': return '🎁'; case 'message': return '💬'; case 'friend_request_accepted': return '✅'; case 'achievement': return '🏆'; default: return '🔔'; } };

    return (/*#__PURE__*/
      React.createElement("div", { className: "notification-dropdown animate-pop" }, /*#__PURE__*/
        React.createElement("div", { className: "notification-dropdown-header" }, /*#__PURE__*/
          React.createElement("span", { className: "notification-dropdown-title" }, t.notifications, " ", unreadCount > 0 && `(${unreadCount})`),
          notifications.length > 0 && /*#__PURE__*/React.createElement("button", { onClick: onClearAll, className: "notification-clear-all" }, t.clearAll)
        ), /*#__PURE__*/
        React.createElement("div", { className: "notification-list" },
          notifications.length === 0 ? /*#__PURE__*/React.createElement("div", { className: "notification-empty" }, /*#__PURE__*/React.createElement("div", { className: "text-3xl mb-2" }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("p", null, t.noNotifications)) : notifications.map((notif) => /*#__PURE__*/
            React.createElement("div", { key: notif.id, className: `notification-item ${!notif.read ? 'unread' : ''}`, onClick: () => { onMarkRead(notif.id); onNotificationClick(notif); onClose(); } }, /*#__PURE__*/
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
    onOpenFamily = null, onOpenCoupleCard = null,
    onOpenInventory = null,
    zIndex = window.Z?.OVERLAY || 1000
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
    
    // Fix: Define isBlocked (Bug 4)
    var isBlocked = (window.currentUserData?.blockedUsers || []).includes(profile.uid);
    var displayName = profile.name || profile.displayName || '—';
    var isSelf = profile.uid === currentUID;
    var hasMenu = true; // Always show menu for Profile/Block/Report
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
      return React.createElement("div", { className: "mp-calm-badge", onClick: (onOpenFamily || window.onOpenFamily) ? () => { if (onClose) onClose(); (onOpenFamily || window.onOpenFamily)(profile.familyId); } : undefined, style: { cursor: (onOpenFamily || window.onOpenFamily) ? 'pointer' : 'default' } }, profile.familyTag);
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
        } catch (e) { console.error(e); }
      }
      setReportModal(false); setReportReason(''); setReportNote('');
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
            e("div", { className: "mp-banner-overlay" })
          ),

          /* --- Move Menu Outside Banner to prevent clipping (Bug 4) --- */
          hasMenu && e("div", { className: "mp-menu-trigger", onClick: (ev) => { ev.stopPropagation(); setShowMenu((v) => !v); }, style: { zIndex: 2010 } }, "⋮"),
          hasMenu && showMenu && e("div", { className: "mp-menu-dropdown", onClick: (ev) => ev.stopPropagation(), style: { zIndex: 2011 } },
            e("div", { className: "mp-menu-item", onClick: () => { setShowMenu(false); onClose(); onOpenProfile ? onOpenProfile(profile.uid) : (window.setShowUserProfile && window.setShowUserProfile(true)); } }, "👤 ", lang === 'ar' ? 'فتح البروفايل' : 'Profile'),
            !isSelf && e("div", { className: "mp-menu-item danger", onClick: () => { setShowMenu(false); setReportModal(true); } }, "🚨 ", lang === 'ar' ? 'إبلاغ' : 'Report'),
            !isSelf && e("div", { className: "mp-menu-item", onClick: async () => { 
                setShowMenu(false); 
                onClose(); 
                if (isBlocked) {
                  if (onUnblock) await onUnblock(profile.uid);
                  else if (window.handleUnblockUser) await window.handleUnblockUser(profile.uid);
                } else {
                  if (onBlock) await onBlock(profile.uid);
                  else if (window.handleBlockUser) {
                    await window.handleBlockUser(profile.uid);
                    if (window.showToast) window.showToast(lang === 'ar' ? 'تم الحظر بنجاح' : 'User blocked successfully', 'success');
                    onClose();
                  }
                }
              } }, (isBlocked ? "✅ " : "🚫 ") + (lang === 'ar' ? (isBlocked ? 'إلغاء الحظر' : 'حظر') : (isBlocked ? 'Unblock' : 'Block')))
          ),

          /* --- Exact Position based on Red Box Feedback (Bug 3) --- */
          (coupleDoc && partnerData) && e("div", { 
              className: "mp-cp-label", 
              onClick: (ev) => { 
                ev.stopPropagation();
                onClose(); 
                if (onOpenCoupleCard) onOpenCoupleCard(coupleDoc);
                else if (window.openCoupleCard) window.openCoupleCard(coupleDoc);
                else if (window.setShowCoupleCard) window.setShowCoupleCard(true);
              }, 
              style: { 
                cursor: 'pointer', 
                top: '90px', 
                right: '18px', 
                position: 'absolute', 
                zIndex: 25, 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                maxWidth: 'calc(100% - 24px)', 
                justifyContent: 'flex-end',
                transform: 'scale(1.0)',
                transformOrigin: 'right top'
              } 
            },
              e("div", { 
                className: "mp-cp-pill", 
                style: { 
                  padding: '6px 14px', 
                  background: 'rgba(255,255,255,0.06)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                } 
              },
                (lang === 'ar' ? 
                  ((profile.gender || 'male') === 'female' ? 'بيتها' : 'بيته') : 
                  ((profile.gender || 'male') === 'female' ? 'Her Home' : 'His Home')),
                /* Real Ring Asset Integration */
                profile.coupleRingImageUrl ? 
                  e("img", { src: profile.coupleRingImageUrl, style: { width: '20px', height: '20px', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' } }) :
                  e("span", { style: { fontSize: '16px', filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' } }, profile.coupleRingEmoji || '💍')
              ),
              (coupleDoc && partnerData) && e("div", { className: "mp-cp-avatar-wrap", style: { width: '36px', height: '36px', marginLeft: '-10px' } },
                e("div", { className: "mp-cp-avatar-wrap-inner", style: { position: 'relative', width: '100%', height: '100%' } },
                  e("div", { className: "mp-cp-thumb", style: { inset: '2px', position: 'relative' } },
                    e(AvatarWithFrame, {
                      photoURL: partnerData.photo || partnerData.photoURL,
                      size: 'xs',
                      lang: lang
                    })
                  ),
                  e("div", { className: "mp-cp-hud-dot", style: { width: '3px', height: '3px' } }), e("div", { className: "mp-cp-hud-dot", style: { width: '3px', height: '3px' } })
                )
              )
            ),

          e("div", { className: "mp-body", style: { background: '#0d0d1f', color: '#fff' } },
            e("div", { className: "mp-badge-row", style: { height: '48px', margin: '0 -18px 14px', padding: 0 } },
              e("div", { className: "mp-ribbon-right", style: { width: 'auto', minWidth: '40px' } },
                (profile.topBadges || []).slice(0, 5).map((badge, i) =>
                  e("div", { key: i, className: "mp-badge-square", title: badge.name_en || badge.title_en || '' },
                    badge.imageUrl ? e("img", { src: badge.imageUrl, alt: '', style: { width: '24px', height: '24px', objectFit: 'contain' } }) : badge.icon || '🏅'
                  )
                )
              )
            ),
            e("div", { className: "mp-profile-row" },
              e("div", { className: "mp-avatar-container", style: { cursor: 'pointer', position: 'relative' } },
                e(AvatarWithFrame, {
                  photoURL: profile.photo || profile.photoURL,
                  equipped: profile.equipped || { 
                    frames: profile.equippedFrame,
                    isEffect: profile.photo && (profile.photo.includes('.gif') || profile.photo.includes('effect')) 
                  },
                  size: 'md',
                  lang: lang,
                  onClick: () => { onClose(); if (onOpenProfile) onOpenProfile(profile.uid); }
                })
              ),
              e("div", { className: "mp-user-info" },
                e("div", { className: "mp-user-name" },
                  window.VIPBadge && profile.vipLevel > 0 && e(window.VIPBadge, { userData: profile, size: 'sm', onClick: () => { } }),
                  window.VIPName ? e(window.VIPName, { displayName: displayName, userData: profile, style: { fontSize: '18px', fontWeight: '900', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }) :
                    e("div", { className: "mp-user-name-text", style: { color: profile.vipCfg?.nameColor || '#ffffff' } }, displayName)
                ),
                e("div", { className: "mp-badges-line" },
                  e("span", { className: `gender-icon ${profile.gender === 'male' ? 'gender-icon-male' : 'gender-icon-female'}` }, profile.gender === 'male' ? '♂️' : '♀️'),
                  charismaLevel && e("div", { className: `mp-diamond-badge ${charismaLevel.hasGlow || charismaLevel.isDivine ? 'has-glow' : ''}` },
                    charismaLevel.iconType === 'image' ? e("img", { src: charismaLevel.iconUrl, style: { width: '14px', height: '14px', borderRadius: charismaLevel.isDivine ? '50%' : '0' } }) : e("span", null, charismaLevel.icon),
                    `Lv.${charismaLevel.level}`
                  ),
                  familySignEl
                ),
                e("div", { className: "mp-user-id", style: { color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' } }, 
                  (() => {
                    var vipIdIcon = window.VIP_ID_ICONS?.[profile.vipLevel] || window.ID_ICON_IMAGE_URL;
                    return vipIdIcon ? e("img", { src: vipIdIcon, style: { height: '16px', objectFit: 'contain' } }) : "ID: ";
                  })(),
                  profile.customId,
                  e("button", { className: "mp-copy-btn", style: { background: 'none', border: 'none', color: 'inherit', padding: '2px', cursor: 'pointer', opacity: 0.7 }, onClick: () => { navigator.clipboard?.writeText(profile.customId); window.showToast?.(lang === 'ar' ? 'تم نسخ المعرف' : 'ID Copied'); } }, "📑")
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
                      e("button", { className: "mp-btn-half mp-add-btn", onClick: async () => { try { await window.usersCollection?.doc(profile.uid).update({ friendRequests: window.firebase.firestore.FieldValue.arrayUnion(currentUID) }); window.showToast?.(lang === 'ar' ? 'تم إرسال طلب الصداقة' : 'Request sent'); } catch (e) { } } }, "➕ " + t_add),
                    e("button", { className: "mp-btn-half mp-gift-half-btn", onClick: () => { 
                      onClose();
                      if (window.openGiftModal) {
                        window.openGiftModal(profile);
                      } else {
                        // Fallback to inventory if modal logic is missing
                        if (onOpenInventory) onOpenInventory();
                        else if (window.setShowInventory) window.setShowInventory(true);
                      }
                    } }, "🎁 " + t_gift)
                  )
                )
            )
          )
        )
      ),
      reportModal && e("div", { style: { position: 'fixed', inset: 0, zIndex: zIndex + 1, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }, onClick: () => setReportModal(false) },
        e("div", { style: { width: '100%', maxWidth: '340px', background: '#0d0d1f', borderRadius: '20px', padding: '20px', border: '1px solid #e63946' }, onClick: (ev) => ev.stopPropagation() },
          e("div", { style: { fontSize: '15px', fontWeight: 800, color: '#e63946', marginBottom: '14px' } }, "🚨 ", lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'),
          ['spam', 'harassment', 'cheating', 'inappropriate', 'other'].map((r) => e("button", { key: r, onClick: () => setReportReason(r), style: { display: 'block', width: '100%', margin: '4px 0', padding: '10px', borderRadius: '8px', border: reportReason === r ? '2px solid #e63946' : '1px solid rgba(255,255,255,0.1)', background: reportReason === r ? 'rgba(230, 57, 70, 0.15)' : 'rgba(255,255,255,0.05)', color: '#fff' } }, lang === 'ar' ? { spam: 'سبام', harassment: 'تحرش', cheating: 'غش', inappropriate: 'محتوى مسيء', other: 'أخرى' }[r] : r)),
          e("textarea", { value: reportNote, onChange: (ev) => setReportNote(ev.target.value), maxLength: 200, rows: 2, placeholder: lang === 'ar' ? 'تفاصيل...' : 'Details...', style: { width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', resize: 'none' } }),
          e("div", { style: { display: 'flex', gap: '8px', marginTop: '14px' } },
            e("button", { onClick: () => { setReportModal(false); setReportReason(''); setReportNote(''); }, style: { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold' } }, lang === 'ar' ? 'إلغاء' : 'Cancel'),
            e("button", { onClick: _submitReport, disabled: !reportReason, style: { flex: 1, padding: '10px', background: reportReason ? '#e63946' : 'rgba(255,255,255,0.05)', color: reportReason ? '#fff' : '#aaa', borderRadius: '8px', border: 'none', fontWeight: 'bold' } }, lang === 'ar' ? 'إرسال' : 'Submit')
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
