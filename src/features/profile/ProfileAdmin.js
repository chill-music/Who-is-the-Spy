/**
 * 🛡️ ProfileAdmin.js
 * Comprehensive Admin and Moderation Tools for the Profile System.
 * 
 * This module handles:
 * - AdminBanModal: Interface for banning/unbanning users.
 * - AdminRoleModal: Interface for managing staff roles (Admin, Moderator).
 * - RoleInfoPopup: Informational popup about different staff roles.
 * 
 * Part of the Phase 5 Modularization.
 */

// ════════════════════════════════════════════════════════════
// 👑 ROLE INFO CONFIGURATION
// ════════════════════════════════════════════════════════════
var ROLE_INFO = {
  owner: {
    title_ar: 'مالك الموقع',
    title_en: 'Site Owner',
    subtitle_ar: 'المسؤول الأول والأعلى',
    subtitle_en: 'Highest Authority',
    points_ar: [
    '👑 مالك اللعبة ومطوّرها',
    '⚙️ يتحكم في كل إعدادات الموقع',
    '🛡️ يعيّن الأدمن والمشرفين',
    '🔒 يملك صلاحيات الحظر والإدارة الكاملة',
    '🚀 الشخص الوحيد اللي يقدر يعدّل على الكود'],

    points_en: [
    '👑 Owner and developer of the game',
    '⚙️ Full control over all site settings',
    '🛡️ Appoints Admins and Moderators',
    '🔒 Full ban and management permissions',
    '🚀 The only one who can modify the code'],

    gradient: 'linear-gradient(160deg,#1a1000,#0f0f1e)',
    borderColor: 'rgba(255,215,0,0.45)',
    accentColor: '#ffd700',
    glowColor: 'rgba(255,215,0,0.15)',
    icon: '👑'
  },
  admin: {
    title_ar: 'أدمن',
    title_en: 'Admin',
    subtitle_ar: 'مسؤول الإدارة',
    subtitle_en: 'Administration Manager',
    points_ar: [
    '🛡️ يدير ويحمي بيئة اللعبة',
    '🔒 يحظر المخالفين وينفّذ القوانين',
    '🔰 يعيّن مشرفين جدد',
    '📋 يراجع البلاغات ويتخذ الإجراءات',
    '🤝 يتواصل مع الـ Owner لحل المشكلات الكبيرة'],

    points_en: [
    '🛡️ Manages and protects the game environment',
    '🔒 Bans rule-breakers and enforces policies',
    '🔰 Appoints new Moderators',
    '📋 Reviews reports and takes action',
    '🤝 Coordinates with Owner on major issues'],

    gradient: 'linear-gradient(160deg,#1a0005,#0f0f1e)',
    borderColor: 'rgba(239,68,68,0.4)',
    accentColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.12)',
    icon: '🛡️'
  },
  moderator: {
    title_ar: 'مشرف',
    title_en: 'Moderator',
    subtitle_ar: 'مشرف اللعبة',
    subtitle_en: 'Game Moderator',
    points_ar: [
    '🔰 يشرف على سير اللعب بشكل عادل',
    '👀 يراقب المحادثات والسلوكيات داخل اللعبة',
    '🚨 يتلقى البلاغات ويرفعها للأدمن',
    '🤝 يساعد اللاعبين ويحل النزاعات البسيطة',
    '📌 يلتزم بتطبيق قواعد المجتمع'],

    points_en: [
    '🔰 Ensures fair gameplay',
    '👀 Monitors chats and in-game behavior',
    '🚨 Receives reports and escalates to Admin',
    '🤝 Helps players and resolves minor disputes',
    '📌 Enforces community guidelines'],

    gradient: 'linear-gradient(160deg,#00051a,#0f0f1e)',
    borderColor: 'rgba(59,130,246,0.4)',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.12)',
    icon: '🔰'
  }
};

// ════════════════════════════════════════════════════════════
// 🔒 ADMIN BAN MODAL
// ════════════════════════════════════════════════════════════
/**
 * AdminBanModal
 * Provides the interface for admins to ban or unban users.
 */
var AdminBanModal = ({ targetData, lang, onClose, onBanApplied }) => {
  var [banDuration, setBanDuration] = React.useState('7'); // days or 'permanent'
  var [banReason, setBanReason] = React.useState('');
  var [applying, setApplying] = React.useState(false);
  var [error, setError] = React.useState('');
  var isBanned = isBannedUser(targetData);

  var durationOptions = [
  { value: '1', label_ar: 'يوم واحد', label_en: '1 Day' },
  { value: '3', label_ar: '3 أيام', label_en: '3 Days' },
  { value: '7', label_ar: '7 أيام', label_en: '7 Days' },
  { value: '14', label_ar: '14 يوم', label_en: '14 Days' },
  { value: '30', label_ar: '30 يوم', label_en: '30 Days' },
  { value: 'permanent', label_ar: 'دائم', label_en: 'Permanent' }];

  var reasonOptions = [
  { value: 'cheating', label_ar: 'غش', label_en: 'Cheating' },
  { value: 'abuse', label_ar: 'سلوك مسيء', label_en: 'Abusive Behavior' },
  { value: 'spam', label_ar: 'سبام', label_en: 'Spam' },
  { value: 'other', label_ar: 'سبب آخر', label_en: 'Other' }];


  var handleApplyBan = async () => {
    if (!targetData?.id) return;
    if (!banReason && !isBanned) {setError(lang === 'ar' ? 'اختر سبب الحظر' : 'Select a ban reason');return;}
    setApplying(true);
    try {
      if (isBanned) {
        // Remove ban
        await usersCollection.doc(targetData.id).update({
          'ban.isBanned': false,
          'ban.removedAt': TS(),
          'ban.expiresAt': null
        });
        onBanApplied({ isBanned: false });
        onClose();
      } else {
        // Apply ban
        var expiresAt = banDuration === 'permanent' ? null :
        new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000);
        var banData = {
          isBanned: true,
          reason: banReason,
          bannedAt: TS(),
          expiresAt: expiresAt,
          duration: banDuration
        };
        await usersCollection.doc(targetData.id).update({ ban: banData });
        onBanApplied({ ...banData, expiresAt });
        onClose();
      }
    } catch (e) {
      setError(lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, try again');
    }
    setApplying(false);
  };

  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.TOOLTIP, padding: '16px' },
      onClick: onClose }, /*#__PURE__*/
    React.createElement("div", { style: { background: 'linear-gradient(160deg,#1a0005,#0f0f1e)', border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '18px', padding: '22px 18px', maxWidth: '340px', width: '100%', boxShadow: '0 20px 60px rgba(239,68,68,0.15)' },
      onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '28px' } }, isBanned ? '🔓' : '🔒'), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '14px', fontWeight: 900, color: '#f87171' } },
    isBanned ?
    lang === 'ar' ? 'رفع الحظر' : 'Remove Ban' :
    lang === 'ar' ? 'حظر الحساب' : 'Ban Account'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' } },
    targetData?.displayName || targetData?.id
    )
    )
    ),

    isBanned ? /*#__PURE__*/
    /* Current ban info + remove option */
    React.createElement("div", { style: { marginBottom: '16px' } }, /*#__PURE__*/
    React.createElement("div", { style: { padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '12px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px' } },
    lang === 'ar' ? '⚠️ هذا الحساب محظور حالياً' : '⚠️ This account is currently banned'
    ),
    targetData?.ban?.reason && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#fca5a5' } },
    lang === 'ar' ? 'السبب: ' : 'Reason: ', targetData.ban.reason
    ), /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } },
    lang === 'ar' ? 'ينتهي: ' : 'Expires: ', /*#__PURE__*/
    React.createElement("span", { style: { color: '#fbbf24', fontWeight: 700 } }, formatBanExpiry(targetData, lang))
    )
    ), /*#__PURE__*/
    React.createElement("p", { style: { fontSize: '11px', color: '#9ca3af', textAlign: 'center' } },
    lang === 'ar' ? 'هل تريد رفع الحظر عن هذا الحساب؟' : 'Do you want to remove the ban from this account?'
    )
    ) : /*#__PURE__*/

    /* Ban options */
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' } }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' } },
    lang === 'ar' ? '⏱ مدة الحظر' : '⏱ Ban Duration'
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
    durationOptions.map((opt) => /*#__PURE__*/
    React.createElement("button", { key: opt.value, onClick: () => setBanDuration(opt.value), style: {
        padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: 'none',
        background: banDuration === opt.value ? opt.value === 'permanent' ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)',
        color: banDuration === opt.value ? opt.value === 'permanent' ? '#ff6b6b' : '#fca5a5' : '#6b7280',
        border: banDuration === opt.value ? `1px solid rgba(239,68,68,0.5)` : '1px solid rgba(255,255,255,0.08)'
      } },
    lang === 'ar' ? opt.label_ar : opt.label_en
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' } },
    lang === 'ar' ? '📋 سبب الحظر' : '📋 Ban Reason'
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '5px' } },
    reasonOptions.map((opt) => /*#__PURE__*/
    React.createElement("button", { key: opt.value, onClick: () => setBanReason(lang === 'ar' ? opt.label_ar : opt.label_en), style: {
        padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', textAlign: lang === 'ar' ? 'right' : 'left',
        background: banReason === (lang === 'ar' ? opt.label_ar : opt.label_en) ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)',
        color: banReason === (lang === 'ar' ? opt.label_ar : opt.label_en) ? '#fca5a5' : '#9ca3af',
        border: banReason === (lang === 'ar' ? opt.label_ar : opt.label_en) ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)'
      } },
    lang === 'ar' ? opt.label_ar : opt.label_en
    )
    )
    )
    )
    ),


    error && /*#__PURE__*/React.createElement("div", { style: { fontSize: '11px', color: '#f87171', textAlign: 'center', marginBottom: '10px' } }, error), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: onClose, style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
    lang === 'ar' ? 'إلغاء' : 'Cancel'
    ), /*#__PURE__*/
    React.createElement("button", { onClick: handleApplyBan, disabled: applying,
      style: { flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: applying ? 'not-allowed' : 'pointer', opacity: applying ? 0.6 : 1,
        background: isBanned ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.25)',
        border: isBanned ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(239,68,68,0.45)',
        color: isBanned ? '#4ade80' : '#f87171'
      } },
    applying ? '...' : isBanned ? lang === 'ar' ? '✅ رفع الحظر' : '✅ Remove Ban' : lang === 'ar' ? '🔒 تطبيق الحظر' : '🔒 Apply Ban'
    )
    )
    )
    )
    ));

};

// ════════════════════════════════════════════════════════════
// 👑 ROLE INFO POPUP
// ════════════════════════════════════════════════════════════
/**
 * RoleInfoPopup
 * Informational popup that shows duties and permissions for a specific role.
 */
var RoleInfoPopup = ({ targetData, lang, onClose }) => {
  var tUID = targetData?.id || targetData?.uid;
  var role = getUserRole(targetData, tUID);
  if (!role) return null;

  var info = ROLE_INFO[role];
  var cfg = ROLE_CONFIG[role];

  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", {
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.TOOLTIP, padding: '16px' },
      onClick: onClose }, /*#__PURE__*/

    React.createElement("div", {
      style: { background: info.gradient, border: `1.5px solid ${info.borderColor}`, borderRadius: '20px', padding: '0', maxWidth: '320px', width: '100%', overflow: 'hidden', boxShadow: `0 24px 60px ${info.glowColor}, 0 0 0 1px ${info.borderColor}` },
      onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


    React.createElement("div", { style: {
        padding: '20px 20px 16px',
        background: `linear-gradient(135deg, ${info.glowColor}, transparent)`,
        borderBottom: `1px solid ${info.borderColor}`,
        textAlign: 'center',
        position: 'relative'
      } }, /*#__PURE__*/

    React.createElement("div", { style: {
        width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 10px',
        background: `radial-gradient(circle, ${info.glowColor.replace('0.12', '0.3')} 0%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', lineHeight: 1,
        boxShadow: `0 0 24px ${cfg.glow}`
      } },
    info.icon
    ), /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '18px', fontWeight: 900, color: info.accentColor, letterSpacing: '0.3px', marginBottom: '3px' } },
    lang === 'ar' ? info.title_ar : info.title_en
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', fontWeight: 600 } },
    lang === 'ar' ? info.subtitle_ar : info.subtitle_en
    ), /*#__PURE__*/


    React.createElement("div", { style: { marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '12px', color: '#d1d5db', fontWeight: 700 } }, targetData?.displayName || '—')
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { padding: '16px 20px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', fontWeight: 800, color: '#6b7280', letterSpacing: '0.5px', marginBottom: '10px', textTransform: 'uppercase' } },
    lang === 'ar' ? 'المهام والصلاحيات' : 'Duties & Permissions'
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '7px' } },
    (lang === 'ar' ? info.points_ar : info.points_en).map((point, i) => /*#__PURE__*/
    React.createElement("div", { key: i, style: {
        fontSize: '12px', color: '#e5e7eb', lineHeight: 1.5,
        padding: '7px 10px', borderRadius: '9px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${info.borderColor.replace('0.4', '0.15')}`
      } },
    point
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { padding: '0 20px 16px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: onClose, style: {
        width: '100%', padding: '10px', borderRadius: '12px',
        background: `linear-gradient(135deg, ${info.glowColor.replace('0.12', '0.2')}, rgba(255,255,255,0.04))`,
        border: `1px solid ${info.borderColor}`,
        color: info.accentColor, fontSize: '13px', fontWeight: 800, cursor: 'pointer'
      } },
    lang === 'ar' ? 'إإغلاق' : 'Close'
    )
    )
    )
    )
    ));

};

// ════════════════════════════════════════════════════════════
// 👑 ADMIN ROLE MODAL
// ════════════════════════════════════════════════════════════
/**
 * AdminRoleModal
 * Interface for owners and admins to assign or remove staff roles.
 */
var AdminRoleModal = ({ targetData, viewerData, viewerUID, lang, onClose, onRoleApplied }) => {
  var [selectedRole, setSelectedRole] = React.useState('');
  var [applying, setApplying] = React.useState(false);
  var [error, setError] = React.useState('');

  var targetUID = targetData?.id || targetData?.uid;
  var targetRole = getUserRole(targetData, targetUID);
  var assignableRoles = getAssignableRoles(viewerData, viewerUID);
  var viewerRole = getUserRole(viewerData, viewerUID);

  // Owner cannot be modified
  var isTargetOwner = targetRole === 'owner';
  // Admin cannot modify another admin
  var cannotModify = isTargetOwner || viewerRole === 'admin' && targetRole === 'admin';

  var roleOptions = [
  { value: 'admin', icon: '🛡️', label_ar: 'أدمن', label_en: 'Admin', color: '#ef4444' },
  { value: 'moderator', icon: '🔰', label_ar: 'مشرف', label_en: 'Moderator', color: '#3b82f6' }].
  filter((r) => assignableRoles.includes(r.value));

  var handleApply = async () => {
    if (!targetUID) return;
    setApplying(true);
    setError('');
    try {
      if (!selectedRole || selectedRole === 'none') {
        // Remove role
        await usersCollection.doc(targetUID).update({ 
          staffRole: null,
          role: 'user'
        });
        onRoleApplied(null);
      } else {
        var roleData = {
          role: selectedRole,
          assignedBy: viewerUID,
          assignedByName: viewerData?.displayName || 'Admin',
          assignedAt: TS()
        };
        await usersCollection.doc(targetUID).update({ 
          staffRole: roleData,
          role: selectedRole
        });
        onRoleApplied(roleData);
      }
      onClose();
    } catch (e) {
      setError(lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, try again');
    }
    setApplying(false);
  };

  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.TOOLTIP, padding: '16px' },
      onClick: onClose }, /*#__PURE__*/
    React.createElement("div", { style: { background: 'linear-gradient(160deg,#0a0510,#0f0f1e)', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: '18px', padding: '22px 18px', maxWidth: '340px', width: '100%', boxShadow: '0 20px 60px rgba(255,215,0,0.1)' },
      onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '28px' } }, "\uD83D\uDC51"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '14px', fontWeight: 900, color: '#fbbf24' } },
    lang === 'ar' ? 'إدارة الرتبة' : 'Manage Role'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' } },
    targetData?.displayName || targetUID
    )
    )
    ),


    targetRole && /*#__PURE__*/
    React.createElement("div", { style: { padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? 'الرتبة الحالية:' : 'Current Role:'), /*#__PURE__*/
    React.createElement(StaffRoleBadge, { userData: targetData, uid: targetUID, lang: lang, size: "md" })
    ),


    cannotModify ? /*#__PURE__*/
    /* Cannot modify notice */
    React.createElement("div", { style: { padding: '14px', borderRadius: '10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', textAlign: 'center', marginBottom: '14px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '24px', marginBottom: '6px' } }, "\u26A0\uFE0F"), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '12px', color: '#fbbf24', fontWeight: 700 } },
    lang === 'ar' ? 'لا يمكن تعديل رتبة هذا المستخدم' : "Cannot modify this user's role"
    )
    ) : /*#__PURE__*/

    React.createElement(React.Fragment, null, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '14px' } }, /*#__PURE__*/

    React.createElement("button", { onClick: () => setSelectedRole('none'), style: {
        padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px', textAlign: lang === 'ar' ? 'right' : 'left',
        background: selectedRole === 'none' ? 'rgba(107,114,128,0.2)' : 'rgba(255,255,255,0.04)',
        border: selectedRole === 'none' ? '1.5px solid rgba(156,163,175,0.5)' : '1px solid rgba(255,255,255,0.08)',
        color: selectedRole === 'none' ? '#d1d5db' : '#9ca3af'
      } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '16px' } }, "\uD83D\uDEAB"), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'بدون رتبة (إزالة)' : 'No Role (Remove)')
    ),


    roleOptions.map((opt) => /*#__PURE__*/
    React.createElement("button", { key: opt.value, onClick: () => setSelectedRole(opt.value), style: {
        padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px', textAlign: lang === 'ar' ? 'right' : 'left',
        background: selectedRole === opt.value ? `rgba(${opt.value === 'admin' ? '239,68,68' : '59,130,246'},0.18)` : 'rgba(255,255,255,0.04)',
        border: selectedRole === opt.value ? `1.5px solid ${opt.color}88` : '1px solid rgba(255,255,255,0.08)',
        color: selectedRole === opt.value ? opt.color : '#9ca3af'
      } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px' } }, opt.icon), /*#__PURE__*/
    React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontWeight: 900 } }, lang === 'ar' ? opt.label_ar : opt.label_en), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', marginTop: '1px', fontWeight: 500 } },
    opt.value === 'admin' ?
    lang === 'ar' ? 'يقدر يحظر ويعيّن مشرفين' : 'Can ban users & assign moderators' :
    lang === 'ar' ? 'صلاحيات الإشراف الأساسية' : 'Basic moderation permissions'
    )
    ),
    selectedRole === opt.value && /*#__PURE__*/React.createElement("span", { style: { color: opt.color, fontSize: '16px' } }, "\u2713")
    )
    )
    ),

    error && /*#__PURE__*/React.createElement("div", { style: { fontSize: '11px', color: '#f87171', textAlign: 'center', marginBottom: '10px' } }, error), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: onClose, style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
    lang === 'ar' ? 'إلغاء' : 'Cancel'
    ), /*#__PURE__*/
    React.createElement("button", { onClick: handleApply, disabled: !selectedRole || applying, style: {
        flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
        cursor: !selectedRole || applying ? 'not-allowed' : 'pointer',
        opacity: !selectedRole || applying ? 0.5 : 1,
        background: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.15))',
        border: '1px solid rgba(255,215,0,0.4)',
        color: '#fbbf24'
      } },
    applying ? '...' : lang === 'ar' ? '✓ تطبيق' : '✓ Apply'
    )
    )
    ),


    cannotModify && /*#__PURE__*/
    React.createElement("button", { onClick: onClose, style: { width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
    lang === 'ar' ? 'إغلاق' : 'Close'
    )

    )
    )
    ));

};

// Exporting to window for global access
window.ROLE_INFO = ROLE_INFO;
window.AdminBanModal = AdminBanModal;
window.RoleInfoPopup = RoleInfoPopup;
window.AdminRoleModal = AdminRoleModal;