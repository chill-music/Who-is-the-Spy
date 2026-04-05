(function () {
  var { useState, useEffect } = React;

  var ReportsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [reports,            setReports]            = useState([]);
    var [loading,            setLoading]            = useState(true);
    var [filter,             setFilter]             = useState('open');
    var [escalating,         setEscalating]         = useState(null);
    var [escalateNote,       setEscalateNote]       = useState('');
    var [selectedEscalateTo, setSelectedEscalateTo] = useState('');
    var [banningUID,         setBanningUID]         = useState(null);
    var [warnTarget,         setWarnTarget]         = useState(null); // { r, uid, name }
    var [warnMsg,            setWarnMsg]            = useState('');
    var [warnSending,        setWarnSending]        = useState(false);

    // Normalize role: support both flat `role` and nested `staffRole.role`
    var myRole = currentUserData?.role || currentUserData?.staffRole?.role || 'user';

    useEffect(function () {
      var unsub;
      var unsubscribed = false;
      var sortReports = function (data) {
        return data.sort(function (a, b) {
          var ta = a.createdAt?.toMillis?.() || (a.createdAt?.seconds * 1000) || 0;
          var tb = b.createdAt?.toMillis?.() || (b.createdAt?.seconds * 1000) || 0;
          return tb - ta;
        });
      };
      try {
        unsub = reportsCollection.limit(200).onSnapshot(
          function (snap) {
            if (!unsubscribed) {
              setReports(sortReports(snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })));
              setLoading(false);
            }
          },
          function (err) {
            console.warn('[Reports] onSnapshot failed, falling back:', err && err.message);
            reportsCollection.limit(200).get().then(function (snap) {
              if (!unsubscribed) {
                setReports(sortReports(snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })));
                setLoading(false);
              }
            }).catch(function () { if (!unsubscribed) setLoading(false); });
          }
        );
      } catch (e) {
        console.error('[Reports] listener error:', e && e.message);
        setLoading(false);
      }
      return function () { unsubscribed = true; if (unsub) unsub(); };
    }, []);

    var resolveReport = function (id, targetUID, targetName) {
      reportsCollection.doc(id).update({ resolved: true, resolvedAt: TS() }).then(function () {
        if (window.logStaffAction) window.logStaffAction(currentUser.uid, currentUserData && currentUserData.displayName, 'RESOLVE_REPORT', targetUID, targetName, 'Report: ' + id).catch(function () {});
        onNotification('✅ ' + (lang === 'ar' ? 'تم التجاهل' : 'Dismissed'));
      }).catch(function (e) { onNotification('❌ Error: ' + e.message); });
    };

    // Role-based escalation: resolves 'admin_team' / 'owner' to an actual UID
    var handleEscalate = async function (report) {
      if (!selectedEscalateTo || !escalateNote.trim()) {
        onNotification('⚠️ ' + (lang === 'ar' ? 'اختر جهة واكتب سبباً' : 'Select a target and write a reason'));
        return;
      }

      var resolvedUID  = null;
      var resolvedName = '';
      var resolvedRole = '';

      if (selectedEscalateTo === 'owner') {
        resolvedUID = window.OWNER_UID || null;
        if (!resolvedUID) {
          try {
            var ownerSnap = await usersCollection.where('role', '==', 'owner').limit(1).get();
            if (!ownerSnap.empty) { resolvedUID = ownerSnap.docs[0].id; resolvedName = ownerSnap.docs[0].data().displayName || 'Owner'; }
          } catch (_) {}
        } else {
          resolvedName = 'Owner';
        }
        resolvedRole = 'owner';
        if (!resolvedUID) { onNotification('❌ ' + (lang === 'ar' ? 'لم يُعثر على المالك' : 'Owner not found')); return; }

      } else if (selectedEscalateTo === 'admin_team') {
        try {
          var adminSnap = await usersCollection.where('role', '==', 'admin').limit(1).get();
          if (!adminSnap.empty) {
            resolvedUID  = adminSnap.docs[0].id;
            resolvedName = adminSnap.docs[0].data().displayName || 'Admin';
            resolvedRole = 'admin';
          } else {
            // Fall back to owner
            resolvedUID = window.OWNER_UID || null;
            if (!resolvedUID) {
              var ownerFallback = await usersCollection.where('role', '==', 'owner').limit(1).get();
              if (!ownerFallback.empty) { resolvedUID = ownerFallback.docs[0].id; resolvedName = ownerFallback.docs[0].data().displayName || 'Owner'; }
            } else {
              resolvedName = 'Owner';
            }
            resolvedRole = 'owner';
            if (!resolvedUID) { onNotification('❌ ' + (lang === 'ar' ? 'لا يوجد مديرون' : 'No admins or owner found')); return; }
            onNotification('ℹ️ ' + (lang === 'ar' ? 'لا يوجد أدمن — سيصل للمالك' : 'No admins — escalated to Owner'));
          }
        } catch (e) { onNotification('❌ Error: ' + e.message); return; }
      } else {
        // Legacy fallback
        resolvedUID = selectedEscalateTo;
        resolvedName = selectedEscalateTo;
        resolvedRole = 'admin';
      }

      reportsCollection.doc(report.id).update({
        escalated: true,
        escalatedTo: resolvedUID,
        escalatedToName: resolvedName,
        escalatedToRole: resolvedRole,
        escalateNote: escalateNote.trim(),
        escalatedAt: TS(),
        escalatedBy: currentUser.uid,
        escalatedByName: (currentUserData && currentUserData.displayName) || 'Mod'
      }).then(function () {
        if (window.sendStaffCommandBotMessage) {
          var msg = '🚨 ' + (lang === 'ar' ? 'تصعيد بلاغ: ' : 'Report Escalation: ') +
            (report.reportedName || 'User') + '\n' +
            (lang === 'ar' ? 'من: ' : 'From: ') + ((currentUserData && currentUserData.displayName) || 'Mod') + '\n' +
            (lang === 'ar' ? 'السبب: ' : 'Reason: ') + escalateNote.trim();
          window.sendStaffCommandBotMessage(resolvedUID, msg, { type: 'report_escalation' }).catch(function () {});
        }
        if (window.logStaffAction) window.logStaffAction(currentUser.uid, currentUserData && currentUserData.displayName, 'ESCALATE_REPORT', report.reportedUID, report.reportedName, 'Report: ' + report.id).catch(function () {});
        onNotification('🚀 ' + (lang === 'ar' ? 'تم التصعيد' : 'Escalated'));
        setEscalating(null); setEscalateNote(''); setSelectedEscalateTo('');
      }).catch(function (e) { onNotification('❌ Error: ' + e.message); });
    };

    // Warn user via Detective bot (moderator action)
    var sendWarn = async function () {
      if (!warnTarget || !warnMsg.trim()) return;
      setWarnSending(true);
      try {
        var staffName = currentUserData?.displayName || 'Staff';
        var finalMsg  = '⚠️ ' + (lang === 'ar' ? 'تحذير رسمي' : 'Official Warning') + '\n' + warnMsg.trim() + '\n— ' + staffName;
        if (window.sendDetectiveBotMessage) {
          await window.sendDetectiveBotMessage(warnTarget.uid, finalMsg, { type: 'official_warning' });
        } else if (window.sendProSpyBotMessage) {
          await window.sendProSpyBotMessage(warnTarget.uid, finalMsg, { type: 'official_warning' });
        }
        // Optionally mark report as warned
        if (warnTarget.reportId) reportsCollection.doc(warnTarget.reportId).update({ warned: true, warnedAt: TS(), warnedBy: currentUser?.uid }).catch(function () {});
        if (window.logStaffAction) window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'WARN_USER', warnTarget.uid, warnTarget.name, warnMsg).catch(function () {});
        onNotification('⚠️ ' + (lang === 'ar' ? 'تم إرسال التحذير' : 'Warning sent'));
        setWarnTarget(null); setWarnMsg('');
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setWarnSending(false);
    };

    var openCount      = reports.filter(function (r) { return !r.resolved && !r.escalated; }).length;
    var escalatedCount = reports.filter(function (r) { return r.escalated && !r.resolved; }).length;
    var resolvedCount  = reports.filter(function (r) { return r.resolved; }).length;

    var filtered = reports.filter(function (r) {
      if (filter === 'all')       return true;
      if (filter === 'open')      return !r.resolved && !r.escalated;
      if (filter === 'escalated') return r.escalated && !r.resolved;
      return r.resolved;
    });

    var filterTabs = [
      { id: 'all',       labelAr: 'الكل',     labelEn: 'ALL',       count: reports.length, color: '#64748b' },
      { id: 'open',      labelAr: 'مفتوحة',    labelEn: 'OPEN',      count: openCount,      color: '#ef4444' },
      { id: 'escalated', labelAr: 'مُصعَّدة',  labelEn: 'ESCALATED', count: escalatedCount, color: '#8b5cf6' },
      { id: 'resolved',  labelAr: 'محلولة',   labelEn: 'RESOLVED',  count: resolvedCount,  color: '#10b981' }
    ];

    var optStyle = { background: '#1e293b', color: '#e5e7eb' };

    var renderActions = function (r) {
      if (r.resolved) return null;

      if (banningUID === r.id) {
        return React.createElement(window.BanPanelInline, {
          reportedUID: r.reportedUID, reportedName: r.reportedName, reportId: r.id,
          currentUser: currentUser, currentUserData: currentUserData, lang: lang,
          onDone: function (msg) { setBanningUID(null); onNotification(msg); },
          onCancel: function () { setBanningUID(null); }
        });
      }

      if (escalating === r.id) {
        return React.createElement('div', { style: { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '12px', borderRadius: '10px' } },
          React.createElement('div', { style: { fontSize: '11px', color: '#8b5cf6', fontWeight: 700, marginBottom: '8px' } },
            lang === 'ar' ? '🚀 تصعيد البلاغ' : '🚀 Escalate Report'),
          React.createElement('select', {
            value: selectedEscalateTo,
            onChange: function (e) { setSelectedEscalateTo(e.target.value); },
            style: { width: '100%', padding: '8px', fontSize: '11px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', outline: 'none', marginBottom: '8px' }
          },
            React.createElement('option', { value: '', style: optStyle }, lang === 'ar' ? '--- اختر الجهة ---' : '--- Select Target ---'),
            /* Role-based targets — not individual UIDs */
            React.createElement('option', { value: 'admin_team', style: optStyle }, lang === 'ar' ? '🛡️ فريق الإدارة (أدمن)' : '🛡️ Admin Team'),
            React.createElement('option', { value: 'owner',      style: optStyle }, lang === 'ar' ? '👑 المالك'              : '👑 Owner')
          ),
          React.createElement('textarea', {
            className: 'input-dark',
            style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', minHeight: '55px', marginBottom: '8px' },
            placeholder: lang === 'ar' ? 'سبب التصعيد...' : 'Reason for escalation...',
            value: escalateNote,
            onChange: function (e) { setEscalateNote(e.target.value); }
          }),
          React.createElement('div', { style: { display: 'flex', gap: '6px' } },
            React.createElement('button', {
              onClick: function () { handleEscalate(r); },
              style: { flex: 1, padding: '7px', background: '#8b5cf6', color: '#fff', borderRadius: '7px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? 'إرسال' : 'Submit'),
            React.createElement('button', {
              onClick: function () { setEscalating(null); setSelectedEscalateTo(''); setEscalateNote(''); },
              style: { padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '7px', border: 'none', fontSize: '11px', cursor: 'pointer' }
            }, '✕')
          )
        );
      }

      return React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        /* Dismiss — all staff can dismiss */
        React.createElement('button', {
          onClick: function () { resolveReport(r.id, r.reportedUID, r.reportedName); },
          style: { flex: 1, minWidth: '70px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
        }, lang === 'ar' ? 'تجاهل' : 'Dismiss'),

        /* Warn (⚠️) — moderator/admin/owner via Detective bot */
        r.reportedUID && !r.warned
          ? React.createElement('button', {
              onClick: function () {
                setWarnTarget({ uid: r.reportedUID, name: r.reportedName || 'User', reportId: r.id });
                setWarnMsg('');
              },
              style: { flex: 1, minWidth: '70px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? '⚠️ تحذير' : '⚠️ Warn')
          : r.warned
            ? React.createElement('span', { style: { fontSize: '10px', color: '#f59e0b', padding: '7px', alignSelf: 'center' } }, '⚠️ Warned')
            : null,

        /* Escalate — all staff can escalate */
        !r.escalated
          ? React.createElement('button', {
              onClick: function () { setEscalating(r.id); setSelectedEscalateTo(''); setEscalateNote(''); },
              style: { flex: 1, minWidth: '70px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? '🚀 تصعيد' : '🚀 Escalate')
          : null,

        /* Ban — ONLY Owner and Admin */
        myRole !== 'moderator'
          ? React.createElement('button', {
              onClick: function () { setBanningUID(r.id); },
              style: { flex: 1, minWidth: '70px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? '🚫 حظر' : '🚫 Ban')
          : null
      );
    };

    return React.createElement('div', null,

      /* ── Warn user modal (in-app, replaces window.prompt) ─── */
      warnTarget && React.createElement('div', {
        style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' },
        onClick: function () { setWarnTarget(null); setWarnMsg(''); }
      },
        React.createElement('div', {
          style: { background: '#1e293b', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '18px', padding: '24px', maxWidth: '340px', width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' },
          onClick: function (e) { e.stopPropagation(); }
        },
          React.createElement('div', { style: { fontSize: '24px', textAlign: 'center', marginBottom: '8px' } }, '⚠️'),
          React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b', textAlign: 'center', marginBottom: '4px' } },
            lang === 'ar' ? 'إرسال تحذير إلى' : 'Send warning to',
            ' ',
            React.createElement('span', { style: { color: '#f1f5f9' } }, warnTarget.name)
          ),
          React.createElement('div', { style: { fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '14px' } },
            lang === 'ar' ? 'سيتم التسليم عبر بوت Detective' : 'Delivered via The Detective bot'
          ),
          React.createElement('textarea', {
            className: 'input-dark',
            style: { width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12px', minHeight: '80px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' },
            placeholder: lang === 'ar' ? 'سبب التحذير...' : 'Reason for warning...',
            value: warnMsg,
            onChange: function (e) { setWarnMsg(e.target.value); },
            autoFocus: true
          }),
          React.createElement('div', { style: { display: 'flex', gap: '8px' } },
            React.createElement('button', {
              onClick: sendWarn,
              disabled: !warnMsg.trim() || warnSending,
              style: {
                flex: 1, padding: '10px', background: warnMsg.trim() && !warnSending ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#374151',
                color: '#000', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: 700,
                cursor: warnMsg.trim() && !warnSending ? 'pointer' : 'not-allowed'
              }
            }, warnSending ? '⏳…' : (lang === 'ar' ? '⚠️ إرسال' : '⚠️ Send Warning')),
            React.createElement('button', {
              onClick: function () { setWarnTarget(null); setWarnMsg(''); },
              style: { padding: '10px 16px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', borderRadius: '10px', border: 'none', fontSize: '12px', cursor: 'pointer' }
            }, lang === 'ar' ? 'إلغاء' : 'Cancel')
          )
        )
      ),

      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } },
        React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#ef4444' } }, lang === 'ar' ? '🚩 البلاغات' : '🚩 Reports List'),
        React.createElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          filterTabs.map(function (f) {
            return React.createElement('button', {
              key: f.id,
              onClick: function () { setFilter(f.id); },
              style: {
                padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', border: 'none', fontWeight: 700,
                background: filter === f.id ? f.color : 'rgba(255,255,255,0.05)',
                color: filter === f.id ? '#fff' : '#9ca3af'
              }
            },
              lang === 'ar' ? f.labelAr : f.labelEn,
              f.count > 0
                ? React.createElement('span', { style: { marginLeft: '4px', background: filter === f.id ? 'rgba(255,255,255,0.3)' : f.color, color: '#fff', borderRadius: '8px', padding: '0 5px', fontSize: '9px', fontWeight: 900 } }, f.count)
                : null
            );
          })
        )
      ),

      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
            filtered.length === 0
              ? React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } }, lang === 'ar' ? 'لا توجد بلاغات' : 'No reports found')
              : null,

            filtered.map(function (r) {
              var cardBg     = r.escalated && !r.resolved ? 'rgba(139,92,246,0.04)' : r.resolved ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.03)';
              var cardBorder = r.escalated && !r.resolved ? 'rgba(139,92,246,0.2)'  : r.resolved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.1)';

              return React.createElement('div', { key: r.id, style: { background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '12px', padding: '12px' } },

                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '4px' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
                    React.createElement('div', { style: { background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 } }, (r.category && r.category.toUpperCase()) || 'REPORT'),
                    r.escalated && !r.resolved ? React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '1px 6px', borderRadius: '4px' } }, 'ESCALATED') : null,
                    r.warned     ? React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(245,158,11,0.2)',  color: '#f59e0b', padding: '1px 6px', borderRadius: '4px' } }, 'WARNED') : null,
                    r.resolved   ? React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(16,185,129,0.15)',  color: '#10b981', padding: '1px 6px', borderRadius: '4px' } }, 'RESOLVED') : null,
                    React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } }, r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : '')
                  ),
                  React.createElement('div', { style: { fontSize: '10px', color: '#4b5563' } }, '#', r.id && r.id.slice(-5))
                ),

                React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                  React.createElement('div', { style: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' } },
                    React.createElement('div', { style: { fontSize: '9px', color: '#6b7280', marginBottom: '3px' } }, lang === 'ar' ? 'المُبلِغ' : 'Reporter'),
                    React.createElement('div', { onClick: function () { if (onOpenProfile) onOpenProfile(r.reporterUID); }, style: { fontSize: '11px', fontWeight: 700, cursor: onOpenProfile ? 'pointer' : 'default', color: '#3b82f6' } }, r.reporterName || 'Anonymous')
                  ),
                  React.createElement('div', { style: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' } },
                    React.createElement('div', { style: { fontSize: '9px', color: '#ef4444', marginBottom: '3px' } }, lang === 'ar' ? 'المُبلَغ عنه' : 'Reported'),
                    React.createElement('div', { onClick: function () { if (onOpenProfile) onOpenProfile(r.reportedUID); }, style: { fontSize: '11px', fontWeight: 700, cursor: onOpenProfile ? 'pointer' : 'default', color: '#ef4444' } }, r.reportedName || 'User')
                  )
                ),

                React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px', color: '#d1d5db', lineHeight: 1.4 } },
                  r.reason || r.description,
                  r.evidenceUrl ? React.createElement('img', { src: r.evidenceUrl, style: { width: '100%', borderRadius: '6px', marginTop: '6px', cursor: 'pointer' }, onClick: function () { window.open(r.evidenceUrl); } }) : null
                ),

                r.escalated && !r.resolved
                  ? React.createElement('div', { style: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px' } },
                      React.createElement('div', { style: { color: '#a78bfa', fontWeight: 700 } },
                        lang === 'ar' ? 'صُعِّد بواسطة: ' : 'Escalated by: ',
                        r.escalatedByName || '?', ' → ', r.escalatedToName || r.escalatedTo),
                      r.escalateNote ? React.createElement('div', { style: { color: '#94a3b8', marginTop: '2px' } }, r.escalateNote) : null
                    )
                  : null,

                renderActions(r)
              );
            })
          )
    );
  };

  window.ReportsSection = ReportsSection;
})();