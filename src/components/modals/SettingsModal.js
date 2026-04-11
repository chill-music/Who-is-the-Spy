(function () {
  var { useState, useEffect, useMemo } = React;

  var SettingsModal = ({ show, onClose, lang, onSetLang, userData, user, onNotification, isGuest: isGuestPropForSettings, onLoginGoogle, onOpenAdminPanel, remoteVersion }) => {
    var t = TRANSLATIONS[lang];
    var [blockedUsers, setBlockedUsers] = useState([]);
    var photoInputRef = React.useRef(null);
    var [blockInput, setBlockInput] = useState('');
    var [loading, setLoading] = useState(false);
    var [soundMutedLocal, setSoundMutedLocal] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
    var [showEmailLocal, setShowEmailLocal] = useState(false);
    var [editingName, setEditingName] = useState(false);
    var [newName, setNewName] = useState('');
    var [editingBirthDate, setEditingBirthDate] = useState(false);
    var [newBirthDate, setNewBirthDate] = useState('');

    var myRole = useMemo(() => getUserRole(userData, user?.uid), [userData, user?.uid]);
    var myRoleCfg = ROLE_CONFIG[myRole];

    useEffect(() => {
      if (show && userData) {
        setBlockedUsers(userData.blockedUsers || []);
      }
    }, [show, userData]);

    if (!show) return null;

    var toggleSound = () => {
      var newMuted = !soundMutedLocal;
      setSoundMutedLocal(newMuted);
      localStorage.setItem('pro_spy_sound_muted', String(newMuted));
      // Update global audio state
      if (typeof window !== 'undefined') {
        window.proSpySoundMuted = newMuted;
      }
      onNotification(newMuted ? lang === 'ar' ? 'تم كتم الصوت' : 'Sound muted' : lang === 'ar' ? 'تم تشغيل الصوت' : 'Sound enabled');
    };

    var handleBlockUser = async () => {
      if (!blockInput.trim() || !user) return;
      setLoading(true);
      try {
        // Find user by ID
        var userQuery = await usersCollection.where('customId', '==', blockInput.trim()).get();
        if (userQuery.empty) {
          onNotification(t.friendNotFound);
          setLoading(false);
          return;
        }
        var targetUid = userQuery.docs[0].id;
        if (targetUid === user.uid) {
          onNotification(lang === 'ar' ? 'لا يمكنك حظر نفسك' : 'Cannot block yourself');
          setLoading(false);
          return;
        }
        if (blockedUsers.includes(targetUid)) {
          onNotification(lang === 'ar' ? 'المستخدم محظور بالفعل' : 'User already blocked');
          setLoading(false);
          return;
        }
        // Add to blocked list
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUid)
        });
        setBlockedUsers([...blockedUsers, targetUid]);
        setBlockInput('');
        onNotification(t.blockSuccess);
      } catch (error) {
        onNotification(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
      }
      setLoading(true); // Wait, original code has setLoading(false) here. Let me check.
      setLoading(false);
    };

    var handleUnblockUser = async (targetUid) => {
      if (!user) return;
      try {
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUid)
        });
        setBlockedUsers(blockedUsers.filter((id) => id !== targetUid));
        onNotification(t.unblockSuccess);
      } catch (error) {
      }
    };

    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose }, /*#__PURE__*/
        React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '360px' } }, /*#__PURE__*/
          React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
            React.createElement("h2", { className: "modal-title" }, "\u2699\uFE0F ", t.settings), /*#__PURE__*/
            React.createElement(ModalCloseBtn, { onClose: onClose })
          ), /*#__PURE__*/
          React.createElement("div", { className: "modal-body" },

            isGuestPropForSettings && /*#__PURE__*/
            React.createElement("div", { className: "settings-section" }, /*#__PURE__*/
              React.createElement("div", { className: "settings-section-title" }, /*#__PURE__*/
                React.createElement("span", null, "\uD83D\uDC64"), /*#__PURE__*/
                React.createElement("span", null, lang === 'ar' ? 'معلومات الحساب' : 'Account Info')
              ), /*#__PURE__*/
              React.createElement("div", { style: { padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05))', border: '1px solid rgba(239, 68, 68, 0.4)', textAlign: 'center' } }, /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '32px', marginBottom: '8px' } }, "\u26A0\uFE0F"), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#fca5a5', marginBottom: '4px' } },
                  lang === 'ar' ? 'تحذير مسح البيانات لزائر' : 'Guest Data Loss Warning'
                ), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '11px', color: '#fecaca', marginBottom: '14px', lineHeight: 1.4 } },
                  lang === 'ar' ? 'أنت تلعب كزائر. مسح بيانات المتصفح سيؤدي إلى حذف حسابك وتقدمك نهائياً. اربط حسابك بجوجل للحفاظ على بياناتك آمنة.' : 'You are playing as a Guest. Clearing your browser data will permanently delete your account and progress. Link your account to Google to keep your data safe.'
                ), /*#__PURE__*/
                React.createElement("button", {
                  onClick: onLoginGoogle, className: "btn-google", style: {
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 800
                  }
                }, /*#__PURE__*/
                  React.createElement("img", { src: "https://www.google.com/favicon.ico", alt: "G", style: { width: '18px', height: '18px' } }),
                  lang === 'ar' ? 'حفظ التقدم (دخول بجوجل)' : 'Link Google & Save Progress'
                )
              )
            ),


            user && !isGuestPropForSettings && /*#__PURE__*/
            React.createElement("div", { className: "settings-section" }, /*#__PURE__*/
              React.createElement("div", { className: "settings-section-title" }, /*#__PURE__*/
                React.createElement("span", null, "\uD83D\uDC64"), /*#__PURE__*/
                React.createElement("span", null, lang === 'ar' ? 'معلومات الحساب' : 'Account Info')
              ), /*#__PURE__*/

              React.createElement("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: '12px', marginTop: '8px' } }, /*#__PURE__*/
                React.createElement("div", { style: { position: 'relative', cursor: 'pointer' }, onClick: () => photoInputRef.current?.click() }, /*#__PURE__*/
                  React.createElement("img", {
                    src: userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'User')}&background=7000ff&color=fff&size=200`,
                    alt: "avatar",
                    style: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(112,0,255,0.5)' }
                  }
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { position: 'absolute', bottom: '0', right: '0', background: 'rgba(112,0,255,0.9)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '2px solid #0f0f1a' } }, "\uD83D\uDCF7")
                ), /*#__PURE__*/
                React.createElement("input", {
                  ref: photoInputRef, id: "settings-photo-input", type: "file", style: { display: 'none' }, accept: "image/*", onChange: async (e) => {
                    var file = e.target.files?.[0];
                    if (!file || !user) return;
                    var reader = new FileReader();
                    reader.onload = async (ev) => {
                      var img = new Image();
                      img.onload = async () => {
                        var canvas = document.createElement('canvas');
                        var MAX = 300;
                        var w = img.width, h = img.height;
                        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } } else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                        canvas.width = w; canvas.height = h;
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        var base64 = canvas.toDataURL('image/jpeg', 0.75);
                        try {
                          await usersCollection.doc(user.uid).update({ photoURL: base64 });
                          onNotification(lang === 'ar' ? 'تم تحديث الصورة!' : 'Photo updated!');
                        } catch (err) { }
                      };
                      img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                })
              ), /*#__PURE__*/
              React.createElement("div", { className: "settings-account-card" }, /*#__PURE__*/
                React.createElement("div", { className: "settings-account-row" }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "\uD83D\uDCE7 ", lang === 'ar' ? 'البريد' : 'Email'), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
                    React.createElement("span", { className: "settings-account-value" }, showEmailLocal ? user?.email || 'N/A' : maskEmail(user?.email)), /*#__PURE__*/
                    React.createElement("button", { onClick: () => setShowEmailLocal(!showEmailLocal), className: "settings-eye-btn" }, showEmailLocal ? '🙈' : '👁️')
                  )
                ), /*#__PURE__*/
                React.createElement("div", { className: "settings-account-row" }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "\uD83E\uDEAA ID"), /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-value", onClick: () => navigator.clipboard.writeText(userData?.customId || ''), style: { cursor: 'pointer' } },
                    userData?.customId || 'N/A', " \uD83D\uDCCB"
                  )
                ), /*#__PURE__*/
                React.createElement("div", { className: "settings-account-row" }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "\uD83D\uDCC5 ", lang === 'ar' ? 'عضو منذ' : 'Member Since'), /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-value" }, userData?.createdAt?.toDate?.() ? userData.createdAt.toDate().toLocaleDateString() : 'N/A')
                ), /*#__PURE__*/
                React.createElement("div", { className: "settings-account-row" }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "\uD83D\uDD11 ", lang === 'ar' ? 'نوع الحساب' : 'Account Type'), /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-value", style: { color: '#10b981' } }, "Google \u2713")
                ), /*#__PURE__*/
                React.createElement("div", { className: "settings-account-row" }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "\u270F\uFE0F ", lang === 'ar' ? 'الاسم' : 'Name'),
                  editingName ? /*#__PURE__*/
                    React.createElement("div", { style: { display: 'flex', gap: '4px' } }, /*#__PURE__*/
                      React.createElement("input", { className: "input-dark", style: { padding: '4px 8px', fontSize: '11px', borderRadius: '6px', width: '120px' }, value: newName, onChange: (e) => setNewName(e.target.value), maxLength: 10, placeholder: userData?.displayName }), /*#__PURE__*/
                      React.createElement("button", {
                        className: "btn-neon", style: { padding: '2px 8px', fontSize: '10px', borderRadius: '6px' }, onClick: async () => {
                          if (newName.trim() && user) {
                            var now = new Date();
                            var history = userData?.nameChangeHistory || [];
                            if (userData?.lastChangedName && history.length === 0) {
                              history.push(userData.lastChangedName);
                            }
                            history = history.filter(ts => (now - (ts.toDate ? ts.toDate() : new Date(ts))) < 30 * 24 * 60 * 60 * 1000);

                            if (history.length >= 5) {
                              onNotification(lang === 'ar' ? 'يمكن التغيير 5 مرات شهرياً كحد أقصى' : 'Max 5 name changes per month');
                              setEditingName(false);
                              return;
                            }
                            // FieldValue.serverTimestamp() (which window.TS() often returns) is NOT supported inside arrays.
                            // We use a regular Date object instead.
                            history.push(new Date());

                            await usersCollection.doc(user.uid).update({ 
                              displayName: newName.trim(), 
                              nameChangeHistory: history 
                            });
                            onNotification(lang === 'ar' ? 'تم تغيير الاسم!' : 'Name changed!');
                            setEditingName(false);
                          }
                        }
                      }, "\u2713"), /*#__PURE__*/
                      React.createElement("button", { className: "btn-ghost", style: { padding: '2px 6px', fontSize: '10px', borderRadius: '6px' }, onClick: () => setEditingName(false) }, "\u2715")
                    ) : /*#__PURE__*/

                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
                      React.createElement("span", { className: "settings-account-value" }, userData?.displayName), /*#__PURE__*/
                      React.createElement("button", { onClick: () => { setNewName(userData?.displayName || ''); setEditingName(true); }, className: "settings-eye-btn" }, "\u270F\uFE0F")
                    )

                ), /*#__PURE__*/

                React.createElement("div", { className: "settings-account-row", style: { marginTop: '4px' } }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" },
                    userData?.gender === 'male' ? '♂️' : userData?.gender === 'female' ? '♀️' : '👤',
                    ' ', lang === 'ar' ? 'الجنس' : 'Gender'
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
                    React.createElement("button", {
                      onClick: async () => {
                        if (!user) return;
                        await usersCollection.doc(user.uid).update({ gender: 'male' });
                        onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                      },
                      style: {
                        padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        background: userData?.gender === 'male' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                        border: userData?.gender === 'male' ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        color: userData?.gender === 'male' ? '#93c5fd' : '#9ca3af'
                      }
                    },
                      "\u2642\uFE0F ", lang === 'ar' ? 'ذكر' : 'Male'), /*#__PURE__*/
                    React.createElement("button", {
                      onClick: async () => {
                        if (!user) return;
                        await usersCollection.doc(user.uid).update({ gender: 'female' });
                        onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                      },
                      style: {
                        padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        background: userData?.gender === 'female' ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)',
                        border: userData?.gender === 'female' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                        color: userData?.gender === 'female' ? '#f9a8d4' : '#9ca3af'
                      }
                    },
                      "\u2640\uFE0F ", lang === 'ar' ? 'أنثى' : 'Female')
                  )
                ), /*#__PURE__*/

                React.createElement("div", { className: "settings-account-row", style: { marginTop: '8px' } }, /*#__PURE__*/
                  React.createElement("span", { className: "settings-account-label" }, "🎂 ", lang === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'), /*#__PURE__*/

                  editingBirthDate ? /*#__PURE__*/
                    React.createElement("div", { style: { display: 'flex', gap: '4px' } }, /*#__PURE__*/
                      React.createElement("input", { type: "date", className: "input-dark", style: { padding: '4px 8px', fontSize: '11px', borderRadius: '6px', width: '120px' }, value: newBirthDate, onChange: (e) => setNewBirthDate(e.target.value), max: new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0], min: "1920-01-01" }), /*#__PURE__*/
                      React.createElement("button", {
                        className: "btn-neon", style: { padding: '2px 8px', fontSize: '10px', borderRadius: '6px' }, onClick: async () => {
                          if (newBirthDate && user) {
                            var today = new Date();
                            var dob = new Date(newBirthDate);
                            var age = today.getFullYear() - dob.getFullYear();
                            var m = today.getMonth() - dob.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                              age--;
                            }
                            if (age < 16 || age > 100) {
                              onNotification(lang === 'ar' ? 'يرجى إدخال تاريخ ميلاد صحيح (16 - 100 سنة)' : 'Please enter a valid birth date (16 - 100 years)');
                              return;
                            }
                            await usersCollection.doc(user.uid).update({ birthDate: newBirthDate });
                            onNotification(lang === 'ar' ? 'تم الحفظ!' : 'Saved!');
                            setEditingBirthDate(false);
                          }
                        }
                      }, "\u2713"), /*#__PURE__*/
                      React.createElement("button", { className: "btn-ghost", style: { padding: '2px 6px', fontSize: '10px', borderRadius: '6px' }, onClick: () => setEditingBirthDate(false) }, "\u2715")
                    ) : /*#__PURE__*/
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
                      React.createElement("span", { className: "settings-account-value", style: { color: userData?.birthDate ? '' : '#9ca3af' } },
                        userData?.birthDate ? `${userData.birthDate} (${(() => {
                            var today = new Date();
                            var dob = new Date(userData.birthDate);
                            var age = today.getFullYear() - dob.getFullYear();
                            var m = today.getMonth() - dob.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                            return age;
                          })()
                          } ${lang === 'ar' ? 'سنة' : 'years'})` : (lang === 'ar' ? 'غير محدد' : 'Not Set')
                      ), /*#__PURE__*/
                      !userData?.birthDate && /*#__PURE__*/
                      React.createElement("button", { onClick: () => { setNewBirthDate(''); setEditingBirthDate(true); }, className: "settings-eye-btn" }, "\u270F\uFE0F")
                    )

                ), /*#__PURE__*/

                React.createElement("div", { style: { marginTop: '8px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' } }, "\uD83C\uDF0D ",
                    lang === 'ar' ? 'البلد' : 'Country',
                    userData?.country && /*#__PURE__*/React.createElement("span", { style: { marginRight: '4px', marginLeft: '4px', fontWeight: 700, color: '#e2e8f0' } }, userData.country.flag, " ", lang === 'ar' ? userData.country.name_ar : userData.country.name_en)
                  ), /*#__PURE__*/
                  React.createElement(CountryPicker, {
                    selected: userData?.country?.code,
                    onSelect: async (c) => {
                      if (!user) return;
                      await usersCollection.doc(user.uid).update({
                        country: { code: c.code, flag: c.flag, name_ar: c.name_ar, name_en: c.name_en }
                      });
                      onNotification(lang === 'ar' ? 'تم حفظ البلد ✓' : 'Country saved ✓');
                    },
                    lang: lang
                  }
                  )
                ), /*#__PURE__*/


                React.createElement("div", { style: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px' } }, "\uD83C\uDF10 ", lang === 'ar' ? 'اللغة' : 'Language'), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px', gap: '3px', border: '1px solid rgba(255,255,255,0.08)' } },
                    ['ar', 'en'].map((l) => /*#__PURE__*/
                      React.createElement("button", {
                        key: l, onClick: () => onSetLang && onSetLang(l), style: {
                          flex: 1, padding: '6px 0', borderRadius: '8px', fontSize: '11px',
                          fontWeight: lang === l ? 800 : 500, cursor: 'pointer', border: 'none',
                          background: lang === l ? 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))' : 'transparent',
                          color: lang === l ? '#00f2ff' : '#6b7280',
                          transition: 'all 0.2s'
                        }
                      },
                        l === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'
                      )
                    )
                  )
                )
              ),


              user && !isGuestPropForSettings && myRole && /*#__PURE__*/
              React.createElement("div", { style: { marginBottom: '10px' } }, /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => { onClose(); if (onOpenAdminPanel) onOpenAdminPanel(); },
                  style: { width: '100%', padding: '14px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid rgba(255,215,0,0.35)', background: 'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.07))', color: 'white', transition: 'all 0.2s' },
                  onMouseEnter: (e) => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))',
                  onMouseLeave: (e) => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.07))'
                }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '24px' } }, myRoleCfg?.icon || '🛡️'), /*#__PURE__*/
                  React.createElement("div", { style: { flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' } }, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#ffd700' } }, lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '1px' } }, lang === 'ar' ? `دخول كـ ${myRoleCfg?.label_ar}` : `Access as ${myRoleCfg?.label_en}`)
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '10px', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, background: `${myRoleCfg?.color || '#ffd700'}22`, border: `1px solid ${myRoleCfg?.color || '#ffd700'}44`, color: myRoleCfg?.color || '#ffd700' } }, lang === 'ar' ? myRoleCfg?.label_ar : myRoleCfg?.label_en)
                )
              ), /*#__PURE__*/



              React.createElement("div", { style: { marginBottom: '10px', background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '10px', background: soundMutedLocal ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, soundMutedLocal ? '🔇' : '🔊'), /*#__PURE__*/
                  React.createElement("div", null, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, t.sound), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '10px', color: soundMutedLocal ? '#f87171' : '#4ade80', marginTop: '1px' } }, soundMutedLocal ? t.soundOff : t.soundOn)
                  )
                ), /*#__PURE__*/
                React.createElement("div", { onClick: toggleSound, style: { width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', background: soundMutedLocal ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.4)', border: soundMutedLocal ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(16,185,129,0.5)', position: 'relative', transition: 'all 0.25s' } }, /*#__PURE__*/
                  React.createElement("div", { style: { position: 'absolute', top: '3px', left: soundMutedLocal ? '3px' : '23px', width: '18px', height: '18px', borderRadius: '50%', background: soundMutedLocal ? '#ef4444' : '#10b981', boxShadow: soundMutedLocal ? '0 0 6px rgba(239,68,68,0.6)' : '0 0 6px rgba(16,185,129,0.6)', transition: 'all 0.25s' } })
                )
              ), /*#__PURE__*/


              React.createElement("div", { style: { marginBottom: '10px', background: 'linear-gradient(135deg,rgba(0,242,255,0.04),rgba(112,0,255,0.02))', border: '1px solid rgba(0,242,255,0.15)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,242,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDCF1"), /*#__PURE__*/
                  React.createElement("div", null, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '10px', color: '#00f2ff', marginTop: '1px' } }, lang === 'ar' ? 'للوصول السريع والمريح' : 'For fast & easy access')
                  )
                ), /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => { if (window.triggerPWAInstall) window.triggerPWAInstall(); },
                  style: { padding: '6px 14px', borderRadius: '10px', background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }
                },

                  lang === 'ar' ? 'تثبيت' : 'Install'
                )
              ),


              /* --- [CLEAR CACHE BUTTON] --- */
              React.createElement("div", { style: { marginBottom: '10px', background: 'rgba(255,165,0,0.04)', border: '1px solid rgba(255,165,0,0.15)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,165,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83E\uDDF9"), /*#__PURE__*/
                  React.createElement("div", null, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, lang === 'ar' ? 'مسح التخزين المؤقت' : 'Clear Cache'), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '10px', color: '#ffa500', marginTop: '1px' } }, lang === 'ar' ? 'لحل مشاكل التحميل والتحديث' : 'Fix load and update issues')
                  )
                ), /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => { if (window.VersionManager) window.VersionManager.clearCacheAndReload(); },
                  style: { padding: '6px 14px', borderRadius: '10px', background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.3)', color: '#ffa500', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }
                },
                  lang === 'ar' ? 'مسح الآن' : 'Clear Now'
                )
              ),


              user && !isGuestPropForSettings && /*#__PURE__*/
              React.createElement("div", { style: { marginBottom: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px' } }, /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDEAB"), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, t.blockedUsers),
                  blockedUsers.length > 0 && /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', padding: '1px 7px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 700 } }, blockedUsers.length)
                ), /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', gap: '8px', marginBottom: '10px' } }, /*#__PURE__*/
                  React.createElement("input", { type: "text", className: "input-dark", style: { flex: 1, padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }, value: blockInput, onChange: (e) => setBlockInput(e.target.value), placeholder: t.friendIdPlaceholder }), /*#__PURE__*/
                  React.createElement("button", { onClick: handleBlockUser, disabled: loading || !blockInput.trim(), style: { padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', opacity: loading || !blockInput.trim() ? 0.5 : 1 } },
                    t.blockUser
                  )
                ), /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                  blockedUsers.length === 0 ? /*#__PURE__*/
                    React.createElement("div", { style: { textAlign: 'center', padding: '12px', color: '#4b5563', fontSize: '11px' } }, t.noBlockedUsers) :
                    blockedUsers.map((uid) => /*#__PURE__*/React.createElement(BlockedUserItem, { key: uid, uid: uid, onUnblock: () => handleUnblockUser(uid), lang: lang }))

                )
              ), /*#__PURE__*/


              React.createElement("div", { style: { height: '8px' } }),

              /* --- [VERSION FOOTER & UPDATE CHECK] --- */
              React.createElement("div", {
                style: {
                  textAlign: 'center',
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }
              },
                /* Version Number */
                React.createElement("div", {
                  style: {
                    opacity: 0.35,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }
                }, `Who is the Spy? v${remoteVersion || window.PRO_SPY_VERSION || '...'}`),

                /* Dynamic Action Button */
                (() => {
                  const isNewer = window.VersionManager && window.VersionManager.shouldUpdate(window.PRO_SPY_VERSION, remoteVersion);
                  
                  if (isNewer) {
                    return React.createElement("button", {
                      onClick: () => {
                        if (window.VersionManager) {
                          window.VersionManager.markUpdateAttempted(remoteVersion);
                          window.VersionManager.clearCacheAndReload(remoteVersion);
                        }
                      },
                      style: {
                        background: 'rgba(0, 242, 255, 0.1)',
                        border: '1px solid rgba(0, 242, 255, 0.4)',
                        color: '#00f2ff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '9px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s'
                      }
                    }, `🚀 ${t.updateNow}`);
                  }

                  return React.createElement("button", {
                    onClick: () => {
                      onNotification(t.upToDate);
                    },
                    style: {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#9ca3af',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '9px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }
                  }, t.checkUpdate);
                })()
              )
            )
          )
        )));

  };

  window.SettingsModal = SettingsModal;
})();