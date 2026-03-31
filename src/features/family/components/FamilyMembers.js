/**
 * FamilyMembers.js - Component for displaying and managing family members.
 */
var FamilyMembers = ({
  family,
  members,
  currentUID,
  lang,
  onNotification,
  onKick,
  onSetRole
}) => {
  var {
    FAMILY_ROLE_CONFIG = {},
    getFamilyRole = () => 'member',
    getFamilyLevelConfig = () => ({}),
    getFamilySignLevelData = () => ({ level: 0 })
  } = window.FamilyConstants || {};
  var { fmtFamilyNum = (n) => n } = window;
  var { FamilyRoleBadge: sharedRoleBadge } = window.FamilyShared || {};
  var FamilyRoleBadge = window.FamilyRoleBadge || sharedRoleBadge || ((props) => null);
  var FamilySignBadge = window.FamilySignBadge || window.FamilyShared?.FamilySignBadge || ((props) => null);
  var [memberSearch, setMemberSearch] = React.useState('');
  var [donationSort, setDonationSort] = React.useState('intel'); // 'intel' or 'activity'
  var [gearMenuUid, setGearMenuUid] = React.useState(null);

  if (!family || !members) return null;

  var myRole = getFamilyRole(family, currentUID);
  var canManage = myRole === 'owner' || myRole === 'admin';

  // Sorting & Filtering
  var sorted = [...members].sort((a, b) => {
    var aV, bV;
    var donData = family.memberDonations || {};
    if (donationSort === 'intel') {
      var aD = donData[a.id] || {};
      var bD = donData[b.id] || {};
      aV = aD.totalIntel || aD.total || 0;
      bV = bD.totalIntel || bD.total || 0;
    } else {
      var aD = donData[a.id] || {};
      var bD = donData[b.id] || {};
      aV = aD.weekly || 0;
      bV = bD.weekly || 0;
    }
    var aOwner = getFamilyRole(family, a.id) === 'owner' ? 1 : 0;
    var bOwner = getFamilyRole(family, b.id) === 'owner' ? 1 : 0;
    if (aOwner !== bOwner) return bOwner - aOwner;
    return bV - aV;
  }).filter((m) => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

  var handleKick = async (uid) => {
    try {
      if (onKick) await onKick(uid);
      setGearMenuUid(null);
    } catch (e) {
      onNotification(e.message || 'Error kicking member');
    }
  };

  var handleSetRole = async (uid, role) => {
    try {
      if (onSetRole) await onSetRole(uid, role);
      setGearMenuUid(null);
    } catch (e) {
      onNotification(e.message || 'Error setting role');
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 } }, /*#__PURE__*/

    React.createElement("div", { style: { padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 } }, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '5px 10px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '13px' } }, "\uD83D\uDD0D"), /*#__PURE__*/
    React.createElement("input", { value: memberSearch, onChange: (e) => setMemberSearch(e.target.value),
      style: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '11px' },
      placeholder: lang === 'ar' ? 'بحث...' : 'Search...' })
    ), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', color: '#6b7280', fontWeight: 700, flexShrink: 0 } },
    family.members?.length || 0, "/", getFamilyLevelConfig(family.level || 1).maxMembers
    )
    ), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => setDonationSort('intel'), style: { flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'intel' ? 'rgba(0,242,255,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'intel' ? 'rgba(0,242,255,0.1)' : 'transparent', color: donationSort === 'intel' ? '#00f2ff' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'intel' ? 800 : 500, cursor: 'pointer' } }, "\uD83E\uDDE0 ",
    lang === 'ar' ? 'التبرعات' : 'Donations'
    ), /*#__PURE__*/
    React.createElement("button", { onClick: () => setDonationSort('activity'), style: { flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'activity' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'activity' ? 'rgba(251,191,36,0.1)' : 'transparent', color: donationSort === 'activity' ? '#fbbf24' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'activity' ? 800 : 500, cursor: 'pointer' } }, "\u26A1 ",
    lang === 'ar' ? 'الاكتيفيتي' : 'Activity'
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { flex: 1, overflowY: 'auto' }, onClick: () => gearMenuUid && setGearMenuUid(null) },
    sorted.map((m, i) => {
      var role = getFamilyRole(family, m.id);
      var rCfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
      var donData = family.memberDonations || {};
      var don = donData[m.id] || {};

      var weeklyDon = don.weeklyIntel || don.weekly || 0;
      var totalDon = don.totalIntel || don.total || 0;
      var weeklyAct = don.weekly || 0;
      var totalAct = don.total || 0;

      var isTop3 = i < 3;
      var topColors = ['rgba(255,215,0,0.06)', 'rgba(192,192,192,0.04)', 'rgba(205,127,50,0.04)'];
      var isGearOpen = gearMenuUid === m.id;

      var targetRole = getFamilyRole(family, m.id);
      var canKick = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
      var canSetAdmin = myRole === 'owner' && m.id !== currentUID && targetRole !== 'owner';
      var canSetMod = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
      var showGear = canKick || canSetAdmin || canSetMod;

      var signData = getFamilySignLevelData(family.lastWeekActiveness || 0) || { level: 0 };

      return (/*#__PURE__*/
        React.createElement("div", { key: m.id, style: { position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isTop3 ? topColors[i] : 'transparent' } }, /*#__PURE__*/

        React.createElement("div", { style: { width: '20px', textAlign: 'center', fontSize: '11px', color: i === 0 ? '#ffd700' : i === 1 ? '#9ca3af' : i === 2 ? '#fb923c' : '#4b5563', fontWeight: 800, marginRight: '8px', flexShrink: 0 } },
        i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
        ), /*#__PURE__*/

        React.createElement("div", { style: { position: 'relative', flexShrink: 0, marginRight: '10px' } }, /*#__PURE__*/
        React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${rCfg.color}66`, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' } },
        m.photoURL ? /*#__PURE__*/React.createElement("img", { src: m.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDE0E")
        ),
        role === 'owner' && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '-4px', right: '-4px', fontSize: '10px' } }, "\uD83D\uDC51")
        ), /*#__PURE__*/

        React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '12px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' } }, m.displayName),
        signData.level > 0 && FamilySignBadge && /*#__PURE__*/React.createElement(FamilySignBadge, { tag: family.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: family.signImageURL })
        ),
        FamilyRoleBadge && /*#__PURE__*/React.createElement(FamilyRoleBadge, { role: role, lang: lang, small: true })
        ), /*#__PURE__*/

        React.createElement("div", { style: { textAlign: 'right', flexShrink: 0, marginRight: showGear ? '6px' : '0' } },
        donationSort === 'intel' ? /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '8px', color: '#6b7280' } }, "W"), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#00f2ff' } }, fmtFamilyNum(weeklyDon), "\uD83E\uDDE0")
        ), /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '8px', color: '#6b7280' } }, "T"), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#fbbf24' } }, fmtFamilyNum(totalDon), "\uD83E\uDDE0")
        )
        ) : /*#__PURE__*/

        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '8px', color: '#6b7280' } }, "W"), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#fbbf24' } }, "\u26A1", fmtFamilyNum(weeklyAct))
        ), /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '8px', color: '#6b7280' } }, "T"), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#a78bfa' } }, "\u2211", fmtFamilyNum(totalAct))
        )
        )

        ),

        showGear && /*#__PURE__*/
        React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
        React.createElement("button", {
          onClick: (e) => {e.stopPropagation();setGearMenuUid(isGearOpen ? null : m.id);},
          style: { width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 } },
        "\u2699\uFE0F"),

        isGearOpen && /*#__PURE__*/
        React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { position: 'absolute', top: '32px', right: 0, zIndex: 50, background: '#0f1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '6px', minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' } },

        canSetAdmin && targetRole !== 'admin' && /*#__PURE__*/
        React.createElement("button", { onClick: () => handleSetRole(m.id, 'admin'), style: { width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' },
          onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)',
          onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, "\uD83D\uDEE1\uFE0F ",
        lang === 'ar' ? 'ترقية لأدمن' : 'Set Admin'
        ),

        canSetMod && targetRole !== 'moderator' && /*#__PURE__*/
        React.createElement("button", { onClick: () => handleSetRole(m.id, 'moderator'), style: { width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' },
          onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)',
          onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, "\uD83D\uDD30 ",
        lang === 'ar' ? 'ترقية لمشرف' : 'Set Mod'
        ),

        (targetRole === 'admin' || targetRole === 'moderator') && canSetAdmin && /*#__PURE__*/
        React.createElement("button", { onClick: () => handleSetRole(m.id, 'member'), style: { width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' },
          onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(107,114,128,0.1)',
          onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, "\uD83D\uDC64 ",
        lang === 'ar' ? 'تخفيض لعضو' : 'Set Member'
        ),


        canKick && /*#__PURE__*/React.createElement("div", { style: { height: '1px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' } }),
        canKick && /*#__PURE__*/
        React.createElement("button", { onClick: () => handleKick(m.id), style: { width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' },
          onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)',
          onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, "\uD83D\uDEAB ",
        lang === 'ar' ? 'طرد من القبيلة' : 'Kick'
        )

        )

        )

        ));

    }),
    sorted.length === 0 && /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '30px', color: '#4b5563', fontSize: '12px' } }, lang === 'ar' ? 'لا أعضاء' : 'No members found')
    )
    ));

};

window.FamilyMembers = FamilyMembers;