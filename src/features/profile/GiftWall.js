/**
 * GiftWall.js
 * Shows the grid of gifts on the profile.
 * Extracted from 15-profile.js
 */
var GiftWallV11 = ({ gifts, lang, onSendGiftToSelf, isOwnProfile, userData, onOpenProfile }) => {
  var [activeTab, setActiveTab] = React.useState('wall');
  var [selectedGiftDetail, setSelectedGiftDetail] = React.useState(null);
  var [showAllGifts, setShowAllGifts] = React.useState(false);
  var [rotatingIdx, setRotatingIdx] = React.useState(0);
  // open full wall modal on banner click
  var [showWallModal, setShowWallModal] = React.useState(false);
  var GIFTS_LIMIT = 32;

  // Calculate gift data (counts, top senders)
  var giftData = React.useMemo(() => {
    var counts = {};
    var lastSenders = {};
    var senderTally = {}; // { giftId: { senderId: count } }

    gifts?.forEach((g) => {
      // 🛡️ [PRIVACY] Filter out private gifts for visitors
      if (g.isPrivate && !isOwnProfile) return;

      counts[g.giftId] = (counts[g.giftId] || 0) + 1;
      if (!lastSenders[g.giftId]) lastSenders[g.giftId] = { name: g.senderName, photo: g.senderPhoto, uid: g.senderId };
      if (!senderTally[g.giftId]) senderTally[g.giftId] = {};
      senderTally[g.giftId][g.senderId] = (senderTally[g.giftId][g.senderId] || 0) + 1;
    });

    // Find top sender per gift
    var topSenderInfo = {};
    Object.entries(senderTally).forEach(([giftId, tally]) => {
      var sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      if (sorted.length) {
        var [topUid, topCount] = sorted[0];
        var entry = gifts.find((g) => g.giftId === giftId && g.senderId === topUid);
        topSenderInfo[giftId] = { uid: topUid, count: topCount, name: entry?.senderName || '?', photo: entry?.senderPhoto || null };
      }
    });

    return { counts, lastSenders, topSenderInfo };
  }, [gifts, isOwnProfile]);

  // ALL gifts (hidden + shop + VIP + Limited + Event)
  var SHOP_ITEMS = window.SHOP_ITEMS || {};
  var RARITY_CONFIG = window.RARITY_CONFIG || {};
  var VIP_CONFIG = window.VIP_CONFIG || [];
  var Z = window.Z || { MODAL: 1000, TOOLTIP: 9999 };

  // 🎯 [DYNAMIC] Collect all gift cat egories from SHOP_ITEMS
  var allGifts = React.useMemo(() => {
    var combined = [];
    var categories = ['gifts', 'gifts_vip', 'gifts_family', 'gifts_special', 'gifts_flag', 'gifts_limited', 'gifts_event', 'gifts_exclusive', 'gifts_custom'];
    categories.forEach(cat => {
      if (SHOP_ITEMS[cat]) combined = combined.concat(SHOP_ITEMS[cat]);
    });

    // 3️⃣ Sort by rarity: Mythic > Legendary > Epic > Rare > Uncommon > Common
    var rarityWeights = { 'Mythic': 100, 'Legendary': 80, 'Epic': 60, 'Rare': 40, 'Uncommon': 20, 'Common': 10 };

    // Remove duplicates and Sort
    var seen = new Set();
    return combined.filter(g => {
      if (seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    }).sort((a, b) => {
      var rA = window.getGiftRarity ? window.getGiftRarity(a.cost || 0) : (a.rarity || 'Common');
      var rB = window.getGiftRarity ? window.getGiftRarity(b.cost || 0) : (b.rarity || 'Common');
      var wA = rarityWeights[rA] || 0;
      var wB = rarityWeights[rB] || 0;

      if (wA !== wB) return wB - wA; // Sort by weight
      return (b.cost || 0) - (a.cost || 0); // Then by cost
    });
  }, [SHOP_ITEMS]);

  var displayGifts = showAllGifts ? allGifts : allGifts.slice(0, GIFTS_LIMIT);
  var hasMoreGifts = allGifts.length > GIFTS_LIMIT;

  // Stats
  var totalGifts = gifts?.length || 0;
  var uniqueTypesCount = Object.keys(giftData.counts).length;
  var totalCharisma = gifts?.reduce((s, g) => s + (g.charisma || 0), 0) || 0;

  // Rotating recent gift images for the mini card
  var recentUnique = React.useMemo(() => {
    var seen = new Set(); var res = [];
    for (var g of gifts || []) {
      if (!seen.has(g.giftId)) { seen.add(g.giftId); res.push(g); }
      if (res.length >= 5) break;
    }
    return res;
  }, [gifts]);

  React.useEffect(() => {
    if (recentUnique.length <= 1) return;
    var t = setInterval(() => setRotatingIdx((p) => (p + 1) % recentUnique.length), 1500);
    return () => clearInterval(t);
  }, [recentUnique.length]);

  var fmtBig = window.fmtNum; // unified — defined in 01-config.js

  return (/*#__PURE__*/
    React.createElement("div", { className: "profile-gift-section" }, /*#__PURE__*/


      React.createElement("div", {
        onClick: () => setShowWallModal(true),
        style: {
          position: 'relative', overflow: 'hidden',
          borderRadius: '16px',
          background: 'linear-gradient(135deg,rgba(8,8,22,0.97),rgba(16,8,36,0.97))',
          border: '1px solid rgba(255,255,255,0.09)',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s'
        },
        onMouseEnter: (e) => e.currentTarget.style.boxShadow = '0 0 18px rgba(112,0,255,0.25)',
        onMouseLeave: (e) => e.currentTarget.style.boxShadow = 'none'
      }, /*#__PURE__*/


        React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%,rgba(112,0,255,0.07),transparent 65%)', pointerEvents: 'none' } }),
        [{ t: '12%', l: '55%', s: 3 }, { t: '40%', l: '80%', s: 2 }, { t: '70%', l: '60%', s: 4 }, { t: '20%', l: '90%', s: 2 }, { t: '60%', l: '72%', s: 3 }].map((d, i) => /*#__PURE__*/
          React.createElement("div", { key: i, style: { position: 'absolute', top: d.t, left: d.l, width: d.s, height: d.s, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' } })
        ), /*#__PURE__*/

        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', position: 'relative' } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '13px', fontWeight: 800, color: 'white', letterSpacing: '0.3px' } }, "\uD83C\uDF81 ", lang === 'ar' ? 'جدار الهدايا' : 'Gift Wall'), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '11px', color: '#6b7280', fontWeight: 600 } }, lang === 'ar' ? 'اضغط للعرض ›' : 'Tap to view ›')
        ), /*#__PURE__*/

        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' } }, /*#__PURE__*/

          React.createElement("div", { style: { position: 'relative', width: '82px', height: '60px', flexShrink: 0 } },
            recentUnique.length > 0 ? recentUnique.slice(0, 3).map((g, i) => {
              var isActive = i === rotatingIdx % Math.min(3, recentUnique.length);
              return (/*#__PURE__*/
                React.createElement("div", {
                  key: g.id || i, style: {
                    position: 'absolute', left: `${i * 16}px`, top: `${i * 4}px`,
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: 'rgba(25,15,50,0.95)',
                    border: `1.5px solid ${isActive ? 'rgba(255,215,0,0.65)' : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 0 14px rgba(255,215,0,0.3)' : 'none',
                    transition: 'all 0.6s ease',
                    zIndex: 3 - i
                  }
                },
                  g.giftImageUrl ? /*#__PURE__*/React.createElement("img", { src: g.giftImageUrl, alt: "", style: { width: '32px', height: '32px', objectFit: 'contain', background: 'transparent' } }) : /*#__PURE__*/
                    React.createElement("span", { style: { fontSize: '26px' } }, g.giftEmoji || '🎁')
                ));


            }) : /*#__PURE__*/
              React.createElement("div", { style: { width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, /*#__PURE__*/
                React.createElement("span", { style: { fontSize: '22px', opacity: 0.35 } }, "\uD83C\uDF81")
              )

          ), /*#__PURE__*/


          React.createElement("div", { style: { display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center' } },
            [
              { val: totalGifts, label: lang === 'ar' ? 'هدية' : 'Gift', color: 'white' },
              { val: fmtBig ? fmtBig(totalCharisma) : totalCharisma, label: lang === 'ar' ? 'نجمة' : 'Star', color: '#fbbf24' },
              { val: uniqueTypesCount, label: lang === 'ar' ? 'نوع' : 'Badge', color: '#a78bfa' }].
              map((s, i, arr) => /*#__PURE__*/
                React.createElement(React.Fragment, { key: s.label }, /*#__PURE__*/
                  React.createElement("div", { style: { textAlign: 'center' } }, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '20px', fontWeight: 900, color: s.color, lineHeight: 1 } }, s.val), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', marginTop: '3px', fontWeight: 600 } }, s.label)
                  ),
                  i < arr.length - 1 && /*#__PURE__*/React.createElement("div", { style: { width: '1px', height: '34px', background: 'rgba(255,255,255,0.07)' } })
                )
              )
          )
        )
      ),


      showWallModal && /*#__PURE__*/
      React.createElement(window.PortalModal, null, /*#__PURE__*/
        React.createElement("div", {
          onClick: () => setShowWallModal(false), style: {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
            zIndex: Z.MODAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }
        }, /*#__PURE__*/
          React.createElement("div", {
            onClick: (e) => e.stopPropagation(), style: {
              width: '100%', maxWidth: '420px', maxHeight: '82vh',
              borderRadius: '18px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(160deg,#060612,#0a0a1e)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9)'
            }
          }, /*#__PURE__*/

            React.createElement("div", {
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'linear-gradient(135deg,rgba(8,8,22,1),rgba(20,10,40,1))',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0
              }
            }, /*#__PURE__*/
              React.createElement("span", { style: { fontSize: '15px', fontWeight: 900, color: 'white' } }, "\uD83C\uDF81 ", lang === 'ar' ? 'جدار الهدايا' : 'Gift Wall'), /*#__PURE__*/
              React.createElement("button", {
                onClick: () => setShowWallModal(false), style: {
                  background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
                  fontSize: '16px', cursor: 'pointer', borderRadius: '50%',
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }
              }, "\u2715")
            ), /*#__PURE__*/


            React.createElement("div", { style: { display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 } },
              [
                { id: 'wall', icon: '🎁', ar: 'الهدايا', en: 'Gifts' },
                { id: 'log', icon: '📬', ar: 'السجل', en: 'Log' }].
                map((tab) => /*#__PURE__*/
                  React.createElement("button", {
                    key: tab.id, onClick: () => setActiveTab(tab.id), style: {
                      flex: 1, padding: '10px 4px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', border: 'none',
                      background: 'transparent',
                      color: activeTab === tab.id ? '#00f2ff' : '#6b7280',
                      borderBottom: activeTab === tab.id ? '2px solid #00f2ff' : '2px solid transparent'
                    }
                  },
                    tab.icon, " ", lang === 'ar' ? tab.ar : tab.en
                  )
                )
            ), /*#__PURE__*/


            React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '12px 14px', background: 'linear-gradient(160deg,#060612,#0a0a1e)' } },


              activeTab === 'wall' && /*#__PURE__*/
              React.createElement(React.Fragment, null, /*#__PURE__*/
                React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' } },
                  displayGifts.map((gift) => {
                    var count = giftData.counts[gift.id] || 0;
                    var unlocked = count > 0;
                    var lvl = window.getGiftLevel ? window.getGiftLevel(count) : 0;
                    var frame = window.getGiftLevelFrame ? window.getGiftLevelFrame(lvl) : {};
                    var rKey = window.getGiftRarity ? window.getGiftRarity(gift.cost) : 'Common';
                    var rarity = RARITY_CONFIG[rKey] || {};
                    var topSdr = giftData.lastSenders[gift.id];
                    var isVIP = gift.type === 'gifts_vip';
                    var vipCfg = isVIP && gift.vipMinLevel > 0 ? VIP_CONFIG[gift.vipMinLevel - 1] : null;
                    var vipColor = vipCfg ? vipCfg.nameColor : null;

                    return (/*#__PURE__*/
                      React.createElement("div", {
                        key: gift.id,
                        onClick: () => setSelectedGiftDetail({ gift, count, rarity, rKey, level: lvl }),
                        style: {
                          position: 'relative', borderRadius: '11px', cursor: 'pointer',
                          border: unlocked ? vipColor ? `2px solid ${vipColor}88` : frame.border : '1.5px solid rgba(50,50,70,0.35)',
                          background: unlocked ?
                            vipColor ?
                              `linear-gradient(160deg,${vipColor}16,rgba(12,8,22,0.97))` :
                              `linear-gradient(160deg,${rarity.color}14,rgba(12,8,22,0.97))` :
                            'rgba(12,12,22,0.7)',
                          boxShadow: unlocked ? vipColor ? `0 0 8px ${vipColor}33` : frame.shadow : 'none',
                          aspectRatio: '3/4',
                          overflow: 'hidden',
                          transition: 'transform 0.15s'
                        },
                        onMouseEnter: (e) => { if (unlocked) e.currentTarget.style.transform = 'scale(1.06)'; },
                        onMouseLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; }
                      },


                        unlocked && topSdr?.photo && /*#__PURE__*/
                        React.createElement("img", {
                          src: topSdr.photo, alt: "",
                          style: { position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', zIndex: 4, objectFit: 'cover' }
                        }),


                        unlocked && lvl > 0 && /*#__PURE__*/
                        React.createElement("div", {
                          style: {
                            position: 'absolute', top: '4px', left: '4px',
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: lvl === 3 ? '#ffd700' : lvl === 2 ? '#C0C0C0' : '#cd7f32',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '7px', fontWeight: 900, color: '#000', zIndex: 4,
                            boxShadow: `0 0 6px ${lvl === 3 ? '#ffd70099' : lvl === 2 ? '#C0C0C099' : '#cd7f3299'}`
                          }
                        }, lvl),


                        isVIP && vipColor && !unlocked && /*#__PURE__*/
                        React.createElement("div", { style: { position: 'absolute', top: '3px', left: '3px', fontSize: '6px', fontWeight: 900, background: vipColor, color: '#000', padding: '1px 3px', borderRadius: '3px', lineHeight: 1.2, zIndex: 4 } }, "V",
                          gift.vipMinLevel
                        ), /*#__PURE__*/


                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '68%', paddingTop: '6px' } },
                          gift.imageUrl && gift.imageUrl.trim() ? /*#__PURE__*/
                            React.createElement("img", { src: gift.imageUrl, alt: gift.name_en, style: { width: '40px', height: '40px', objectFit: 'contain', background: 'transparent', filter: unlocked ? `drop-shadow(0 0 6px ${rarity.color}66)` : 'grayscale(1)' } }) : /*#__PURE__*/

                            React.createElement("span", { style: { fontSize: '24px', lineHeight: 1, filter: unlocked ? `drop-shadow(0 0 7px ${rarity.color}77)` : 'grayscale(1) opacity(0.5)' } }, gift.emoji || '🎁')

                        ),

                        unlocked && /*#__PURE__*/
                        React.createElement("div", { style: { position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1px' } },
                          [1, 2, 3].map((s) => /*#__PURE__*/
                            React.createElement("span", { key: s, style: { fontSize: '8px', color: lvl >= s ? '#ffd700' : 'rgba(255,255,255,0.18)', filter: lvl >= s ? 'drop-shadow(0 0 3px #ffd700)' : 'none' } }, "\u2605")
                          )
                        ), /*#__PURE__*/


                        React.createElement("div", {
                          style: {
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(transparent,rgba(0,0,0,0.88))',
                            borderRadius: '0 0 9px 9px', padding: '2px 4px 3px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }
                        }, /*#__PURE__*/
                          React.createElement("span", { style: { fontSize: '7px', color: '#d1d5db', fontWeight: 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 } },
                            lang === 'ar' ? gift.name_ar : gift.name_en
                          ),
                          unlocked && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', color: frame.labelColor, fontWeight: 800, lineHeight: 1 } }, "\xD7", count)
                        )
                      ));

                  })
                ),
                hasMoreGifts && /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => setShowAllGifts((v) => !v), style: {
                    width: '100%', marginTop: '8px', padding: '8px',
                    background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.15)',
                    borderRadius: '8px', color: '#00f2ff', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                  }
                },
                  showAllGifts ? lang === 'ar' ? '▲ عرض أقل' : '▲ Show Less' :
                    `▼ ${lang === 'ar' ? 'المزيد' : 'More'} (${allGifts.length - GIFTS_LIMIT} ${lang === 'ar' ? 'هدية' : 'gifts'})`
                )

              ),



              activeTab === 'log' && /*#__PURE__*/
              React.createElement("div", { className: "profile-gift-log" },
                gifts && gifts.length > 0 ?
                  gifts.slice(0, 10).map((gift, idx) => {
                    var logRarityKey = window.getGiftRarity ? window.getGiftRarity(gift.giftCost || 0) : 'Common';
                    var isMythicLog = logRarityKey === 'Mythic';
                    return (/*#__PURE__*/
                      React.createElement("div", {
                        key: idx, className: `profile-gift-log-item${isMythicLog ? ' mythic-glow' : ''}`,
                        style: isMythicLog ? { border: '1px solid rgba(255,0,85,0.5)', background: 'rgba(255,0,85,0.08)' } : {}
                      }, /*#__PURE__*/
                        React.createElement("img", {
                          src: gift.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.senderName || 'User')}&background=6366f1&color=fff`,
                          alt: "", className: "profile-gift-log-avatar",
                          onClick: () => gift.senderId && onOpenProfile && onOpenProfile(gift.senderId),
                          title: gift.senderName || 'Unknown'
                        }), /*#__PURE__*/
                        React.createElement("div", { className: "profile-gift-log-content" }, /*#__PURE__*/
                          React.createElement("div", { className: "profile-gift-log-sender" },
                            gift.senderName || 'Unknown',
                            isMythicLog && /*#__PURE__*/React.createElement("span", { style: { marginLeft: '4px', fontSize: '9px', color: '#ff0055' } }, "\uD83D\uDD2E Mythic")
                          ), /*#__PURE__*/
                          React.createElement("div", { className: "profile-gift-log-details" }, /*#__PURE__*/
                            React.createElement("span", { className: "profile-gift-log-emoji" }, gift.giftEmoji || '🎁'), /*#__PURE__*/
                            React.createElement("span", { className: "profile-gift-log-name" }, lang === 'ar' ? gift.giftNameAr || 'هدية' : gift.giftNameEn || 'Gift')
                          )
                        ), /*#__PURE__*/
                        React.createElement("div", { className: "profile-gift-log-stats" }, /*#__PURE__*/
                          React.createElement("div", { className: "profile-gift-log-charisma", style: isMythicLog ? { color: '#ff0055' } : {} }, "+", gift.charisma || 0), /*#__PURE__*/
                          React.createElement("div", { className: "profile-gift-log-time" }, gift.timestamp?.toDate ? formatTime(gift.timestamp) : '')
                        )
                      ));

                  }) : /*#__PURE__*/

                  React.createElement("div", { className: "profile-gift-empty" }, /*#__PURE__*/
                    React.createElement("span", { style: { fontSize: '32px' } }, "\uD83C\uDF81"), /*#__PURE__*/
                    React.createElement("span", null, lang === 'ar' ? 'لا توجد هدايا بعد' : 'No gifts yet')
                  )

              )

            )
          )
        ),


        selectedGiftDetail && /*#__PURE__*/
        React.createElement(window.GiftWallDetailModalV12, {
          giftDetail: selectedGiftDetail,
          topSenderInfo: giftData.topSenderInfo,
          lang: lang,
          onClose: () => setSelectedGiftDetail(null)
        }
        )

      )

    ));

};

window.GiftWallV11 = GiftWallV11;
