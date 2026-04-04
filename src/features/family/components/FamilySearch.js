var { useState, useEffect, useMemo } = React;

var FamilySearch = ({
  view, // 'home', 'create', 'join'
  setView,
  currentUID,
  currentUserData,
  lang,
  onNotification,
  onClose,
  S
}) => {
  var FamilyService = window.FamilyService || {};
  var {
    getFamilyLevelConfig = () => ({}),
    createFamily = () => {},
    loadFamilies = () => [],
    searchFamilyByTag = () => [],
    joinFamily = () => {},
    getFamilySignLevelData = () => null
  } = FamilyService;
  var { FAMILY_CREATE_COST = 1000, FAMILY_EMBLEMS = [] } = window.FamilyConstants || {};
  var FamilySignBadge = window.FamilySignBadge;
  // ---- Home State ----
  var [homeTab, setHomeTab] = useState('new'); // 'new' | 'active'
  var [searchQuery, setSearchQuery] = useState('');
  var [families, setFamilies] = useState([]);
  var [loadingFamilies, setLoadingFamilies] = useState(false);

  // ---- Create State ----
  var [tribeEmblem, setFamilyEmblem] = useState('🛡️');
  var [tribeName, setFamilyName] = useState('');
  var [tribeTag, setFamilyTag] = useState('');
  var [tribeDesc, setFamilyDesc] = useState('');
  var [joinMode, setJoinMode] = useState('open');
  var [creating, setCreating] = useState(false);
  var [previewSignLevel, setPreviewSignLevel] = useState(1);

  useEffect(() => {
    if (view === 'home' || view === 'join') {
      handleLoadFamilies();
    }
  }, [view]);

  var handleLoadFamilies = async () => {
    setLoadingFamilies(true);
    try {
      var data = await loadFamilies();
      setFamilies(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingFamilies(false);
  };

  var handleSearch = async () => {
    if (!searchQuery.trim()) return handleLoadFamilies();
    setLoadingFamilies(true);
    try {
      var data = await searchFamilyByTag(searchQuery);
      setFamilies(data || []);
    } catch (e) {}
    setLoadingFamilies(false);
  };

  // Safe alert helper — uses Swal if available, falls back to onNotification
  var _alert = function (opts, thenFn) {
    var Swal = window.Swal;
    if (Swal && typeof Swal.fire === 'function') {
      var p = Swal.fire(opts);
      if (thenFn) p.then(thenFn);
    } else {
      var icon = opts.icon === 'success' ? '✅ ' : opts.icon === 'error' ? '❌ ' : opts.icon === 'info' ? 'ℹ️ ' : '';
      var msg = [opts.title, opts.text].filter(Boolean).join(' — ');
      if (onNotification) onNotification(icon + msg);
      if (thenFn) thenFn();
    }
  };

  var handleJoin = async (family) => {
    if (!family?.id) return;

    try {
      var res = await joinFamily({
        familyId: family.id,
        currentUID,
        currentUserData,
        lang
      });

      if (res?.status === 'pending') {
        _alert({
          icon: 'info',
          title: lang === 'ar' ? 'تم إرسال الطلب' : 'Request Sent',
          text: lang === 'ar' ? 'القبيلة تطلب موافقة للانضمام. تم إرسال طلبك للقائد.' : 'This family requires approval. Your request has been sent to the leaders.',
          confirmButtonText: lang === 'ar' ? 'حسناً' : 'OK',
          background: '#1a1a2e', color: '#fff', confirmButtonColor: '#fc00ff'
        });
      } else if (res?.status === 'joined') {
        _alert({
          icon: 'success',
          title: lang === 'ar' ? 'تم الانضمام' : 'Joined Successfully',
          text: lang === 'ar' ? 'مرحباً بك في القبيلة!' : 'Welcome to the family!',
          confirmButtonText: lang === 'ar' ? 'دخول' : 'Enter',
          background: '#1a1a2e', color: '#fff', confirmButtonColor: '#00dbde'
        }, () => {if (onClose) onClose();});
      }
    } catch (e) {
      if (!(e.message || "").startsWith('COOLDOWN:')) console.error(e);
      var msg = e.message || "";
      var errorMsg = lang === 'ar' ? 'حدث خطأ أثناء الانضمام' : 'Error joining family';
      if (msg.startsWith('COOLDOWN:')) {
        var hours = msg.split(':')[1];
        errorMsg = lang === 'ar' 
          ? `⏳ يجب الانتظار ${hours} ساعة قبل الانضمام لقبيلة أخرى` 
          : `⏳ You must wait ${hours} hours before joining another family`;
      } else if (e.message === 'Family is full') errorMsg = lang === 'ar' ? 'القبيلة ممتلئة' : 'Family is full';
      else if (e.message === 'Already requested') errorMsg = lang === 'ar' ? 'تم إرسال طلب سابقاً' : 'Request already sent';
      else if (e.message === 'Family not found') errorMsg = lang === 'ar' ? 'هذه القبيلة لم تعد موجودة' : 'This family no longer exists';

      _alert({
        icon: 'error',
        title: lang === 'ar' ? 'عفواً' : 'Oops',
        text: errorMsg,
        confirmButtonText: lang === 'ar' ? 'حسناً' : 'OK',
        background: '#1a1a2e', color: '#fff', confirmButtonColor: '#ef4444'
      });
    }
  };

  var handleCreate = async () => {
    if (!tribeName.trim() || !tribeTag.trim() || creating) return;

    // Check Charisma Level >= 4
    var charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(currentUserData?.charisma || 0).currentLevel.level : 0;
    if (charismaLvl < 4) {
      onNotification(lang === 'ar' ? 'يجب أن يكون مستوى الكاريزما 4 على الأقل لإنشاء قبيلة' : 'Charisma level must be at least 4 to create a family');
      return;
    }

    if ((currentUserData?.currency || 0) < FAMILY_CREATE_COST) {
      onNotification(lang === 'ar' ? 'رصيد إنتل غير كاف' : 'Not enough Intel balance');
      return;
    }

    setCreating(true);
    try {
      await createFamily({
        currentUID,
        currentUserData,
        tribeEmblem: tribeEmblem,
        tribeName: tribeName.trim(),
        tribeTag: tribeTag.trim(),
        tribeDesc: tribeDesc.trim(),
        joinMode,
        lang,
        onNotification
      });
      // Successful creation should trigger user doc update listener in 19-family.js 
      // and naturally close this view.
    } catch (e) {
      setCreating(false);
      var msg = (e.message || "");
      if (!msg.startsWith('COOLDOWN:') && msg !== 'Family exists') console.error(e);
      onNotification(msg);
    }
    setCreating(false);
  };

  // Derived Families List
  var displayFamilies = useMemo(() => {
    var sorted = [...families];
    if (homeTab === 'new') {
      sorted.sort((a, b) => {
        var tA = a.createdAt?.seconds || a.createdAt || 0;
        var tB = b.createdAt?.seconds || b.createdAt || 0;
        return tB - tA; // Newest first
      });
    } else {
      sorted.sort((a, b) => {
        var aAct = a.weeklyActiveness || a.activeness || 0;
        var bAct = b.weeklyActiveness || b.activeness || 0;
        return bAct - aAct; // Most active first
      });
    }
    return sorted;
  }, [families, homeTab]);

  if (view === 'home' || view === 'join') {
    var isSearch = view === 'join';
    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg, #0b0f19 0%, #1a2235 100%)', color: 'white' } }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white', padding: 0 } }, "\u2039"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '18px', fontWeight: 800 } }, lang === 'ar' ? 'القبائل' : 'Family Square')
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setView(isSearch ? 'home' : 'join'), style: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af', padding: 0 } },
      isSearch ? '✕' : '🔍'
      ), /*#__PURE__*/
      (() => {
        var isCooldown = false;
        if (currentUserData?.leftFamilyAt) {
          var leftAt = currentUserData.leftFamilyAt.toDate ? currentUserData.leftFamilyAt.toDate().getTime() : currentUserData.leftFamilyAt;
          if (Date.now() - leftAt < 24 * 60 * 60 * 1000) isCooldown = true;
        }
        
        return React.createElement("button", { 
          onClick: () => {
            if (isCooldown) {
              onNotification(lang === 'ar' ? '⏳ لا يمكنك إنشاء قبيلة أثناء فترة الانتظار' : '⏳ You cannot create a family during cooldown');
              return;
            }
            setView('create');
          }, 
          style: { 
            padding: '6px 16px', borderRadius: '20px', 
            background: isCooldown ? 'rgba(255,255,255,0.05)' : 'rgba(0,219,222,0.1)', 
            border: isCooldown ? '1px solid rgba(255,255,255,0.1)' : '1px solid #00dbde', 
            color: isCooldown ? '#6b7280' : '#00dbde', 
            fontSize: '14px', fontWeight: 600, cursor: 'pointer', 
            boxShadow: isCooldown ? 'none' : '0 2px 8px rgba(0,219,222,0.15)' 
          } 
        },
        lang === 'ar' ? 'إنشاء' : 'Create'
        );
      })()
      )
      ), /*#__PURE__*/
      (() => {
        if (!currentUserData?.leftFamilyAt) return null;
        var leftAt = currentUserData.leftFamilyAt.toDate ? currentUserData.leftFamilyAt.toDate().getTime() : currentUserData.leftFamilyAt;
        var diff = Date.now() - leftAt;
        var cooldown = 24 * 60 * 60 * 1000;
        if (diff >= cooldown) return null;
        var hoursLeft = Math.ceil((cooldown - diff) / (60 * 60 * 1000));
        
        return React.createElement("div", { style: { padding: '12px 16px', background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24' } },
          React.createElement("span", { style: { fontSize: '18px' } }, "⏳"),
          React.createElement("div", { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement("span", { style: { fontSize: '13px', fontWeight: 800 } }, lang === 'ar' ? 'فترة الانتظار نشطة' : 'Cooldown Active'),
            React.createElement("span", { style: { fontSize: '11px', opacity: 0.8 } }, 
              lang === 'ar' ? `متبقي ${hoursLeft} ساعة قبل أن تتمكن من الانضمام لقبيلة` : `${hoursLeft} hours remaining before you can join a family`)
          )
        );
      })(),


      isSearch && /*#__PURE__*/
      React.createElement("div", { style: { padding: '16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', position: 'relative' } }, /*#__PURE__*/
      React.createElement("input", { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSearch(), placeholder: lang === 'ar' ? 'ابحث بالتاج للقبيلة...' : 'Search family tag...', style: { width: '100%', padding: '12px 40px 12px 16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '14px', outline: 'none' } }), /*#__PURE__*/
      React.createElement("button", { onClick: handleSearch, style: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' } }, "\uD83D\uDD0D")
      )
      ),



      !isSearch && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setHomeTab('new'), style: { flex: 1, padding: '16px', fontSize: '15px', fontWeight: homeTab === 'new' ? 800 : 500, color: homeTab === 'new' ? '#00dbde' : '#9ca3af', border: 'none', background: 'none', borderBottom: homeTab === 'new' ? '3px solid #00dbde' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' } },
      lang === 'ar' ? 'قبائل جديدة' : 'New Recommend'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setHomeTab('active'), style: { flex: 1, padding: '16px', fontSize: '15px', fontWeight: homeTab === 'active' ? 800 : 500, color: homeTab === 'active' ? '#fc00ff' : '#9ca3af', border: 'none', background: 'none', borderBottom: homeTab === 'active' ? '3px solid #fc00ff' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' } },
      lang === 'ar' ? 'توصيات نشطة' : 'Active Recommend'
      )
      ), /*#__PURE__*/



      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } },
      loadingFamilies ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '24px' } }, "\u23F3") :
      displayFamilies.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '15px' } }, lang === 'ar' ? 'لا توجد قبائل' : 'No families found') :

      displayFamilies.map((f, i) => {
        var levelData = getFamilyLevelConfig(f.level || 1);
        // Ranks presentation
        var rankIcon = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
        var rankBg = i === 0 ? 'rgba(251,191,36,0.1)' : i === 1 ? 'rgba(156,163,175,0.1)' : i === 2 ? 'rgba(234,88,12,0.1)' : 'transparent';
        var rankColor = i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : i === 2 ? '#ea580c' : '#9ca3af';

        return (/*#__PURE__*/
          React.createElement("div", { key: f.id, style: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '36px', height: '36px', display: 'flex', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: rankColor, background: rankBg, borderRadius: '50%', alignItems: 'center' } },
          rankIcon
          ), /*#__PURE__*/
          React.createElement("div", { style: { width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: `2px solid ${levelData.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', overflow: 'hidden', flexShrink: 0 } },
          f.photoURL ? /*#__PURE__*/React.createElement("img", { src: f.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: "" }) : f.emblem || '🛡️'
          ), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '16px', fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' } }, f.name),
          (() => {
            var signData = window.FamilyConstants?.getFamilySignLevelData?.(f.lastWeekActiveness || 0);
            if (!signData || !FamilySignBadge) return null;
            var signLevel = signData.level || 1;
            return /*#__PURE__*/React.createElement(FamilySignBadge, {
              tag: f.tag,
              color: signData.color,
              small: true,
              signLevel: signLevel,
              imageURL: window.FamilyConstants?.getFamilySignImage?.(0, signLevel) }
            );
          })(), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: levelData.color, opacity: 0.8 } }, "Lv.", f.level || 1)
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
          React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/React.createElement("span", { style: { fontSize: '14px', color: '#3b82f6' } }, "\uD83D\uDEE1\uFE0F"), " ", f.activeness || 0), /*#__PURE__*/
          React.createElement("span", null, "\xB7"), /*#__PURE__*/
          React.createElement("span", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, "\uD83D\uDC65 ", f.members?.length || 0, "/", levelData.maxMembers)
          ),

          i === 0 && /*#__PURE__*/React.createElement("span", { style: { display: 'inline-block', fontSize: '10px', fontWeight: 800, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '10px' } }, "Top1 active")
          ), /*#__PURE__*/
          React.createElement("button", { 
            onClick: (e) => {
              e.stopPropagation();
              handleJoin(f);
            }, 
            style: { 
              padding: '8px 20px', borderRadius: '20px', 
              background: (() => {
                if (currentUserData?.leftFamilyAt) {
                  var leftAt = currentUserData.leftFamilyAt.toDate ? currentUserData.leftFamilyAt.toDate().getTime() : currentUserData.leftFamilyAt;
                  if (Date.now() - leftAt < 24 * 60 * 60 * 1000) return '#374151';
                }
                return 'linear-gradient(135deg, #00dbde, #fc00ff)';
              })(), 
              border: 'none', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' 
            } 
          },
          lang === 'ar' ? 'انضمام' : 'Join'
          )
          ));

      })

      )
      ));

  }

  if (view === 'create') {
    var charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(currentUserData?.charisma || 0).currentLevel.level : 0;
    var canCreate = charismaLvl >= 4;

    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg, #0b0f19 0%, #1a2235 100%)', color: 'white' } }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setView('home'), style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white', padding: 0, marginRight: '16px' } }, "\u2039"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '18px', fontWeight: 800 } }, lang === 'ar' ? 'تأسيس قبيلة' : 'Establish Family')
      ), /*#__PURE__*/

      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' } }, /*#__PURE__*/


      React.createElement("div", { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))', border: '2px solid rgba(0,242,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '16px', boxShadow: '0 8px 16px rgba(0,242,255,0.15)' } },
      tribeEmblem
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '22px', fontWeight: 900, marginBottom: '8px', minHeight: '26px' } }, tribeName || (lang === 'ar' ? 'اسم القبيلة' : 'Family Name')),
      tribeTag ? /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setPreviewSignLevel(Math.max(1, previewSignLevel - 1)), style: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: previewSignLevel > 1 ? 'pointer' : 'not-allowed', opacity: previewSignLevel > 1 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 } }, "\u2039"), /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
      FamilySignBadge && /*#__PURE__*/React.createElement(FamilySignBadge, { tag: tribeTag, color: "#a78bfa", small: false, signLevel: previewSignLevel, imageURL: window.FamilyConstants?.getFamilySignImage?.(0, previewSignLevel) }), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '10px', color: '#9ca3af', fontWeight: 700 } }, "Lv.", previewSignLevel)
      ), /*#__PURE__*/

      React.createElement("button", { onClick: () => setPreviewSignLevel(Math.min(5, previewSignLevel + 1)), style: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: previewSignLevel < 5 ? 'pointer' : 'not-allowed', opacity: previewSignLevel < 5 ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 } }, "\u203A")
      ) : /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '12px', color: '#6b7280' } }, lang === 'ar' ? 'أدخل تاج القبيلة لرؤية الشكل' : 'Enter family tag to preview sign'), /*#__PURE__*/

      React.createElement("div", { style: { marginTop: '16px', fontSize: '12px', color: '#9ca3af', width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.5 } },
      tribeDesc || (lang === 'ar' ? 'الوصف الخاص بالقبيلة سيظهر هنا...' : 'Family description will appear here...')
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'اختر صورة القبيلة' : 'Select Family Emblem'), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
      ['🛡️', '🦅', '🦁', '👑', '⚔️', '🐺', '🐉', '🎯', '⚓', '⚡'].map((e) => /*#__PURE__*/
      React.createElement("button", { key: e, onClick: () => setFamilyEmblem(e), style: { width: '46px', height: '46px', borderRadius: '14px', border: tribeEmblem === e ? '2px solid #00dbde' : '1px solid rgba(255,255,255,0.1)', background: tribeEmblem === e ? 'rgba(0,219,222,0.1)' : 'rgba(255,255,255,0.03)', fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s' } },
      e
      )
      )
      )
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'اسم القبيلة *' : 'Family Name *'), /*#__PURE__*/
      React.createElement("input", { value: tribeName, onChange: (e) => setFamilyName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '')), maxLength: 14, placeholder: lang === 'ar' ? 'اسم مميز (حروف فقط)...' : 'Unique name (letters only)...', style: { width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' } })
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'تاج القبيلة *' : 'Family Tag *'), /*#__PURE__*/
      React.createElement("input", { value: tribeTag, onChange: (e) => setFamilyTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)), maxLength: 5, placeholder: "TAG", style: { width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#00dbde', fontSize: '16px', fontWeight: 900, letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' } }), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', marginTop: '6px' } }, lang === 'ar' ? 'من 3 إلى 5 أحرف أو أرقام إنجليزية' : '3 to 5 English letters or numbers')
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'تعريف القبيلة (اختياري)' : 'About Family (Optional)'), /*#__PURE__*/
      React.createElement("textarea", { value: tribeDesc, onChange: (e) => setFamilyDesc(e.target.value), maxLength: 150, rows: 3, placeholder: "...", style: { width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 } })
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'أسلوب الانضمام' : 'Join Mode'), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '12px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setJoinMode('open'), style: { flex: 1, padding: '14px', borderRadius: '14px', background: joinMode === 'open' ? 'rgba(0,219,222,0.1)' : 'rgba(255,255,255,0.05)', border: joinMode === 'open' ? '1px solid #00dbde' : '1px solid transparent', color: joinMode === 'open' ? '#00dbde' : 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' } },
      lang === 'ar' ? 'مفتوح للجميع' : 'Open to all'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setJoinMode('approval'), style: { flex: 1, padding: '14px', borderRadius: '14px', background: joinMode === 'approval' ? 'rgba(252,0,255,0.1)' : 'rgba(255,255,255,0.05)', border: joinMode === 'approval' ? '1px solid #fc00ff' : '1px solid transparent', color: joinMode === 'approval' ? '#fc00ff' : 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' } },
      lang === 'ar' ? 'بالموافقة' : 'By approval'
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { marginTop: '16px', padding: '20px', borderRadius: '16px', background: 'rgba(251,191,36,0.08)', border: '1px dashed rgba(251,191,36,0.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', color: '#fbbf24', fontWeight: 700 } }, lang === 'ar' ? 'تكلفة تأسيس القبيلة' : 'Establishment Cost'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '32px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } }, "\uD83E\uDDE0 ",
      FAMILY_CREATE_COST
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af' } },
      lang === 'ar' ? `رصيدك الحالي: ${currentUserData?.currency || 0} إنتل` : `Current balance: ${currentUserData?.currency || 0} Intel`
      )
      ),


      !canCreate ? /*#__PURE__*/
      React.createElement("div", { style: { padding: '16px', textAlign: 'center', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px', fontWeight: 700, lineHeight: 1.6 } }, "\uD83D\uDED1 ",
      lang === 'ar' ? 'لا يمكنك إنشاء قبيلة.' : 'You cannot create a family.', /*#__PURE__*/
      React.createElement("br", null),
      lang === 'ar' ? `يجب أن يكون مستوى الكاريزما الخاص بك 4 على الأقل (مستواك الحالي: ${charismaLvl}).` : `Your Charisma Level must be at least 4 (Your level: ${charismaLvl}).`
      ) : /*#__PURE__*/

      React.createElement("button", { onClick: handleCreate, disabled: !tribeName.trim() || !tribeTag.trim() || creating, style: { padding: '20px', borderRadius: '16px', background: tribeName.trim() && tribeTag.trim() && !creating ? 'linear-gradient(135deg, #00dbde, #fc00ff)' : 'rgba(255,255,255,0.1)', border: 'none', color: tribeName.trim() && tribeTag.trim() ? 'white' : '#9ca3af', fontSize: '16px', fontWeight: 900, cursor: tribeName.trim() && tribeTag.trim() && !creating ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px', boxShadow: tribeName.trim() && tribeTag.trim() && !creating ? '0 8px 24px rgba(252,0,255,0.2)' : 'none', transition: 'all 0.3s' } },
      creating ? '⏳...' : `🏠 ${lang === 'ar' ? 'تأسيس الآن' : 'Establish Now'}`
      ), /*#__PURE__*/

      React.createElement("div", { style: { height: '20px' } })
      )
      )
      ));

  }

  return null;
};

window.FamilySearch = FamilySearch;