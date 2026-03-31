/**
 * ProfileTabs.js
 * Modular component for profile navigation tabs.
 * Part of Phase 4: Batch 3 modularization.
 */

var ProfileTabs = ({ activeTab, setActiveTab, lang }) => {
  var TABS = [
  { id: 'about', label_en: 'About', label_ar: 'حول', icon: '👤' },
  { id: 'games', label_en: 'Games', label_ar: 'الألعاب', icon: '🎮' },
  { id: 'friends', label_en: 'Friends', label_ar: 'الأصدقاء', icon: '👥' },
  { id: 'gifts', label_en: 'Gifts', label_ar: 'الهدايا', icon: '🎁' },
  { id: 'moments', label_en: 'Moments', label_ar: 'المنشورات', icon: '📸' }];


  var S = {
    container: {
      display: 'flex',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(0,0,0,0.2)',
      flexShrink: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      padding: '4px 8px',
      gap: '4px'
    },
    tab: (isActive) => ({
      flex: 1,
      padding: '10px 4px 8px',
      fontSize: '11px',
      fontWeight: isActive ? 800 : 500,
      color: isActive ? '#00f2ff' : '#6b7280',
      background: isActive ? 'rgba(0,242,255,0.05)' : 'transparent',
      border: 'none',
      borderBottom: `2px solid ${isActive ? '#00f2ff' : 'transparent'}`,
      borderRadius: '8px 8px 0 0',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.25s ease',
      minWidth: '65px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px'
    }),
    icon: {
      fontSize: '16px',
      marginBottom: '2px'
    },
    label: {
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { style: S.container, className: "profile-tabs-scroll" },
    TABS.map((tab) => {
      var isActive = activeTab === tab.id;
      return (/*#__PURE__*/
        React.createElement("button", {
          key: tab.id,
          onClick: () => setActiveTab(tab.id),
          style: S.tab(isActive),
          title: lang === 'ar' ? tab.label_ar : tab.label_en }, /*#__PURE__*/

        React.createElement("span", { style: S.icon }, tab.icon), /*#__PURE__*/
        React.createElement("span", { style: S.label }, lang === 'ar' ? tab.label_ar : tab.label_en)
        ));

    })
    ));

};

// Export to window for global access
window.ProfileTabs = ProfileTabs;