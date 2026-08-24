(function () {
  var { useState } = React;

  // ── Helpers ──────────────────────────────────────────────────────────────
  var fmtDate = (val) => {
    if (!val) return '—';
    try {
      var d = val.toDate ? val.toDate() : (val.seconds ? new Date(val.seconds * 1000) : new Date(val));
      return d.toLocaleDateString();
    } catch (_) { return '—'; }
  };

  var ROLE_COLORS = { owner: '#ffd700', admin: '#f97316', moderator: '#8b5cf6', user: '#6b7280' };

  // ─────────────────────────────────────────────────────────────────────────
  var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [searchTerm,   setSearchTerm]   = useState('');
    var [searchResult, setSearchResult] = useState(null);
    var [notFound,     setNotFound]     = useState(false);
    var [searching,    setSearching]    = useState(false);
    var [processing,   setProcessing]   = useState(false);

    // Ban form state
    var [showBanForm,  setShowBanForm]  = useState(false);
    var [banReason,    setBanReason]    = useState('');
    var [banDuration,  setBanDuration]  = useState('permanent');

    // Currency adjustment state (Owner-only)
    var [showCoinForm, setShowCoinForm] = useState(false);
    var [coinMode,     setCoinMode]     = useState('add');
    var [coinAmount,   setCoinAmount]   = useState('');
    var [coinReason,   setCoinReason]   = useState('');

    // VIP grant state (Admin+Owner)
    var [showVipForm,  setShowVipForm]  = useState(false);
    var [vipLevel,     setVipLevel]     = useState('1');
    var [vipDuration,  setVipDuration]  = useState('7');
    var [vipUnit,      setVipUnit]      = useState('d');

    // Moderator appeal escalation state
    var [appealNote,   setAppealNote]   = useState('');

    // Role resolution via the canonical staff system (staffRole.role / OWNER_UID)
    var myRole = (window.getUserRole ? window.getUserRole(currentUserData, currentUser.uid) : null) || '';
    var isOwner = myRole === 'owner';
    var isAdminPlus = isOwner || myRole === 'admin';
    var isStaff = isAdminPlus || myRole === 'moderator';

    // ── Search ──────────────────────────────────────────────────────────
    var handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      setSearching(true); setSearchResult(null); setNotFound(false); setShowBanForm(false);
      var found = await window.searchUser(searchTerm);
      if (found) setSearchResult(found);
      else setNotFound(true);
      setSearching(false);
    };

    // ── Unban ───────────────────────────────────────────────────────────
    var handleUnban = async () => {
      if (!searchResult || processing) return;
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          'ban.isBanned': false,
          'ban.unbannedBy': currentUser.uid,
          'ban.unbannedAt': TS()
        });
        // R-9 v2: pardon the TamperGuard offense trail so the suspension gate
        // releases immediately (history stays permanent, just neutralized)
        if (window.TamperGuard && window.TamperGuard.pardon) {
          await window.TamperGuard.pardon(searchResult.id, currentUser.uid);
        }
        if (window.logStaffAction) {
          await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', searchResult.id, searchResult.displayName, 'Unbanned via Admin Panel');
        }
        setSearchResult({ ...searchResult, ban: { ...searchResult.ban, isBanned: false } });
        onNotification('✅ ' + (lang === 'ar' ? 'تم رفع الحظر' : 'User unbanned'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Verify ─────────────────────────────────────────────────────────
    var handleVerify = async () => {
      if (!searchResult || processing) return;
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          verified: true,
          verifiedBy: currentUser.uid,
          verifiedAt: TS()
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'VERIFY_USER', searchResult.id, searchResult.displayName,
            'Account verified via Admin Panel'
          );
        }
        setSearchResult({ ...searchResult, verified: true });
        onNotification('✅ ' + (lang === 'ar' ? 'تم توثيق الحساب' : 'Account verified'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Ban ─────────────────────────────────────────────────────────────
    var handleBan = async () => {
      if (!searchResult || processing || !banReason.trim()) return;
      // Safety: never ban the owner
      if (searchResult.id === window.OWNER_UID || searchResult.uid === window.OWNER_UID) {
        onNotification('⛔ ' + (lang === 'ar' ? 'لا يمكن حظر المالك' : 'Cannot ban the Owner'));
        return;
      }
      setProcessing(true);
      try {
        var DUR_MS = { '1h': 36e5, '12h': 432e5, '1d': 864e5, '3d': 2592e5, '7d': 6048e5 };
        var durMs = banDuration === 'permanent' ? null : (DUR_MS[banDuration] || null);
        await usersCollection.doc(searchResult.id).update({
          ban: {
            isBanned: true,
            reason: banReason.trim(),
            duration: banDuration,
            // CRITICAL: temporary bans MUST carry expiresAt — isBannedUser()
            // treats a ban without expiresAt as PERMANENT
            expiresAt: durMs ? firebase.firestore.Timestamp.fromMillis(Date.now() + durMs) : null,
            bannedBy: currentUser.uid,
            bannedByName: currentUserData?.displayName || 'Admin',
            bannedAt: TS()
          }
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'BAN_USER', searchResult.id, searchResult.displayName,
            'Reason: ' + banReason + ' | Duration: ' + banDuration
          );
        }
        // R-9 v2: unified permanent ban history
        if (window.TamperGuard && window.TamperGuard.logStaffBan) {
          try {
            window.TamperGuard.logStaffBan({
              targetUid: searchResult.id,
              reasonEn: banReason.trim(),
              reasonAr: banReason.trim(),
              durationMs: durMs,
              issuedBy: currentUser.uid
            });
          } catch (e) {}
        }
        setSearchResult({ ...searchResult, ban: { isBanned: true, reason: banReason, duration: banDuration } });
        setShowBanForm(false); setBanReason(''); setBanDuration('permanent');
        onNotification('🔨 ' + (lang === 'ar' ? 'تم حظر المستخدم' : 'User banned'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Currency adjustment (OWNER-ONLY, fully audited) ─────────────────
    var handleCoinAdjust = async () => {
      var amt = parseInt(coinAmount, 10);
      if (!searchResult || processing || !amt || amt <= 0 || !coinReason.trim()) return;
      setProcessing(true);
      try {
        var ref = usersCollection.doc(searchResult.id);
        var oldBal = 0, newBal = 0, delta = 0;
        await db.runTransaction(async (tx) => {
          var snap = await tx.get(ref);
          oldBal = snap.data()?.currency || 0;
          newBal = coinMode === 'add' ? oldBal + amt : Math.max(0, oldBal - amt);
          delta = newBal - oldBal;
          tx.update(ref, { currency: newBal });
        });
        // AUDIT TRAIL 1: permanent economy ledger (gold_transactions)
        await goldLogCollection.add({
          type: 'admin_adjust',
          targetUid: searchResult.id,
          targetName: searchResult.displayName || '',
          oldBalance: oldBal,
          newBalance: newBal,
          delta: delta,
          reason: coinReason.trim(),
          byUid: currentUser.uid,
          byName: currentUserData?.displayName || 'Owner',
          at: TS()
        });
        // AUDIT TRAIL 2: staff activity log
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'ADJUST_CURRENCY', searchResult.id, searchResult.displayName,
            (delta >= 0 ? '+' : '') + delta + ' (old: ' + oldBal + ' → new: ' + newBal + ') | Reason: ' + coinReason.trim()
          );
        }
        setSearchResult({ ...searchResult, currency: newBal });
        setShowCoinForm(false); setCoinAmount(''); setCoinReason('');
        onNotification('✅ ' + (lang === 'ar' ? 'تم تعديل الرصيد' : 'Balance updated: ' + (delta >= 0 ? '+' : '') + delta));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── VIP grant / revoke (ADMIN + OWNER) ──────────────────────────────
    var handleVipGrant = async () => {
      var dur = parseInt(vipDuration, 10);
      if (!searchResult || processing || !dur || dur <= 0) return;
      setProcessing(true);
      try {
        var ms = vipUnit === 'h' ? dur * 36e5 : dur * 864e5;
        var expiresAt = firebase.firestore.Timestamp.fromMillis(Date.now() + ms);
        await usersCollection.doc(searchResult.id).update({
          vip: {
            level: parseInt(vipLevel, 10),
            expiresAt: expiresAt,
            grantedBy: currentUser.uid,
            grantedByName: currentUserData?.displayName || 'Staff',
            grantedAt: TS()
          }
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'GRANT_VIP', searchResult.id, searchResult.displayName,
            'VIP' + vipLevel + ' for ' + dur + vipUnit
          );
        }
        setSearchResult({ ...searchResult, vip: { level: parseInt(vipLevel, 10), expiresAt: expiresAt } });
        setShowVipForm(false);
        onNotification('👑 ' + (lang === 'ar' ? 'تم منح VIP' : 'VIP granted'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    var handleVipRevoke = async () => {
      if (!searchResult || processing) return;
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          vip: { level: 0, expiresAt: null, revokedBy: currentUser.uid, revokedAt: TS() }
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'REVOKE_VIP', searchResult.id, searchResult.displayName, 'VIP revoked via Admin Panel'
          );
        }
        setSearchResult({ ...searchResult, vip: { level: 0, expiresAt: null } });
        onNotification('✅ ' + (lang === 'ar' ? 'تم سحب VIP' : 'VIP revoked'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Ban appeal escalation (MODERATOR path — no unban rights) ────────
    var handleEscalateAppeal = async () => {
      if (!searchResult || processing || !appealNote.trim()) return;
      setProcessing(true);
      try {
        await ticketsCollection.add({
          type: 'ban_appeal',
          status: 'open',
          escalated: true,
          targetUid: searchResult.id,
          targetName: searchResult.displayName || '',
          banReason: searchResult.ban?.reason || '',
          note: appealNote.trim(),
          createdBy: currentUser.uid,
          createdByName: currentUserData?.displayName || 'Moderator',
          createdAt: TS()
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'ESCALATE_BAN_APPEAL', searchResult.id, searchResult.displayName,
            'Note: ' + appealNote.trim()
          );
        }
        setAppealNote('');
        onNotification('⏫ ' + (lang === 'ar' ? 'تم ترقية طلب الاستئناف للإدارة' : 'Appeal escalated to Admin/Owner'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Stat cell helper ────────────────────────────────────────────────
    var statCell = (label, value, color) => React.createElement('div', {
      style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', textAlign: 'center' }
    },
      React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginBottom: '4px' } }, label),
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: color || '#e2e8f0' } }, value ?? '—')
    );

    // ── Render ───────────────────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement('div', null,

      /* Title */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } },
        '🔍 ', lang === 'ar' ? 'البحث والإدارة' : 'Search & Manage Users'
      ),

      /* Search form */
      React.createElement('form', { onSubmit: handleSearch, className: 'admin-form-stack', style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } },
        React.createElement('input', { className: 'input-dark', style: { flex: 1, minWidth: '140px', padding: '10px', borderRadius: '10px', fontSize: '13px', minHeight: '44px' },
          placeholder: lang === 'ar' ? 'ابحث بـ UID أو ID المخصص أو الاسم...' : 'Search by UID / Custom ID / Name...',
          value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }),
        React.createElement('button', { type: 'submit', disabled: searching, className: 'btn-neon', style: { padding: '0 20px', flexShrink: 0, minHeight: '44px' } },
          searching ? '⏳' : lang === 'ar' ? 'بحث' : 'Search'
        ),
        (searchResult || notFound) &&
        React.createElement('button', { type: 'button', onClick: () => { setSearchResult(null); setNotFound(false); setSearchTerm(''); setShowBanForm(false); },
          style: { padding: '0 14px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', flexShrink: 0, minHeight: '44px' } }, '×')
      ),

      /* Not found */
      notFound &&
      React.createElement('div', { style: { padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', color: '#ef4444', fontSize: '12px', marginBottom: '16px' } },
        '⚠️ ', lang === 'ar' ? 'لم يُعثر على مستخدم بهذا الاسم أو المعرّف.' : 'No user found with that UID, custom ID, or name.'
      ),

      /* Result card */
      searchResult &&
      React.createElement('div', { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' } },

        /* Avatar + Name */
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '16px' } },
          React.createElement('img', { src: searchResult.photoURL || 'https://via.placeholder.com/80', style: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '3px solid #3b82f6', objectFit: 'cover', display: 'block', margin: '0 auto 10px' } }),
          React.createElement('div', { style: { fontSize: '16px', fontWeight: 800, marginBottom: '4px' } }, searchResult.displayName),

          /* Role badge */
          searchResult.role &&
          React.createElement('span', { style: {
            display: 'inline-block', fontSize: '10px', fontWeight: 800,
            background: (ROLE_COLORS[searchResult.role] || '#6b7280') + '22',
            color: ROLE_COLORS[searchResult.role] || '#6b7280',
            border: '1px solid ' + (ROLE_COLORS[searchResult.role] || '#6b7280') + '55',
            padding: '2px 10px', borderRadius: '20px', marginBottom: '6px'
          } }, (searchResult.role || 'user').toUpperCase()),

          /* UID + Custom ID */
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280' } }, 'UID: ', searchResult.uid || searchResult.id),
          searchResult.customId &&
          React.createElement('div', { style: { fontSize: '10px', color: '#f59e0b', marginTop: '2px' } }, 'ID: #', searchResult.customId)
        ),

        /* Stats grid — 4 cells (Scrollable on narrow screens) */
        React.createElement('div', { style: { width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '14px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(80px, 1fr))', gap: '8px', minWidth: '340px' } },
            statCell(lang === 'ar' ? 'الذهب' : 'Gold',   searchResult.currency ?? 0, '#f59e0b'),
            statCell(lang === 'ar' ? 'المستوى' : 'Level', searchResult.level    ?? 1, '#3b82f6'),
            statCell(lang === 'ar' ? 'نقاط XP' : 'XP',   searchResult.xp       ?? 0, '#10b981'),
            statCell(lang === 'ar' ? 'الكاريزما' : 'Charisma', searchResult.charisma ?? 0, '#ec4899')
          )
        ),

        /* Join date */
        React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginBottom: '14px', textAlign: 'center' } },
          (lang === 'ar' ? 'تاريخ الانضمام: ' : 'Joined: '), fmtDate(searchResult.createdAt)
        ),

        /* Ban status */
        searchResult.ban?.isBanned ?
        React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' } },
          React.createElement('div', { style: { fontSize: '11px', color: '#ef4444', fontWeight: 700 } }, '⛔ ', lang === 'ar' ? 'هذا المستخدم محظور!' : 'User is Banned!'),
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '4px' } }, lang === 'ar' ? 'السبب:' : 'Reason:', ' ', searchResult.ban.reason),

          /* Unban — ADMIN + OWNER only (server-side enforced too) */
          isAdminPlus &&
          React.createElement('button', { onClick: handleUnban, disabled: processing, className: 'btn-neon', style: { marginTop: '10px', width: '100%', padding: '8px', minHeight: '44px' } },
            processing ? '⏳' : '✅ ' + (lang === 'ar' ? 'رفع الحظر' : 'Unban User')
          ),

          /* Moderator: cannot unban — escalate the appeal instead */
          myRole === 'moderator' &&
          React.createElement('div', { style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
            React.createElement('div', { style: { fontSize: '10px', color: '#f59e0b', fontWeight: 700 } },
              '⏫ ', lang === 'ar' ? 'لا تملك صلاحية رفع الحظر — يمكنك ترقية الاستئناف للإدارة' : 'No unban permission — escalate this appeal to an Admin/Owner'),
            React.createElement('input', { className: 'input-dark', placeholder: lang === 'ar' ? 'ملاحظة حول استئناف المستخدم...' : 'Note about the user\'s appeal...',
              value: appealNote, onChange: (e) => setAppealNote(e.target.value),
              style: { padding: '9px', borderRadius: '8px', fontSize: '12px', width: '100%', minHeight: '44px' } }),
            React.createElement('button', { onClick: handleEscalateAppeal, disabled: processing || !appealNote.trim(),
              style: { padding: '8px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '12px', fontWeight: 700, cursor: appealNote.trim() ? 'pointer' : 'not-allowed', minHeight: '44px' } },
              '⏫ ' + (lang === 'ar' ? 'ترقية طلب رفع الحظر' : 'Escalate Ban Appeal'))
          )
        ) :
        React.createElement('div', { style: { fontSize: '11px', color: '#10b981', textAlign: 'center', marginBottom: '12px' } }, '🟢 ', lang === 'ar' ? 'حساب نشط ومفعل' : 'Active Account'),

        /* Staff actions — Ban (mod+admin+owner), Verify (owner) */
        isStaff && !searchResult.ban?.isBanned &&
        searchResult.id !== window.OWNER_UID && searchResult.uid !== window.OWNER_UID &&
        React.createElement('div', { style: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' } },

          /* Verify Account button (OWNER-only) */
          isOwner &&
          (searchResult.verified
          ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: '10px' } },
              '✅ ', lang === 'ar' ? 'موثّق بالفعل' : 'Already Verified'
            )
          : React.createElement('button', {
              onClick: handleVerify, disabled: processing,
              style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.07)', color: '#10b981', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '10px', minHeight: '44px' }
            }, processing ? '⏳' : '✅ ' + (lang === 'ar' ? 'توثيق الحساب' : 'Verify Account'))),

          /* Currency adjustment (OWNER-only) */
          isOwner &&
          React.createElement('div', { style: { marginBottom: '10px' } },
            React.createElement('button', {
              onClick: () => setShowCoinForm(!showCoinForm),
              style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)',
                background: showCoinForm ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.07)',
                color: '#f59e0b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }
            }, (showCoinForm ? '✕ ' : '💰 ') + (lang === 'ar' ? 'تعديل الرصيد (مالك فقط)' : 'Adjust Balance (Owner only)')),
            showCoinForm &&
            React.createElement('div', { className: 'admin-form-stack', style: { background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' } },
              React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                React.createElement('select', { value: coinMode, onChange: (e) => setCoinMode(e.target.value),
                  style: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', minHeight: '44px' } },
                  React.createElement('option', { value: 'add', style: { background: '#1e293b' } }, '➕ ' + (lang === 'ar' ? 'إضافة' : 'Add')),
                  React.createElement('option', { value: 'remove', style: { background: '#1e293b' } }, '➖ ' + (lang === 'ar' ? 'خصم' : 'Remove'))
                ),
                React.createElement('input', { className: 'input-dark', type: 'number', min: '1', placeholder: lang === 'ar' ? 'الكمية' : 'Amount',
                  value: coinAmount, onChange: (e) => setCoinAmount(e.target.value),
                  style: { flex: 2, padding: '9px', borderRadius: '8px', fontSize: '12px', minHeight: '44px' } })
              ),
              React.createElement('input', { className: 'input-dark', placeholder: lang === 'ar' ? 'السبب (يُسجَّل في سجل التدقيق)...' : 'Reason (written to audit log)...',
                value: coinReason, onChange: (e) => setCoinReason(e.target.value),
                style: { padding: '9px', borderRadius: '8px', fontSize: '12px', width: '100%', minHeight: '44px' } }),
              React.createElement('button', { onClick: handleCoinAdjust, disabled: processing || !parseInt(coinAmount, 10) || !coinReason.trim(),
                style: { padding: '9px', borderRadius: '8px', background: processing ? '#374151' : '#f59e0b', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: coinReason.trim() && parseInt(coinAmount, 10) ? 'pointer' : 'not-allowed', minHeight: '44px' } },
                processing ? '⏳' : '💰 ' + (lang === 'ar' ? 'تطبيق التعديل' : 'Apply Adjustment'))
            )
          ),

          /* VIP grant / revoke (ADMIN + OWNER) */
          isAdminPlus &&
          React.createElement('div', { style: { marginBottom: '10px' } },
            (searchResult.vip?.level || 0) > 0 ?
            React.createElement('button', { onClick: handleVipRevoke, disabled: processing,
              style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: '12px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' } },
              '👑 ' + (lang === 'ar' ? 'سحب VIP' : 'Revoke VIP') + ' (' + searchResult.vip.level + ')')
            : React.createElement('button', {
              onClick: () => setShowVipForm(!showVipForm),
              style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.3)',
                background: showVipForm ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.07)',
                color: '#a78bfa', fontSize: '12px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }
            }, (showVipForm ? '✕ ' : '👑 ') + (lang === 'ar' ? 'منح VIP' : 'Grant VIP')),
            showVipForm && (searchResult.vip?.level || 0) === 0 &&
            React.createElement('div', { className: 'admin-form-stack', style: { background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' } },
              React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                React.createElement('select', { value: vipLevel, onChange: (e) => setVipLevel(e.target.value),
                  style: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', minHeight: '44px' } },
                  [1,2,3,4,5,6,7,8,9,10].map((n) => React.createElement('option', { key: n, value: String(n), style: { background: '#1e293b' } }, 'VIP ' + n))
                ),
                React.createElement('input', { className: 'input-dark', type: 'number', min: '1', placeholder: lang === 'ar' ? 'المدة' : 'Duration',
                  value: vipDuration, onChange: (e) => setVipDuration(e.target.value),
                  style: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', minHeight: '44px' } }),
                React.createElement('select', { value: vipUnit, onChange: (e) => setVipUnit(e.target.value),
                  style: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', minHeight: '44px' } },
                  React.createElement('option', { value: 'h', style: { background: '#1e293b' } }, lang === 'ar' ? 'ساعة' : 'Hours'),
                  React.createElement('option', { value: 'd', style: { background: '#1e293b' } }, lang === 'ar' ? 'يوم' : 'Days')
                )
              ),
              React.createElement('button', { onClick: handleVipGrant, disabled: processing || !parseInt(vipDuration, 10),
                style: { padding: '9px', borderRadius: '8px', background: processing ? '#374151' : '#8b5cf6', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: parseInt(vipDuration, 10) ? 'pointer' : 'not-allowed', minHeight: '44px' } },
                processing ? '⏳' : '👑 ' + (lang === 'ar' ? 'منح عضوية VIP' : 'Grant VIP'))
            )
          ),

          /* Ban toggle button (all staff) */
          React.createElement('button', {
            onClick: () => setShowBanForm(!showBanForm),
            style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
              background: showBanForm ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.07)',
              color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px', minHeight: '44px' }
          }, showBanForm ? '✕ ' + (lang === 'ar' ? 'إلغاء' : 'Cancel') : '🔨 ' + (lang === 'ar' ? 'حظر المستخدم' : 'Ban User')),

          /* Inline ban form */
          showBanForm &&
          React.createElement('div', { className: 'admin-form-stack', style: { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' } },
            React.createElement('input', { className: 'input-dark', placeholder: lang === 'ar' ? 'سبب الحظر...' : 'Reason for ban...',
              value: banReason, onChange: (e) => setBanReason(e.target.value),
              style: { padding: '9px', borderRadius: '8px', fontSize: '12px', width: '100%', minHeight: '44px' } }),
            React.createElement('select', { value: banDuration, onChange: (e) => setBanDuration(e.target.value),
              style: { padding: '9px', borderRadius: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', minHeight: '44px' } },
              React.createElement('option', { value: 'permanent', style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'دائم' : 'Permanent'),
              React.createElement('option', { value: '7d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? '7 أيام' : '7 Days'),
              React.createElement('option', { value: '3d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? '3 أيام' : '3 Days'),
              React.createElement('option', { value: '1d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'يوم واحد' : '1 Day'),
              React.createElement('option', { value: '12h',        style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? '12 ساعة' : '12 Hours'),
              React.createElement('option', { value: '1h',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'ساعة واحدة' : '1 Hour')
            ),
            React.createElement('button', {
              onClick: handleBan, disabled: processing || !banReason.trim(),
              style: { padding: '9px', borderRadius: '8px', background: processing ? '#374151' : '#dc2626',
                color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: banReason.trim() ? 'pointer' : 'not-allowed', minHeight: '44px' }
            }, processing ? '⏳' : '🔨 ' + (lang === 'ar' ? 'تأكيد الحظر' : 'Confirm Ban'))
          )
        )

      )
    ));
  };

  window.UserManagementSection = UserManagementSection;
})();