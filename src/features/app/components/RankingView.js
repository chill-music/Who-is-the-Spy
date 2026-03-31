(function () {
  /**
   * RankingView — Exact replica of the original OG 10-app.js ranking section.
   * Uses simple <img> tags (not AvatarWithFrame) to avoid React #130 undefined errors.
   * Includes podium-new (top 3) + lb-list-new (positions 4+).
   */
  window.RankingView = function ({
    leaderboardTab, setLeaderboardTab,
    leaderboardData, charismaLeaderboard, familyLeaderboard,
    lang, t, openProfile, setViewFamilyId, setShowFamilyModal,
    userFamily, isLoggedIn
  }) {
    var fmtNum = window.fmtNum || ((n) => (n || 0).toLocaleString());

    // Safe arrays
    var winsData = leaderboardData || [];
    var charismaData = charismaLeaderboard || [];
    var famData = familyLeaderboard || [];

    return (/*#__PURE__*/
      React.createElement("div", { style: { paddingBottom: '8px' } }, /*#__PURE__*/

      React.createElement("div", { className: "lb-tabs-new", style: { margin: '12px 16px 0' } }, /*#__PURE__*/
      React.createElement("button", { className: `lb-tab-new ${leaderboardTab === 'wins' ? 'active' : ''}`, onClick: () => setLeaderboardTab('wins') }, "\uD83C\uDFC6 ", t.wins), /*#__PURE__*/
      React.createElement("button", { className: `lb-tab-new ${leaderboardTab === 'charisma' ? 'active' : ''}`, onClick: () => setLeaderboardTab('charisma') }, "\u2B50 ", t.charismaRank), /*#__PURE__*/
      React.createElement("button", { className: `lb-tab-new ${leaderboardTab === 'family' ? 'active' : ''}`, onClick: () => setLeaderboardTab('family') }, "\uD83C\uDFE0 ", lang === 'ar' ? 'عائلة' : 'Family')
      ),


      leaderboardTab === 'family' && (() => {
        var data = famData;
        var top3 = data.slice(0, 3);
        var rest = data.slice(3);
        return (/*#__PURE__*/
          React.createElement(React.Fragment, null,
          top3.length > 0 && /*#__PURE__*/
          React.createElement("div", { className: "podium-new" },
          [
          top3[1] ? { p: top3[1], cls: 'ps-2', medal: '🥈' } : null,
          top3[0] ? { p: top3[0], cls: 'ps-1', medal: '👑', crown: true } : null,
          top3[2] ? { p: top3[2], cls: 'ps-3', medal: '🥉' } : null].
          filter(Boolean).map((slot, i) => /*#__PURE__*/
          React.createElement("div", { key: i, className: `podium-slot-new ${slot.cls}`,
            onClick: () => {if (setViewFamilyId) setViewFamilyId(slot.p.id);if (setShowFamilyModal) setShowFamilyModal(true);},
            style: { cursor: 'pointer' } },
          slot.crown && /*#__PURE__*/React.createElement("div", { style: { fontSize: '18px', marginBottom: '2px' } }, "\uD83D\uDC51"), /*#__PURE__*/
          React.createElement("div", { className: "p-avatar-new" },
          slot.p.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: slot.p.photoURL, alt: "" }) : /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '22px' } }, slot.p.emblem || '🏠')
          ), /*#__PURE__*/
          React.createElement("div", { className: "p-name-new" }, slot.p.name || slot.p.tag), /*#__PURE__*/
          React.createElement("div", { className: "p-score-new" }, (slot.p.activeness || 0).toLocaleString()), /*#__PURE__*/
          React.createElement("div", { className: "p-stand-new" }, slot.medal)
          )
          )
          ), /*#__PURE__*/

          React.createElement("div", { className: "lb-list-new" },
          rest.map((fam, i) => /*#__PURE__*/
          React.createElement("div", { key: fam.id, className: "lb-row-new",
            onClick: () => {if (setViewFamilyId) setViewFamilyId(fam.id);if (setShowFamilyModal) setShowFamilyModal(true);},
            style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--new-border)', cursor: 'pointer' },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, /*#__PURE__*/
          React.createElement("div", { className: "lb-num-new" }, "#", i + 4), /*#__PURE__*/
          React.createElement("div", { className: "lb-av-new" },
          fam.photoURL ? /*#__PURE__*/React.createElement("img", { src: fam.photoURL, alt: "" }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '18px' } }, fam.emblem || '🏠')
          ), /*#__PURE__*/
          React.createElement("div", { className: "lb-info-new", style: { flex: 1 } }, /*#__PURE__*/
          React.createElement("div", { className: "lb-name-new" }, fam.name), /*#__PURE__*/
          React.createElement("div", { className: "lb-sub-new" }, fam.tag, " \xB7 ", fam.memberCount || 0, " ", lang === 'ar' ? 'عضو' : 'members')
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#f97316' } }, (fam.activeness || 0).toLocaleString(), " \u26A1"),
          !userFamily && isLoggedIn && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', padding: '2px 7px', borderRadius: '8px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontWeight: 700 } }, lang === 'ar' ? 'انضم' : 'Join')
          )
          )
          ),
          data.length === 0 && /*#__PURE__*/React.createElement("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' } }, "\uD83C\uDFE0 ", lang === 'ar' ? 'لا توجد عائلات بعد' : 'No families yet')
          )
          ));

      })(),


      leaderboardTab !== 'family' && (() => {
        var data = leaderboardTab === 'charisma' ? charismaData : winsData;
        var top3 = data.slice(0, 3);
        var rest = data.slice(3);
        var getVal = (p) => leaderboardTab === 'charisma' ? p.charisma || 0 : p.stats?.wins || 0;
        var fmt = fmtNum;
        var getAvatar = (p) => p.photoURL || p.photo || null;
        var getEmoji = (i) => ['😎', '🦊', '🐺'][i] || '👤';

        var podiumOrder = top3.length >= 3 ?
        [{ cls: 'ps-2', medal: '🥈', p: top3[1] }, { cls: 'ps-1', medal: '👑', crown: true, p: top3[0] }, { cls: 'ps-3', medal: '🥉', p: top3[2] }] :
        top3.map((p, i) => [{ cls: 'ps-1', medal: '👑', crown: true }, { cls: 'ps-2', medal: '🥈' }, { cls: 'ps-3', medal: '🥉' }][i] ?
        { ...[{ cls: 'ps-1', medal: '👑', crown: true }, { cls: 'ps-2', medal: '🥈' }, { cls: 'ps-3', medal: '🥉' }][i], p } :
        null).filter(Boolean);

        return (/*#__PURE__*/
          React.createElement(React.Fragment, null,
          top3.length > 0 && /*#__PURE__*/
          React.createElement("div", { className: "podium-new" },
          podiumOrder.map((slot, i) => slot && /*#__PURE__*/
          React.createElement("div", { key: i, className: `podium-slot-new ${slot.cls}`, onClick: () => openProfile && openProfile(slot.p.id || slot.p.uid) },
          slot.crown && /*#__PURE__*/React.createElement("div", { style: { fontSize: '18px', marginBottom: '2px' } }, "\uD83D\uDC51"), /*#__PURE__*/
          React.createElement("div", { className: "p-avatar-new" },
          getAvatar(slot.p) ? /*#__PURE__*/React.createElement("img", { src: getAvatar(slot.p), alt: "" }) : /*#__PURE__*/React.createElement("span", null, getEmoji(top3.indexOf(slot.p)))
          ), /*#__PURE__*/
          React.createElement("div", { className: "p-name-new" }, slot.p.displayName || slot.p.name), /*#__PURE__*/
          React.createElement("div", { className: "p-score-new" }, fmt(getVal(slot.p))), /*#__PURE__*/
          React.createElement("div", { className: "p-stand-new" }, slot.medal)
          )
          )
          ), /*#__PURE__*/

          React.createElement("div", { className: "lb-list-new" },
          rest.map((player, i) => {
            var rank = i + 4;
            var isMe = (player.id || player.uid) === window.__currentUID;
            return (/*#__PURE__*/
              React.createElement("div", { key: player.id || player.uid, className: `lb-row-new ${isMe ? 'me-row' : ''}`, onClick: () => openProfile && openProfile(player.id || player.uid) }, /*#__PURE__*/
              React.createElement("div", { className: "lb-num-new" }, "#", rank), /*#__PURE__*/
              React.createElement("div", { className: "lb-av-new" },
              getAvatar(player) ? /*#__PURE__*/React.createElement("img", { src: getAvatar(player), alt: "" }) : /*#__PURE__*/React.createElement("span", null, getEmoji(rank - 1))
              ), /*#__PURE__*/
              React.createElement("div", { className: "lb-info-new" }, /*#__PURE__*/
              React.createElement("div", { className: "lb-name-new" }, player.displayName || player.name, isMe && /*#__PURE__*/React.createElement("span", { className: "lb-me-tag" }, lang === 'ar' ? 'أنت' : 'You')), /*#__PURE__*/
              React.createElement("div", { className: "lb-sub-new" }, player.stats?.wins || 0, " ", t.wins, " \xB7 ", Math.round((player.stats?.wins || 0) / Math.max(1, (player.stats?.wins || 0) + (player.stats?.losses || 0)) * 100), "% ", lang === 'ar' ? 'فوز' : 'wr')
              ), /*#__PURE__*/
              React.createElement("div", { className: `lb-val-new ${leaderboardTab === 'charisma' ? 'gold' : ''}` }, fmt(getVal(player)))
              ));

          }),
          data.length === 0 && /*#__PURE__*/React.createElement("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' } }, "\uD83C\uDFC6 ", lang === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet')
          )
          ));

      })()
      ));

  };
})();