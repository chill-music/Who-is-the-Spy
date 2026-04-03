(function () {
  var { useState, useEffect, useRef, useCallback, useMemo } = React;

  // ════════════════════════════════════════════════════════
  // 📸 FRIENDS MOMENTS MODAL
  // 🏠 FAMILY SYSTEM — Complete Clan/Family System V2
  // File: 19-family.js
  // ════════════════════════════════════════════════════════
  // familiesCollection — defined in 01-config.js

  // ════════════════════════════════════════════════════════
  // ⚙️  FAMILY CONFIG — Levels, Sign Levels, Tasks
  // ════════════════════════════════════════════════════════
  var FAMILY_CREATE_COST = 500;

  // ══ Family levels now based on TOTAL activeness (not XP) ══
  // 'activeness' field used for level-up (cumulative)
  // ── imageURL: ضع رابط الصورة هنا لكل مستوى (تدعم GIF والصور العادية) ──
  // ── اتركها null لو مش عايز صورة لهذا المستوى ──
  var FAMILY_LEVEL_CONFIG = [
  { level: 1, activeness: 0, name_en: 'Rookie', name_ar: 'مبتدئة', color: '#4ade80', maxMembers: 20, icon: '🌱', upgradeCost: 0, imageURL: null },
  { level: 2, activeness: 8000, name_en: 'Rising', name_ar: 'صاعدة', color: '#22d3ee', maxMembers: 25, icon: '⬆️', upgradeCost: 1000, imageURL: null },
  { level: 3, activeness: 24000, name_en: 'Established', name_ar: 'راسخة', color: '#60a5fa', maxMembers: 30, icon: '🏕️', upgradeCost: 2000, imageURL: null },
  { level: 4, activeness: 60000, name_en: 'Warriors', name_ar: 'محاربون', color: '#fbbf24', maxMembers: 40, icon: '⚔️', upgradeCost: 3000, imageURL: null },
  { level: 5, activeness: 120000, name_en: 'Guardians', name_ar: 'حراس', color: '#f97316', maxMembers: 50, icon: '🛡️', upgradeCost: 5000, imageURL: null },
  { level: 6, activeness: 280000, name_en: 'Elite', name_ar: 'نخبة', color: '#a78bfa', maxMembers: 60, icon: '💎', upgradeCost: 8000, imageURL: null },
  { level: 7, activeness: 500000, name_en: 'Champions', name_ar: 'أبطال', color: '#ffd700', maxMembers: 80, icon: '🏆', upgradeCost: 12000, imageURL: null },
  { level: 8, activeness: 800000, name_en: 'Legends', name_ar: 'أساطير', color: '#ef4444', maxMembers: 100, icon: '🔥', upgradeCost: 18000, imageURL: null },
  { level: 9, activeness: 1200000, name_en: 'Dynasty', name_ar: 'سلالة', color: '#818cf8', maxMembers: 120, icon: '👑', upgradeCost: 25000, imageURL: null },
  { level: 10, activeness: 2000000, name_en: 'GOAT', name_ar: 'الأعظم', color: '#00d4ff', maxMembers: 160, icon: '🌌', upgradeCost: 0, imageURL: null }];


  // Use window.FamilyConstants for thresholds and image logic
  var { FAMILY_SIGN_LEVELS, getFamilySignLevelData, getFamilySignImage } = window.FamilyConstants || {
    FAMILY_SIGN_LEVELS: [],
    getFamilySignLevelData: () => null,
    getFamilySignImage: () => null
  };
  var getFamilySignProgress = (weeklyActiveness = 0) => {
    var cur = getFamilySignLevelData(weeklyActiveness);
    if (!cur) {
      var first = FAMILY_SIGN_LEVELS[0];
      return Math.min(99, Math.round(weeklyActiveness / first.threshold * 100));
    }
    var next = FAMILY_SIGN_LEVELS.find((s) => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold) * 100));
  };

  var getFamilyLevel = (activeness = 0) => {
    var cfg = FAMILY_LEVEL_CONFIG[0];
    for (var i = FAMILY_LEVEL_CONFIG.length - 1; i >= 0; i--) {
      if (activeness >= FAMILY_LEVEL_CONFIG[i].activeness) {cfg = FAMILY_LEVEL_CONFIG[i];break;}
    }
    return cfg;
  };
  var getFamilyLevelProgress = (activeness = 0) => {
    var cur = getFamilyLevel(activeness);
    var next = FAMILY_LEVEL_CONFIG.find((c) => c.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round((activeness - cur.activeness) / (next.activeness - cur.activeness) * 100));
  };

  // ════ UPDATED TASKS — Triple Currency: Intel + XP + Family Coins ════
  var FAMILY_TASKS_CONFIG = [
  { id: 'ft1', icon: '🎮', title_en: 'Play 5 Games', title_ar: 'العب 5 ألعاب', sub_en: 'Play 5 spy games this week', sub_ar: 'العب 5 ألعاب جاسوس هذا الأسبوع', target: 5, daily: false, reward: { intel: 50, xp: 200, coins: 5, icon: '🏅' } },
  { id: 'ft2', icon: '🏆', title_en: 'Win 3 Games', title_ar: 'اكسب 3 ألعاب', sub_en: 'Win 3 games to earn rewards', sub_ar: 'اكسب 3 ألعاب للحصول على المكافآت', target: 3, daily: false, reward: { intel: 100, xp: 400, coins: 10, icon: '🏅' } },
  { id: 'ft3', icon: '💰', title_en: 'Donate 500 Intel', title_ar: 'تبرع بـ 500 إنتل', sub_en: 'Donate 500 Intel to family fund', sub_ar: 'تبرع بـ 500 إنتل لصندوق العائلة', target: 500, daily: false, reward: { intel: 80, xp: 300, coins: 8, icon: '🏅' } },
  { id: 'ft4', icon: '📅', title_en: 'Daily Check-in', title_ar: 'تسجيل الحضور', sub_en: 'Check in to the family today', sub_ar: 'سجّل حضورك في العائلة اليوم', target: 1, daily: true, reward: { intel: 30, xp: 100, coins: 3, icon: '🏅' } },
  { id: 'ft5', icon: '🎁', title_en: 'Send 3 Gifts', title_ar: 'أرسل 3 هدايا', sub_en: 'Send 3 gifts to any players', sub_ar: 'أرسل 3 هدايا لأي لاعبين', target: 3, daily: false, reward: { intel: 120, xp: 500, coins: 12, icon: '🏅' } },
  { id: 'ft6', icon: '💬', title_en: 'Chat (10 messages)', title_ar: 'الشات (10 رسائل)', sub_en: 'Send 10 messages in family chat', sub_ar: 'أرسل 10 رسائل في شات العائلة', target: 10, daily: false, reward: { intel: 60, xp: 250, coins: 6, icon: '🏅' } },
  { id: 'ft7', icon: '❤️', title_en: 'Daily Like Mission', title_ar: 'مهمة الإعجاب اليومي', sub_en: 'Like 3 clanmates profiles/posts', sub_ar: 'أعجب بـ 3 منشورات/بروفايلات أعضاء', target: 3, daily: true, reward: { intel: 40, xp: 150, coins: 4, icon: '🏅' } }];




  // ══ GACHA CONFIG ══
  // freeDailyCost: 0 (مجانية مرة يومياً)
  // paidCostPerSpin: 200 Intel من رصيد اللاعب (مش من الخزينة)
  // maxPaidSpinsDaily: 50 سحبة مدفوعة يومياً
  //
  // ── لتغيير صورة أي جائزة: غير imageURL من null لرابط صورة/GIF ──
  // ── لتغيير نسبة الظهور: غير weight (الإجمالي ~10000) ──
  // ── GACHA CONFIG BASIC (Clans Level 1-4) ──
  var GACHA_CONFIG_BASIC = {
    paidCostPerSpin: 600,
    maxPaidSpinsDaily: 50,
    rewards: [
      { id: 'intel_100', type: 'currency', amount: 100, weight: 400 },
      { id: 'intel_250', type: 'currency', amount: 250, weight: 200 },
      { id: 'intel_500', type: 'currency', amount: 500, weight: 100 },
      { id: 'charisma_50', type: 'charisma', amount: 50, weight: 150 },
      { id: 'gift_rose', type: 'gift', weight: 80 },
      { id: 'gift_candy', type: 'gift', weight: 40 },
      { id: 'frame_gold', type: 'frame', weight: 20, duration: 1 },
      { id: 'title_scout', type: 'title', weight: 10, duration: 1 }
    ]
  };

  // ── GACHA CONFIG PREMIUM (Clans Level 5-9) ──
  var GACHA_CONFIG_PREMIUM = {
    paidCostPerSpin: 600,
    maxPaidSpinsDaily: 50,
    rewards: [
      { id: 'intel_300', type: 'currency', amount: 300, weight: 300 },
      { id: 'intel_600', type: 'currency', amount: 600, weight: 150 },
      { id: 'intel_1200', type: 'currency', amount: 1200, weight: 50 },
      { id: 'charisma_200', type: 'charisma', amount: 200, weight: 100 },
      { id: 'gift_heart', type: 'gift', weight: 100 },
      { id: 'gift_crown', type: 'gift', weight: 100 },
      { id: 'badge_pro', type: 'badge', weight: 80, duration: 7 },
      { id: 'frame_shehab', type: 'frame', weight: 50, duration: 3 },
      { id: 'title_legend', type: 'title', weight: 40, duration: 7 },
      { id: 'chest_bronze', type: 'chest', chestType: 'bronze', weight: 30 }
    ]
  };

  // ── GACHA CONFIG MAX (Clans Level 10+) ──
  var GACHA_CONFIG_MAX = {
    paidCostPerSpin: 600,
    maxPaidSpinsDaily: 50,
    rewards: [
      { id: 'intel_1000', type: 'currency', amount: 1000, weight: 200 },
      { id: 'intel_2500', type: 'currency', amount: 2500, weight: 100 },
      { id: 'charisma_500', type: 'charisma', amount: 500, weight: 150 },
      { id: 'gift_universe', type: 'gift', weight: 100 },
      { id: 'ring_diamond', type: 'ring', weight: 50 },
      { id: 'ring_eternal', type: 'ring', weight: 50 },
      { id: 'badge_legend', type: 'badge', weight: 100, duration: 30 },
      { id: 'frame_s1_celestial', type: 'frame', weight: 100, duration: 7 },
      { id: 'title_s1_pioneer', type: 'title', weight: 100, duration: 7 },
      { id: 'effect_gif2', type: 'effect', weight: 50, duration: 3 }
    ]
  };

  window.GACHA_CONFIG_BASIC = GACHA_CONFIG_BASIC;
  window.GACHA_CONFIG_PREMIUM = GACHA_CONFIG_PREMIUM;
  window.GACHA_CONFIG_MAX = GACHA_CONFIG_MAX;
  window.GACHA_CONFIG = GACHA_CONFIG_BASIC; // Fallback


  // ── ألوان نادرية الجاتشه ──
  var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24'
  };

  // ── Role Config ──
  var FAMILY_ROLE_CONFIG = {
    owner: { label_en: 'Owner', label_ar: 'المالك', color: '#ffd700', bg: 'rgba(255,215,0,0.18)', border: 'rgba(255,215,0,0.45)', icon: '👑' },
    admin: { label_en: 'Admin', label_ar: 'أدمن', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.45)', icon: '🛡️' },
    moderator: { label_en: 'Mod', label_ar: 'مشرف', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.45)', icon: '🔰' },
    member: { label_en: 'Member', label_ar: 'عضو', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', icon: '👤' }
  };
  var getFamilyRole = (family, uid) => {
    if (!family || !uid) return 'member';
    if (family.createdBy === uid) return 'owner';
    var roles = family.memberRoles || {};
    return roles[uid] || 'member';
  };
  var canManageFamily = (family, uid) => {
    var role = getFamilyRole(family, uid);
    return role === 'owner' || role === 'admin';
  };

  // ── Emblem Options ──
  var FAMILY_EMBLEMS = ['🏠', '⚔️', '🛡️', '🔥', '🌊', '⚡', '🌙', '🌟', '💎', '👑', '🐉', '🦁', '🐺', '🦅', '🦋', '🌹', '🏹', '🎯', '🌈', '💫'];

  // ── Helpers ──
  var fmtFamilyNum = (n = 0) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };
  var fmtFamilyTime = (ts, lang) => {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    var diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
  };

  // ── Components ──
  window.FamilyRoleBadge = window.FamilyRoleBadge || ((props) => null);
  window.FamilySignBadge = window.FamilySignBadge || ((props) => null);

  var FamilyRoleBadge = (props) => /*#__PURE__*/React.createElement(window.FamilyRoleBadge, props);
  var FamilySignBadge = (props) => /*#__PURE__*/React.createElement(window.FamilySignBadge, props);

  // 🏠 FAMILY MODAL — Main Component V2
  // ════════════════════════════════════════════════════════
  var FamilyModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification, viewFamilyId, onSendGift, userData, onOpenChat }) => {
    var [activeTab, setActiveTab] = useState('profile');
    var [family, setFamily] = useState(null);
    var [loadingFamily, setLoadingFamily] = useState(true);
    var [familyMembers, setFamilyMembers] = useState([]);
    var [newsLog, setNewsLog] = useState([]);
    var [donationSort, setDonationSort] = useState('intel');
    var [memberSearch, setMemberSearch] = useState('');
    // Gear menu state for member management
    var [gearMenuUid, setGearMenuUid] = useState(null); // uid of member whose gear is open
    // Tag editing state
    var [editTag, setEditTag] = useState('');
    var [savingTag, setSavingTag] = useState(false);
    var [joinRequesterProfiles, setJoinRequesterProfiles] = useState([]);
    // ── Delete family confirm ──
    var [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState(false);
    var [deletingFamily, setDeletingFamily] = useState(false);
    // ── Gift modal in chat ──
    var [showFamilyChatGift, setShowFamilyChatGift] = useState(false);
    // ── Mini profile popup in chat ──
    var [miniProfileMember, setMiniProfileMember] = useState(null); // { uid, name, photo, customId }
    // ── Mention @ in chat ──
    var [mentionSearch, setMentionSearch] = useState(''); // query بعد @
    var [showMentionList, setShowMentionList] = useState(false);
    var chatInputRef = useRef(null);

    // Chat state
    var [chatMessages, setChatMessages] = useState([]);
    var [chatInput, setChatInput] = useState('');
    var [sendingMsg, setSendingMsg] = useState(false);
    var chatEndRef = useRef(null);

    // Donate state
    var [donateAmount, setDonateAmount] = useState('');
    var [donating, setDonating] = useState(false);
    var [showDonatePanel, setShowDonatePanel] = useState(false);

    // Header dots menu
    // header menu state removed (three-dot removed; ranking is now a tab)

    // ── Chest / Treasury ──
    var [showChestModal, setShowChestModal] = useState(false);
    var [selectedChest, setSelectedChest] = useState(null);
    var [claimingChest, setClaimingChest] = useState(false);
    var [chestResult, setChestResult] = useState(null);
    // ── Chest Assign (owner assigns chest to members) ──
    var [showAssignModal, setShowAssignModal] = useState(false);
    var [assigningChest, setAssigningChest] = useState(null); // { inventoryIdx, cfg }
    var [assignCount, setAssignCount] = useState(1);
    var [selectedAssignees, setSelectedAssignees] = useState([]);
    var [assigningLoading, setAssigningLoading] = useState(false);
    // ── Gacha free/paid tracking ──
    var [gachaPaidSpinsToday, setGachaPaidSpinsToday] = useState(0);
    var [showGachaTable, setShowGachaTable] = useState(false);
    var [gachaSpinMode, setGachaSpinMode] = useState('free'); // 'free' | 'paid'

    // ── Gacha ──
    var [showGachaModal, setShowGachaModal] = useState(false);
    var [spinningGacha, setSpinningGacha] = useState(false);
    var [gachaResult, setGachaResult] = useState(null);

    // ── Find Family (auto-load all families) ──
    var [allFamilies, setAllFamilies] = useState([]);
    var [loadingAllFamilies, setLoadingAllFamilies] = useState(false);
    var [showRankingModal, setShowRankingModal] = useState(false);

    // ── Family Chat Modal State ──
    var [showChatModal, setShowChatModal] = useState(false);

    // Create/Join state
    var [view, setView] = useState('home');
    var [tribeName, setFamilyName] = useState('');
    var [tribeTag, setFamilyTag] = useState('');
    var [tribeDesc, setFamilyDesc] = useState('');
    var [tribeEmblem, setFamilyEmblem] = useState('🏠');
    var [creating, setCreating] = useState(false);
    var [joinSearch, setJoinSearch] = useState('');
    var [joinResults, setJoinResults] = useState([]);
    var [searching, setSearching] = useState(false);
    var [joining, setJoining] = useState(false);

    // Manage tab state
    var [editAnnouncement, setEditAnnouncement] = useState('');
    var [editName, setEditName] = useState('');
    var [editDesc, setEditDesc] = useState('');
    var [savingAnn, setSavingAnn] = useState(false);
    var [savingInfo, setSavingInfo] = useState(false);
    var [joinMode, setJoinMode] = useState('open'); // 'open' | 'approval'
    var photoFileRef = useRef(null);
    var signImageFileRef = useRef(null);
    var [uploadingPhoto, setUploadingPhoto] = useState(false);
    var [uploadingSign, setUploadingSign] = useState(false);

    useEffect(() => {
      if (!show) {setLoadingFamily(false);return;}
      setLoadingFamily(true);
      // If viewFamilyId passed (from profile badge click), load that family in read-only mode
      var fid = viewFamilyId || currentUserData?.familyId;
      if (!fid) {setFamily(null);setLoadingFamily(false);return;}
      var unsub = familiesCollection.doc(fid).onSnapshot((snap) => {
        if (snap.exists) {
          var d = { id: snap.id, ...snap.data() };
          setFamily(d);
          setEditAnnouncement(d.announcement || '');
          setEditName(d.name || '');
          setEditDesc(d.description || '');
          setJoinMode(d.joinMode || 'open');
          setEditTag(d.tag || '');

          // ── Weekly sign reset logic (client-side) ──
          // Every Sunday: save weeklyActiveness as lastWeekActiveness, reset weekly
          if (canManageFamily(d, currentUID) && d.createdBy === currentUID) {
            var now = new Date();
            var lastReset = d.lastWeeklyReset;
            var lastResetDate = lastReset ? lastReset.toDate ? lastReset.toDate() : new Date(lastReset.seconds * 1000) : null;
            var isSunday = now.getDay() === 0;
            var needsReset = isSunday && (!lastResetDate || lastResetDate.toDateString() !== now.toDateString());
            if (needsReset) {
              // Save last week's activeness and reset weekly counter
              var newSignData = getFamilySignLevelData(d.weeklyActiveness || 0);
              var updates = {
                lastWeekActiveness: d.weeklyActiveness || 0,
                weeklyActiveness: 0,
                lastWeeklyReset: firebase.firestore.FieldValue.serverTimestamp(),
                // Also store current sign level on family for lazy member updates
                currentSignLevel: newSignData?.level || null,
                currentSignColor: newSignData?.color || null
              };
              familiesCollection.doc(fid).update(updates).catch(() => {});
              // BATCH UPDATE REMOVED for optimization. Members update lazily below.
            }
          }

          // ── Lazy Member Update ──
          // If the member's badge is out of sync with the family's last week performance, update just this member
          if (!viewFamilyId && d.id === currentUserData?.familyId) {
            var lastWeekSign = getFamilySignLevelData(d.lastWeekActiveness || 0);
            var expectedLevel = lastWeekSign?.level || null;
            var expectedColor = lastWeekSign?.color || null;

            if (currentUserData.familySignLevel !== expectedLevel) {
              usersCollection.doc(currentUID).update({
                familySignLevel: expectedLevel,
                familySignColor: expectedColor,
                familySignImageURL: d.signImageURL || null
              }).catch(() => {});
            }
          }
        } else {
          setFamily(null);
          if (!viewFamilyId) {
            usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null }).catch(() => {});
          }
        }
        setLoadingFamily(false);
      }, () => setLoadingFamily(false));
      return () => unsub();
    }, [show, currentUID, currentUserData?.familyId, viewFamilyId]);

    // ── Load chat messages (real-time) ──
    useEffect(() => {
      if (!family?.id || activeTab !== 'chat') return;
      var unsub = familiesCollection.doc(family.id).collection('messages').
      orderBy('timestamp', 'desc').limit(60).
      onSnapshot((snap) => {
        var msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
        setChatMessages(msgs);
      }, () => {});
      return () => unsub();
    }, [family?.id, activeTab]);

    // ── Load family news log (real-time) — keep synced whenever family is open (not only on News tab) ──
    useEffect(() => {
      if (!family?.id) return;
      var nlColl = window.newsLogCollection;
      if (!nlColl) return;
      var unsub = nlColl.
      orderBy('timestamp', 'desc').
      limit(80).
      onSnapshot((snap) => {
        setNewsLog(
          snap.docs.
          map((d) => ({ id: d.id, ...d.data() })).
          filter((item) => item.familyId === family.id).
          slice(0, 30)
        );
      }, (err) => {
        console.error('family news listener failed', err);
      });
      return () => unsub();
    }, [family?.id]);

    // Auto-scroll chat
    useEffect(() => {
      if (activeTab === 'chat') {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }, [chatMessages.length, activeTab]);

    // ── Load member profiles ──
    useEffect(() => {
      if (!family?.members?.length) {setFamilyMembers([]);return;}
      var uids = family.members.slice(0, 30);
      var chunks = [];
      for (var i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
      Promise.all(chunks.map((chunk) =>
      usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
      )).then((results) => {
        var members = [];
        results.forEach((snap) => snap.docs.forEach((d) => members.push({ id: d.id, ...d.data() })));
        setFamilyMembers(members);
      }).catch(() => {});
    }, [family?.members?.join(',')]);

    // ── news is loaded by the newsLogCollection listener above ──

    // ── Load join requester profiles ──
    useEffect(() => {
      var reqs = family?.joinRequests || [];
      if (!reqs.length || activeTab !== 'manage') {setJoinRequesterProfiles([]);return;}
      var chunks = [];
      for (var i = 0; i < reqs.length; i += 10) chunks.push(reqs.slice(i, i + 10));
      Promise.all(chunks.map((chunk) =>
      usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
      )).then((results) => {
        var ps = [];
        results.forEach((snap) => snap.docs.forEach((d) => ps.push({ id: d.id, ...d.data() })));
        setJoinRequesterProfiles(ps);
      }).catch(() => {});
    }, [family?.joinRequests?.join(','), activeTab]);

    if (!show) return null;

    // ─────────────────────────────────────────────
    // HELPERS & ACTIONS
    // ─────────────────────────────────────────────
    var postNews = async (familyId, type, text, amount = 0) => {
      try {
        await familiesCollection.doc(familyId).collection('news').add({
          type, text, amount,
          actorUID: currentUID,
          actorName: currentUserData?.displayName || 'Member',
          actorPhoto: currentUserData?.photoURL || null,
          createdAt: TS()
        });
      } catch (e) {}
    };

    var postChatMessage = async (familyId, text, type = 'text', extra = {}) => {
      try {
        await familiesCollection.doc(familyId).collection('messages').add({
          senderId: currentUID,
          senderName: currentUserData?.displayName || 'Member',
          senderPhoto: currentUserData?.photoURL || null,
          text, type,
          timestamp: TS(),
          ...extra
        });
      } catch (e) {}
    };

    var postSystemMessage = async (familyId, text) => {
      try {
        await familiesCollection.doc(familyId).collection('messages').add({
          senderId: 'system',
          senderName: 'SYSTEM',
          text, type: 'system',
          timestamp: TS()
        });
      } catch (e) {}
    };

    // Update user's sign fields — uses lastWeekActiveness to determine sign level
    var syncUserFamilySign = async (familyId, familyData) => {
      try {
        // Use last week's activeness if available, otherwise current weekly
        var actToCheck = familyData.lastWeekActiveness !== undefined ?
        familyData.lastWeekActiveness :
        familyData.weeklyActiveness || 0;
        var signD = getFamilySignLevelData(actToCheck);
        await usersCollection.doc(currentUID).update({
          familySignLevel: signD?.level || null,
          familySignColor: signD?.color || null,
          familySignImageURL: familyData.signImageURL || null
        });
      } catch (e) {}
    };




    // ── حذف العائلة (المالك فقط) ──







    // ── Load all families for Find Family ──
    var loadAllFamilies = async () => {
      setLoadingAllFamilies(true);
      try {
        var snap = await familiesCollection.orderBy('activeness', 'desc').limit(30).get();
        setAllFamilies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {}
      setLoadingAllFamilies(false);
    };

    // ── Gacha Roll (free once daily / paid 200 Intel per spin up to 50/day) ──

    // ── Claim Chest ──

    // ── Assign chest from treasury inventory to members ──

    // ── Open assigned chest (member claims their prize) ──



    var saveAnnouncement = async () => {
      if (!family?.id || !canManageFamily(family, currentUID)) return;
      setSavingAnn(true);
      try {
        await familiesCollection.doc(family.id).update({ announcement: editAnnouncement });
        onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
      } catch (e) {}
      setSavingAnn(false);
    };



    var handleSignImageUpload = async (e) => {
      var file = e.target.files?.[0];
      if (!file || !family?.id || !canManageFamily(family, currentUID)) return;
      setUploadingSign(true);
      var reader = new FileReader();
      reader.onload = async (ev) => {
        var img = new Image();
        img.onload = async () => {
          var canvas = document.createElement('canvas');
          canvas.width = 120;canvas.height = 40;
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, 120, 40);
          var scale = Math.min(120 / img.width, 40 / img.height);
          var dw = img.width * scale,dh = img.height * scale;
          ctx.drawImage(img, (120 - dw) / 2, (40 - dh) / 2, dw, dh);
          var base64 = canvas.toDataURL('image/png', 0.8);
          try {
            await familiesCollection.doc(family.id).update({ signImageURL: base64 });
            // Update all member user docs
            for (var uid of family.members || []) {
              await usersCollection.doc(uid).update({ familySignImageURL: base64 }).catch(() => {});
            }
            onNotification(lang === 'ar' ? '✅ تم تحديث صورة الشارة' : '✅ Sign image updated');
          } catch (err) {}
          setUploadingSign(false);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };


    // ─────────────────────────────────────────────
    // STYLES
    // ─────────────────────────────────────────────
    var S = {
      modal: { background: 'linear-gradient(180deg,#0d0d1f,#08080f)', border: '1px solid rgba(0,242,255,0.15)', borderRadius: '20px', width: '100%', maxWidth: '460px', height: '92vh', maxHeight: '800px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.95)' },
      header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, background: 'rgba(0,0,0,0.3)', position: 'relative' },
      tabBar: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.35)', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' },
      card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' },
      sectionTitle: { fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '10px', borderLeft: '3px solid #00f2ff', marginBottom: '12px' },
      input: { width: '100%', padding: '10px 13px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
      btn: { padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer' },
      divider: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }
    };

    // هل المستخدم بيشوف قبيلة من الخارج (مش عضو فيها)؟
    var isMemberOfThisFamily = family ? (family.members || []).includes(currentUID) : false;
    var isExternalView = !!(viewFamilyId && (!currentUserData?.familyId || currentUserData?.familyId !== viewFamilyId) && !isMemberOfThisFamily);
    var isReadOnly = !isMemberOfThisFamily;

    var TABS = isReadOnly ? [
    { id: 'profile', label_en: 'Home', label_ar: 'الرئيسية', icon: '🏠' },
    { id: 'members', label_en: 'Members', label_ar: 'أعضاء', icon: '👥' }] :
    [
    { id: 'profile', label_en: 'Home', label_ar: 'الرئيسية', icon: '🏠' },
    { id: 'members', label_en: 'Members', label_ar: 'أعضاء', icon: '👥' },
    { id: 'tasks', label_en: 'Tasks', label_ar: 'مهام', icon: '🎯' },
    { id: 'shop', label_en: 'Shop', label_ar: 'المتجر', icon: '🏅' },
    { id: 'news', label_en: 'News', label_ar: 'أخبار', icon: '📰' },
    { id: 'manage', label_en: 'Manage', label_ar: 'إدارة', icon: '⚙️' }];


    var { getFamilyLevelConfig = () => ({}) } = window.FamilyConstants || {};
    var fLvl = family ? getFamilyLevelConfig(family.level || 1) : null;
    var fProg = 0;
    if (family && fLvl) {
      var nextLv = FAMILY_LEVEL_CONFIG.find((c) => c.level === fLvl.level + 1);
      if (!nextLv) fProg = 100;
      else fProg = Math.max(0, Math.min(100, Math.round(((family.activeness || 0) - fLvl.activeness) / (nextLv.activeness - fLvl.activeness) * 100)));
    }
    var myRole = family ? getFamilyRole(family, currentUID) : null;
    var canManage = family ? canManageFamily(family, currentUID) : false;
    var weeklyAct = family ? family.weeklyActiveness || 0 : 0;
    // signData: based on lastWeekActiveness (last week's activity → this week's sign)
    // If lastWeekActiveness not set, use weeklyActiveness as fallback
    var SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    var lastWeekAct = family ? family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : weeklyAct : 0;
    var signData = (family ? getFamilySignLevelData(lastWeekAct) : null) || SIGN_FALLBACK;
    var signProg = family ? getFamilySignProgress(lastWeekAct) : 0;
    var onSetRole = async (targetUID, newRole) => {
      try {
        await window.FamilyService.setMemberRole({ family, targetUID, newRole, currentUID, lang });
        onNotification(lang === 'ar' ? '✅ تم تحديث الرتبة' : '✅ Role updated');
      } catch (e) {
        onNotification(e.message || (lang === 'ar' ? '❌ فشل التحديث' : '❌ Update failed'));
      }
    };

    var onKick = async (targetUID) => {
      try {
        await window.FamilyService.kickMember({ family, targetUID, currentUID, lang });
        onNotification(lang === 'ar' ? '✅ تم طرد العضو' : '✅ Member kicked');
      } catch (e) {
        onNotification(e.message || (lang === 'ar' ? '❌ فشل الطرد' : '❌ Kick failed'));
      }
    };

    // ─────────────────────────────────────────────
    // TAB: PROFILE (redesigned to match reference image)
    // ─────────────────────────────────────────────
    var renderProfile = () => {
      var isReadOnly = !!viewFamilyId && viewFamilyId !== currentUserData?.familyId;
      if (window.FamilyProfile) return /*#__PURE__*/React.createElement(window.FamilyProfile, { family: family, familyMembers: familyMembers, currentUID: currentUID, currentUserData: currentUserData, userData: userData, lang: lang, onNotification: onNotification, S: S, myRole: myRole, activeTab: activeTab, setActiveTab: setActiveTab, setFamily: setFamily, view: view, setView: setView, isReadOnly: isReadOnly, showDonatePanel: showDonatePanel, setShowDonatePanel: setShowDonatePanel });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };


    // ─────────────────────────────────────────────
    // TAB: MEMBERS
    // ─────────────────────────────────────────────
    var renderMembers = () => {
      if (window.FamilyMembers) return /*#__PURE__*/React.createElement(window.FamilyMembers, { family: family, members: familyMembers, currentUID: currentUID, lang: lang, onNotification: onNotification, S: S, myRole: myRole, activeTab: activeTab, setActiveTab: setActiveTab, setFamily: setFamily, view: view, setView: setView, onSetRole: onSetRole, onKick: onKick });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };

    // ─────────────────────────────────────────────
    // TAB: TASKS
    // ─────────────────────────────────────────────
    var renderTasks = () => {
      if (window.FamilyTasks) return /*#__PURE__*/React.createElement(window.FamilyTasks, { family: family, currentUserData: currentUserData, currentUID: currentUID, lang: lang, onNotification: onNotification, S: S, myRole: myRole, setActiveTab: setActiveTab });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };

    // ─────────────────────────────────────────────
    // TAB: FAMILY SHOP (Family Coins only)
    // ─────────────────────────────────────────────
    var renderShop = () => {
      if (window.FamilyShop) {
        return /*#__PURE__*/React.createElement(window.FamilyShop, { family: family, currentUID: currentUID, currentUserData: currentUserData, lang: lang, onNotification: onNotification, S: S });
      }
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري تحميل المتجر...' : 'Loading Shop...');
    };

    // ─────────────────────────────────────────────
    // TAB: RANKING (dedicated tab)
    // ─────────────────────────────────────────────
    var renderRankingTab = () => {
      if (window.FamilyRanking) return /*#__PURE__*/React.createElement(window.FamilyRanking, { family: family, currentUID: currentUID, lang: lang, onNotification: onNotification, S: S, myRole: myRole, activeTab: activeTab, setActiveTab: setActiveTab, setFamily: setFamily, view: view, setView: setView });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };

    // ─────────────────────────────────────────────
    // TAB: NEWS
    // ─────────────────────────────────────────────
    var renderNews = () => {
      if (window.FamilyNews) return /*#__PURE__*/React.createElement(window.FamilyNews, { family: family, newsLog: newsLog, currentUserData: currentUserData, currentUID: currentUID, lang: lang, onNotification: onNotification, S: S, myRole: myRole, activeTab: activeTab, setActiveTab: setActiveTab, setFamily: setFamily, view: view, setView: setView });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };

    // ─────────────────────────────────────────────
    // TAB: MANAGE
    // ─────────────────────────────────────────────
    var renderManage = () => {
      if (window.FamilyManagement) return /*#__PURE__*/React.createElement(window.FamilyManagement, { family: family, currentUID: currentUID, lang: lang, canManage: myRole === 'owner' || myRole === 'admin', myRole: myRole, familyMembers: familyMembers, joinRequesterProfiles: joinRequesterProfiles, S: S, Z: Z, onNotification: onNotification, onUpdateFamily: () => {}, onLeaveFamily: () => {}, onDeleteFamily: () => {} });
      return /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...');
    };



    // ─────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: window.Z ? window.Z.MODAL_HIGH : 12000 } }, /*#__PURE__*/
      React.createElement("div", { style: S.modal, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


      React.createElement("div", { style: S.header },
      family ? /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '34px', height: '34px', borderRadius: '50%', border: `2px solid ${fLvl?.color}55`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 } },
      family.photoURL ? /*#__PURE__*/React.createElement("img", { src: family.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: "" }) : family.emblem || '🏠'
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, /*#__PURE__*/

      React.createElement("span", {
        onClick: () => setActiveTab('profile'),
        style: { fontSize: '14px', fontWeight: 900, color: 'white', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', cursor: 'pointer', transition: 'color 0.2s' },
        onMouseEnter: (e) => e.currentTarget.style.color = '#00f2ff',
        onMouseLeave: (e) => e.currentTarget.style.color = 'white',
        title: lang === 'ar' ? 'انتقل للصفحة الرئيسية' : 'Go to family home' },

      family.name
      ),
      signData.level > 0 && /*#__PURE__*/React.createElement(FamilySignBadge, { tag: family.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: family.signImageURL })
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("span", null, fLvl?.icon, " ", lang === 'ar' ? `المستوى ${fLvl?.level}` : `Lv.${fLvl?.level}`), /*#__PURE__*/
      React.createElement("span", null, "\xB7"), /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDC65 ", family.members?.length || 0, " ", lang === 'ar' ? 'عضو' : 'members'),
      myRole && myRole !== 'owner' && /*#__PURE__*/React.createElement(FamilyRoleBadge, { role: myRole, lang: lang, small: true })
      )
      )
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '20px' } }, "\uD83C\uDFE0"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '15px', fontWeight: 800, color: 'white' } }, lang === 'ar' ? 'العائلة' : 'Family')
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 } }, /*#__PURE__*/

      React.createElement("button", { onClick: onClose, style: { width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u2715")
      )
      ),


      family && /*#__PURE__*/
      React.createElement("div", { style: S.tabBar },
      TABS.map((tab) => /*#__PURE__*/
      React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), style: {
          flex: 1, padding: '10px 4px 8px', fontSize: '10px', fontWeight: activeTab === tab.id ? 800 : 500,
          color: activeTab === tab.id ? '#00f2ff' : '#6b7280', background: 'transparent', border: 'none',
          borderBottom: `2px solid ${activeTab === tab.id ? '#00f2ff' : 'transparent'}`,
          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
          minWidth: '50px', position: 'relative'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', marginBottom: '1px' } }, tab.icon), /*#__PURE__*/
      React.createElement("div", null, lang === 'ar' ? tab.label_ar : tab.label_en),
      tab.id === 'manage' && family?.joinRequests?.length > 0 && /*#__PURE__*/React.createElement("span", { style: { position: 'absolute', top: '4px', right: '6px', fontSize: '8px', background: '#f97316', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 } }, family.joinRequests.length)
      )
      )
      ), /*#__PURE__*/



      React.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 } },
      loadingFamily ? /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' } }, "\u23F3") :
      !family ?
      window.FamilySearch ? /*#__PURE__*/React.createElement(window.FamilySearch, { view: view, setView: setView, currentUID: currentUID, currentUserData: currentUserData, lang: lang, onNotification: onNotification, onClose: onClose, S: S }) : /*#__PURE__*/React.createElement("div", { style: { padding: '20px', color: 'white', textAlign: 'center' } }, lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : /*#__PURE__*/

      React.createElement(React.Fragment, null,
      activeTab === 'profile' && renderProfile(),
      activeTab === 'members' && renderMembers(),

      activeTab === 'tasks' && renderTasks(),
      activeTab === 'shop' && renderShop(),
      activeTab === 'ranking' && renderRankingTab(),
      activeTab === 'news' && renderNews(),
      activeTab === 'manage' && renderManage()
      )

      ),


      family && activeTab === 'profile' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, width: '100%', boxSizing: 'border-box' } },

      !isReadOnly ? /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%' } }, /*#__PURE__*/
        React.createElement("button", { onClick: () => onOpenChat ? onOpenChat() : setShowChatModal(true), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 12px' } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "💬"), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: '#6b7280', fontWeight: 600 } }, lang === 'ar' ? 'شات' : 'Chat')
        ), /*#__PURE__*/

        React.createElement("button", { onClick: () => setShowGachaModal(true), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 12px' } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "🎰"), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: '#a78bfa', fontWeight: 600 } }, lang === 'ar' ? 'جاتشه' : 'Gacha')
        ),

        React.createElement("button", { onClick: () => setShowDonatePanel((v) => !v), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 12px' } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, color: '#10b981' } }, "+"), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: '#10b981', fontWeight: 600 } }, lang === 'ar' ? 'تبرع' : 'Donate')
        )
      ) : /*#__PURE__*/

      React.createElement("button", {
        onClick: async () => {
          if (!window.FamilyService?.joinFamily) return;
          try {
            var res = await window.FamilyService.joinFamily({ familyId: family.id, currentUID, currentUserData, lang });
            if (res?.status === 'pending') {
              onNotification(lang === 'ar' ? '✅ تم إرسال طلب الانضمام' : '✅ Join request sent');
            } else if (res?.status === 'joined') {
              onNotification(lang === 'ar' ? '🎉 تم الانضمام للقبيلة' : '🎉 Joined the family');
            }
            } catch (e) {
              var msg = e.message || "";
              if (!msg.startsWith('COOLDOWN:')) console.error(e);
              if (msg.startsWith('COOLDOWN:')) {
                var hours = msg.split(':')[1];
                onNotification(lang === 'ar' 
                  ? `⏳ يجب الانتظار ${hours} ساعة قبل الانضمام لقبيلة أخرى` 
                  : `⏳ You must wait ${hours} hours before joining another family`);
              } else {
                onNotification(msg || (lang === 'ar' ? '❌ فشل الانضمام' : '❌ Failed to join'));
              }
            }
        },
        style: {
          width: '100%', padding: '12px', borderRadius: '14px', border: 'none',
          background: (() => {
            if (currentUserData?.leftFamilyAt) {
              var leftAt = currentUserData.leftFamilyAt.toDate ? currentUserData.leftFamilyAt.toDate().getTime() : currentUserData.leftFamilyAt;
              if (Date.now() - leftAt < 24 * 60 * 60 * 1000) return '#374151';
            }
            return family.joinType === 'open' ? 'linear-gradient(135deg, #00dbde, #0057ff)' : 'linear-gradient(135deg, #fc00ff, #7000ff)';
          })(),
          color: 'white', fontSize: '14px', fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s'
        }
      },
        family.joinType === 'open' ?
          (lang === 'ar' ? '🚀 انضم الآن' : '🚀 Join Now') :
          (lang === 'ar' ? '📩 طلب انضمام' : '📩 Request to Join')
      )

      )

      )
      )
      ),


      showGachaModal && window.FamilyGacha && /*#__PURE__*/
      React.createElement(window.FamilyGacha, {
        show: true,
        family: family,
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang,
        onNotification: onNotification,
        onClose: () => setShowGachaModal(false),
        S: S }
      )

      ));

  };

  // ── Exports ──
  window.FAMILY_CREATE_COST = FAMILY_CREATE_COST;
  window.FAMILY_LEVEL_CONFIG = FAMILY_LEVEL_CONFIG;
  window.getFamilySignProgress = getFamilySignProgress;
  window.getFamilyLevel = getFamilyLevel;
  window.getFamilyLevelProgress = getFamilyLevelProgress;
  window.FAMILY_TASKS_CONFIG = FAMILY_TASKS_CONFIG;
  window.GACHA_CONFIG = GACHA_CONFIG;
  window.GACHA_RARITY_COLORS = GACHA_RARITY_COLORS;
  window.FAMILY_ROLE_CONFIG = FAMILY_ROLE_CONFIG;
  window.getFamilyRole = getFamilyRole;
  window.canManageFamily = canManageFamily;
  window.FAMILY_EMBLEMS = FAMILY_EMBLEMS;
  window.fmtFamilyNum = fmtFamilyNum;
  window.fmtFamilyTime = fmtFamilyTime;
  window.FamilyModal = FamilyModal;

})();
