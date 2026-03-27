
(() => {
    var { CHEST_CONFIG, ACTIVENESS_MILESTONES } = window;
    var { FAMILY_LEVEL_CONFIG, FAMILY_SIGN_LEVELS } = window.FamilyConstants || {};
var useFamilyData = () => {
    var [currentUID, setCurrentUID] = React.useState(auth.currentUser?.uid || null);
    var [currentUserData, setCurrentUserData] = React.useState(null);
    var [family, setFamily] = React.useState(null);
    var [familyMembers, setFamilyMembers] = React.useState([]);
    var [loadingFamily, setLoadingFamily] = React.useState(true);
    var [error, setError] = React.useState(null);

    React.useEffect(() => {
        var unsubAuth = auth.onAuthStateChanged(user => {
            setCurrentUID(user?.uid || null);
        });

        if (!currentUID) {
            setLoadingFamily(false);
            return () => unsubAuth();
        }

        // 1. Listen to user doc for familyId
        var unsubUser = usersCollection.doc(currentUID).onSnapshot(snap => {
            var userData = snap.data();
            setCurrentUserData(userData);
            var familyId = userData?.familyId;

            if (!familyId) {
                setFamily(null);
                setFamilyMembers([]);
                setLoadingFamily(false);
                return;
            }

            // 2. Listen to family doc
            var unsubFam = familiesCollection.doc(familyId).onSnapshot(fSnap => {
                if (fSnap.exists) {
                    setFamily({ id: fSnap.id, ...fSnap.data() });
                } else {
                    setFamily(null);
                }
                setLoadingFamily(false);
            }, err => {
                console.error("Family listener error:", err);
                setError(err.message);
                setLoadingFamily(false);
            });

            // 3. Listen to members (Commented out if using field-based membersData or if permissions are missing)
            /*
            var unsubMbrs = familiesCollection.doc(familyId).collection('membersData').onSnapshot(mSnap => {
                // ...
            }, err => console.error("Members listener error:", err));
            */

            return () => {
                unsubFam();
                // if (typeof unsubMbrs === 'function') unsubMbrs();
            };
        }, err => {
            console.error("User listener error:", err);
            setError(err.message);
            setLoadingFamily(false);
        });

        return () => {
            unsubAuth();
            unsubUser();
        };
    }, [currentUID]);

    return { currentUID, currentUserData, family, familyMembers: family?.membersData || [], loadingFamily, error };
};

/**
 * FamilyService - Centralized business logic for Family features.
 * Decouples Firebase transactions and complex calculations from UI components.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 💡 LOGIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

var getFamilyLevelConfig = (level = 1) => {
    return FAMILY_LEVEL_CONFIG.find(c => c.level === level) || FAMILY_LEVEL_CONFIG[0];
};

var getFamilyLevelProgress = (activeness = 0, currentLevel = 1) => {
    var cur = getFamilyLevelConfig(currentLevel);
    var next = FAMILY_LEVEL_CONFIG.find(c => c.level === currentLevel + 1);
    if (!next) return 100;
    var progress = Math.max(0, activeness - cur.activeness);
    var range = next.activeness - cur.activeness;
    return Math.max(0, Math.min(100, Math.round((progress / range) * 100)));
};

var getFamilySignImage = (level) => {
    return window.FamilyConstants?.getFamilySignImage?.(0, level) || null;
};

var getFamilySignLevelData = (weeklyActiveness = 0) => {
    return window.FamilyConstants?.getFamilySignLevelData?.(weeklyActiveness) || null;
};

var getFamilySignProgress = (weeklyActiveness = 0) => {
    var levels = window.FamilyConstants?.FAMILY_SIGN_LEVELS || [];
    var cur = getFamilySignLevelData(weeklyActiveness);
    if (!cur) {
        var first = levels[0];
        if (!first) return 0;
        return Math.min(99, Math.round((weeklyActiveness / first.threshold) * 100));
    }
    var next = levels.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
};

var makeChestId = (prefix) => `${prefix || 'chest'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

var cloneChestRewards = (rewards = []) => rewards.map((reward) => {
    var cloned = { ...reward };
    if (['currency', 'coins', 'familyCoins', 'charisma'].includes(cloned.type)) {
        cloned.amountRemaining = Number(cloned.amount || 0);
    }
    if (cloned.qty == null) cloned.qty = 1;
    if (typeof window.resolveRewardItem === 'function') {
        cloned = window.resolveRewardItem(cloned);
    }
    return cloned;
});

var buildAssignedDrops = (rewards = [], selectedUIDs = []) => {
    var memberIds = (selectedUIDs || []).filter(Boolean);
    var drops = {};
    memberIds.forEach(uid => {
        drops[uid] = { currency: 0, coins: 0, charisma: 0, items: [] };
    });
    if (!memberIds.length) return drops;

    rewards.forEach((reward) => {
        if (!reward) return;
        if (reward.type === 'currency' || reward.type === 'coins' || reward.type === 'familyCoins' || reward.type === 'charisma') {
            var total = Number(reward.amountRemaining != null ? reward.amountRemaining : reward.amount || 0);
            var perMember = Math.floor(total / memberIds.length);
            var remainder = total % memberIds.length;
            memberIds.forEach((uid, index) => {
                var share = perMember + (index < remainder ? 1 : 0);
                if (!share) return;
                if (reward.type === 'currency') drops[uid].currency += share;
                else if (reward.type === 'charisma') drops[uid].charisma += share;
                else drops[uid].coins += share;
            });
            return;
        }

        var totalQty = Math.max(1, Number(reward.qty || 1));
        for (var copyIdx = 0; copyIdx < totalQty; copyIdx++) {
            var targetUID = memberIds[copyIdx % memberIds.length];
            drops[targetUID].items.push({ ...reward, qty: 1 });
        }
    });

    return drops;
};

var formatAssignedDropSummary = (drop, lang) => {
    if (!drop) return lang === 'ar' ? 'لا شيء' : 'Nothing';
    var parts = [];
    if (drop.currency > 0) parts.push(`${drop.currency} 🧠`);
    if (drop.coins > 0) parts.push(`${drop.coins} ${FAMILY_COINS_SYMBOL}`);
    if (drop.charisma > 0) parts.push(`${drop.charisma} ⭐`);
    (drop.items || []).forEach(item => parts.push(`${item.qty || 1}× ${item.icon || '🎁'}`));
    return parts.join(' • ') || (lang === 'ar' ? 'لا شيء' : 'Nothing');
};

// ─────────────────────────────────────────────────────────────────────────────
// 📦 TREASURY & CHESTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Claims a share from an assigned chest.
 */
var openAssignedChest = async ({ family, currentUID, currentUserData, inventoryIdx, lang, onNotification }) => {
    if (!family?.id || !currentUID) return null;
    var inv = family.treasuryInventory || [];
    var chest = inv[inventoryIdx];
    if (!chest || !(chest.assignedTo || []).includes(currentUID)) return null;

    var cfg = CHEST_CONFIG[chest.chestType];
    if (!cfg) return null;

    var claims = chest.claimedBy || {};
    var myClaimCount = claims[currentUID] || 0;
    if (myClaimCount >= (chest.maxClaimsPerMember || 1)) {
        onNotification(lang === 'ar' ? '✅ استلمت حصتك بالكامل' : '✅ You already claimed your share');
        return null;
    }

    try {
        var familyRef = familiesCollection.doc(family.id);
        var myBundle = { currency: 0, coins: 0, charisma: 0, items: [] };

        await db.runTransaction(async (transaction) => {
            var famDoc = await transaction.get(familyRef);
            if (!famDoc.exists) throw new Error('Family not found');
            var famData = famDoc.data();
            var freshInv = famData.treasuryInventory || [];
            var freshChest = freshInv[inventoryIdx];
            if (!freshChest || !(freshChest.assignedTo || []).includes(currentUID)) throw new Error('Not assigned');
            
            var freshClaims = freshChest.claimedBy || {};
            var freshClaimCount = freshClaims[currentUID] || 0;
            if (freshClaimCount >= (freshChest.maxClaimsPerMember || 1)) throw new Error('Already claimed');

            var rewardsToGive = freshChest.assignedDrops?.[currentUID] || { currency: 0, coins: 0, charisma: 0, items: [] };
            freshChest.claimedBy = { ...freshClaims, [currentUID]: freshClaimCount + 1 };
            freshInv[inventoryIdx] = freshChest;

            // Calculate and apply rewards inside the transaction
            var userRef = usersCollection.doc(currentUID);
            var userUpdate = {};
            
            if (rewardsToGive.currency > 0) userUpdate.currency = firebase.firestore.FieldValue.increment(rewardsToGive.currency);
            if (rewardsToGive.charisma > 0) userUpdate.charisma = firebase.firestore.FieldValue.increment(rewardsToGive.charisma);
            
            var arrayUnion = firebase.firestore.FieldValue.arrayUnion;
            (rewardsToGive.items || []).forEach(r => {
                if (r.type === 'frame') {
                    var expiresAt = r.duration ? Date.now() + r.duration * 86400000 : null;
                    userUpdate[`inventory.expiry.${r.frameId}`] = expiresAt;
                    userUpdate['inventory.frames'] = arrayUnion(r.frameId);
                } else if (r.type === 'title') {
                    userUpdate['inventory.titles'] = arrayUnion(r.titleId);
                } else if (r.type === 'badge') {
                    userUpdate['inventory.badges'] = arrayUnion(r.badgeId);
                } else if (r.type === 'ring') {
                    userUpdate['inventory.rings'] = arrayUnion(r.ringId);
                } else if (r.type === 'gift') {
                    if (r.giftId === 'gift_ring') {
                        userUpdate['inventory.rings'] = arrayUnion(r.giftId);
                    } else {
                        userUpdate[`inventory.giftCounts.${r.giftId}`] = firebase.firestore.FieldValue.increment(r.qty || 1);
                        userUpdate['inventory.gifts'] = arrayUnion(r.giftId);
                    }
                }
            });

            var familyUpdates = { treasuryInventory: freshInv };
            if (rewardsToGive.coins > 0) {
                familyUpdates.familyCoins = firebase.firestore.FieldValue.increment(rewardsToGive.coins);
            }

            transaction.update(familyRef, familyUpdates);
            if (Object.keys(userUpdate).length > 0) {
                transaction.update(userRef, userUpdate);
            }

            myBundle = rewardsToGive;
        });


        // Detailed receipt text
        var receiptParts = [];
        if (myBundle.currency > 0) receiptParts.push(`${myBundle.currency} 🧠`);
        if (myBundle.coins > 0) receiptParts.push(`${myBundle.coins} ${FAMILY_COINS_SYMBOL}`);
        if (myBundle.charisma > 0) receiptParts.push(`${myBundle.charisma} ⭐`);
        myBundle.items.forEach(r => {
            var rIcon = r.icon || '🎁';
            if (r.type === 'frame') receiptParts.push(`${rIcon} ${r.duration || '?'}d`);
            else receiptParts.push(`${r.qty || 1}× ${rIcon}`);
        });
        var receiptText = receiptParts.join(' • ') || (lang==='ar'?'لا شيء':'Nothing');

        // Post to chat
        var chestIcon = ACTIVENESS_MILESTONES.find(m => m.chestType === chest.chestType)?.icon || '📦';
        await familiesCollection.doc(family.id).collection('messages').add({
            senderId: currentUID,
            senderName: currentUserData?.displayName || 'Member',
            senderPhoto: currentUserData?.photoURL || null,
            type: 'chest_opened',
            chestId: chest.chestId || null,
            inventoryIdx,
            chestType: chest.chestType,
            chestIcon,
            rewardLabel: lang === 'ar' ? 'نصيبك من الصندوق' : 'Your Share',
            rewardIcon: '🎁',
            rewardReceipt: receiptText,
            text: lang === 'ar'
                ? `🎉 ${currentUserData?.displayName} فتح ${chestIcon} ${cfg.name_ar}\n📋 حصل على: ${receiptText}`
                : `🎉 ${currentUserData?.displayName} opened ${chestIcon} ${cfg.name_en}\n📋 Received: ${receiptText}`,
            timestamp: TS(),
        });

        return { myBundle, receiptText, cfg };
    } catch (e) {
        console.error('FamilyService.openAssignedChest:', e);
        throw e;
    }
};

/**
 * Assigns a chest from the treasury to specific members.
 */
var assignChestToMembers = async ({ family, chestIdx, selectedUIDs, currentUID, lang }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) throw new Error('Unauthorized');
    var inv = [...(family.treasuryInventory || [])];
    var chest = inv[chestIdx];
    if (!chest) return;
    var already = chest.assignedTo;
    if (Array.isArray(already) && already.length > 0) return;

    var assignedDrops = buildAssignedDrops(
        chest.availableRewards || cloneChestRewards((CHEST_CONFIG[chest.chestType] || {}).rewards || []),
        selectedUIDs
    );
    inv[chestIdx] = {
        ...chest,
        assignedTo: selectedUIDs,
        assignedAtMs: Date.now(),
        assignedBy: currentUID,
        maxClaimsPerMember: 1,
        claimedBy: {},
        assignedDrops,
    };

    await familiesCollection.doc(family.id).update({ treasuryInventory: inv });

    // Announcement in chat
    var cfg = CHEST_CONFIG[chest.chestType];
    var chestIcon = cfg?.icon || '📦';
    var memberList = family.membersData || [];
    if (!memberList.length && family.members && family.members.length) {
        memberList = family.members.map(uid => ({ id: uid, displayName: uid.slice(-6) }));
    }
    var names = memberList
        .filter(m => selectedUIDs.includes(m.id))
        .map(m => m.displayName)
        .join(', ');

    await familiesCollection.doc(family.id).collection('messages').add({
        type: 'chest_assigned',
        chestId: inv[chestIdx].chestId || null,
        inventoryIdx: chestIdx,
        chestType: chest.chestType,
        chestIcon,
        assignedTo: selectedUIDs,
        assignedMemberNames: memberList
            .filter(m => selectedUIDs.includes(m.id))
            .reduce((acc, m) => { acc[m.id] = m.displayName; return acc; }, {}),
        assignedDrops,
        maxClaimsPerMember: 1,
        text: lang === 'ar'
            ? `🎁 تم تخصيص ${chestIcon} ${cfg.name_ar} لـ: ${names}`
            : `🎁 ${chestIcon} ${cfg.name_en} assigned to: ${names}`,
        timestamp: TS(),
        senderId: 'system',
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🎰 GACHA SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

var handleGachaRoll = async ({ family, currentUID, currentUserData, mode = 'free', lang, onNotification }) => {
    if (!family?.id || !currentUID) throw new Error('Invalid context');

    var cBasic = window.FamilyConstants?.GACHA_CONFIG_BASIC || window.GACHA_CONFIG_BASIC || window.GACHA_CONFIG || {};
    var cPrem = window.FamilyConstants?.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG || {};
    var currentGachaConfig = (family?.level >= 5) ? cPrem : cBasic;
    var rewards = currentGachaConfig.rewards || [];
    if (!rewards.length) {
        if (onNotification) onNotification(lang === 'ar' ? '❌ إعدادات الجاتشه غير جاهزة' : '❌ Gacha not configured');
        return null;
    }

    var today = new Date().toDateString();
    var HARD_COST_CAP = 200;
    var costPerSpin = Math.min(Number(currentGachaConfig.paidCostPerSpin) || 200, HARD_COST_CAP);
    var maxPaid = Number(currentGachaConfig.maxPaidSpinsDaily) || 50;

    if (mode === 'free') {
        var lastFree = family.gachaFreeLastUsed;
        if (lastFree) {
            var lastDate = lastFree.toDate ? lastFree.toDate() : new Date(typeof lastFree === 'number' ? lastFree : (lastFree.seconds || 0) * 1000);
            if (!isNaN(lastDate.getTime()) && lastDate.toDateString() === today) {
                onNotification(lang === 'ar' ? '⏳ استخدمت السحبة المجانية اليوم' : '⏳ Free spin already used today');
                return null;
            }
        }
    } else {
        if ((currentUserData?.currency || 0) < costPerSpin) {
            onNotification(lang === 'ar' ? `❌ تحتاج ${costPerSpin} إنتل` : `❌ Need ${costPerSpin} Intel`);
            return null;
        }
        var spinsToday = family.gachaPaidSpins?.[today] || 0;
        if (spinsToday >= maxPaid) {
            onNotification(lang === 'ar' ? `❌ وصلت الحد اليومي (${maxPaid} سحبة)` : `❌ Daily limit reached (${maxPaid} spins)`);
            return null;
        }
    }

    try {
        var total = rewards.reduce((s, r) => s + (r.weight || 0), 0);
        if (total <= 0) return null;
        var rand = Math.random() * total;
        var picked = rewards[rewards.length - 1];
        for (var i = 0; i < rewards.length; i++) {
            var rw = rewards[i];
            rand -= (rw.weight || 0);
            if (rand <= 0) { picked = rw; break; }
        }

        var famRef = familiesCollection.doc(family.id);
        var userRef = usersCollection.doc(currentUID);
        var rewardUpdates = {};
        if (mode === 'free') {
            rewardUpdates.gachaFreeLastUsed = TS();
        } else {
            rewardUpdates[`gachaPaidSpins.${today}`] = firebase.firestore.FieldValue.increment(1);
        }

        var userRewardUpdate = {};
        var currencyDelta = 0;
        if (mode === 'paid') currencyDelta -= costPerSpin;
        if (picked.type === 'currency') {
            currencyDelta += picked.amount || 0;
        }
        if (currencyDelta !== 0) {
            userRewardUpdate.currency = firebase.firestore.FieldValue.increment(currencyDelta);
        }

        if (picked.type === 'charisma') {
            userRewardUpdate.charisma = firebase.firestore.FieldValue.increment(picked.amount || 0);
        } else if (picked.type === 'coins') {
            rewardUpdates.familyCoins = firebase.firestore.FieldValue.increment(picked.amount || 0);
        } else if (picked.type === 'frame' || picked.type === 'frame_anim') {
            var expiresAt = picked.duration ? Date.now() + picked.duration * 86400000 : null;
            userRewardUpdate['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(picked.frameId);
            userRewardUpdate[`inventory.expiry.${picked.frameId}`] = expiresAt;
        } else if (picked.type === 'gift') {
            userRewardUpdate['inventory.gifts'] = firebase.firestore.FieldValue.arrayUnion(picked.giftId);
            userRewardUpdate[`inventory.giftCounts.${picked.giftId}`] = firebase.firestore.FieldValue.increment(picked.qty || 1);
            if (picked.giftId !== 'gift_ring') {
                userRewardUpdate[`inventory.expiry.${picked.giftId}`] = Date.now() + 30 * 86400000;
            }
        } else if (picked.type === 'chest') {
            var chestItem = {
                chestId: makeChestId('gacha'),
                chestType: picked.chestType,
                gachaWon: true,
                wonAt: Date.now(),
                wonBy: currentUID,
                availableRewards: cloneChestRewards((CHEST_CONFIG[picked.chestType] || {}).rewards || []),
            };
            rewardUpdates.treasuryInventory = firebase.firestore.FieldValue.arrayUnion(chestItem);
        }

        var batch = db.batch();
        batch.update(famRef, rewardUpdates);
        if (Object.keys(userRewardUpdate).length > 0) {
            batch.update(userRef, userRewardUpdate);
        }
        await batch.commit();

        return picked;
    } catch (e) {
        console.error('FamilyService.handleGachaRoll:', e);
        throw e;
    }
};

/**
 * Claims a milestone chest from activeness.
 */
var handleClaimChest = async ({ family, chestIdx, currentUID, lang, onNotification }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return null;
    var ms = ACTIVENESS_MILESTONES[chestIdx];
    if (!ms || (family.weeklyActiveness || 0) < ms.threshold) return null;
    var claimed = family.activenessClaimedMilestones || [];
    if (claimed.includes(chestIdx)) return null;

    try {
        var chestCfg = CHEST_CONFIG[ms.chestType] || {};
        var chestItem = {
            chestId: makeChestId('milestone'),
            chestType: ms.chestType,
            sourceMilestoneIdx: chestIdx,
            claimedAtMs: Date.now(),
            claimedByManager: currentUID,
            availableRewards: cloneChestRewards(chestCfg.rewards || []),
        };
        await familiesCollection.doc(family.id).update({
            activenessClaimedMilestones: firebase.firestore.FieldValue.arrayUnion(chestIdx),
            treasuryInventory: firebase.firestore.FieldValue.arrayUnion(chestItem),
            lastActivity: TS(),
        });
        try {
            await postNews(
                family.id,
                'milestone',
                lang === 'ar'
                    ? `🎁 تمت إضافة ${chestCfg.name_ar || ms.name_ar} إلى خزينة القبيلة`
                    : `🎁 ${chestCfg.name_en || ms.name_en} was added to the family treasury`,
                0,
                { uid: currentUID }
            );
        } catch (newsError) {
            console.warn('FamilyService.handleClaimChest postNews failed', newsError);
        }
        return { ms, cfg: chestCfg };
    } catch (e) {
        console.error('FamilyService.handleClaimChest:', e);
        throw e;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️ MANAGEMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new family.
 */
var createFamily = async ({ tribeName, tribeTag, tribeDesc, tribeEmblem, currentUID, currentUserData, lang }) => {
    if (!tribeName.trim() || !tribeTag.trim() || !currentUID) return null;
    var cleanTag = tribeTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    var cleanName = tribeName.trim().slice(0, 10);
    
    var tagCheck = await familiesCollection.where('tag', '==', cleanTag).get();
    if (!tagCheck.empty) throw new Error('Tag already taken');

    var ref = await familiesCollection.add({
        name: cleanName, tag: cleanTag, description: tribeDesc.trim(),
        emblem: tribeEmblem, announcement: '',
        photoURL: null, signImageURL: null,
        createdBy: currentUID,
        leaderName: currentUserData?.displayName || 'Leader',
        leaderPhoto: currentUserData?.photoURL || null,
        members: [currentUID],
        memberRoles: { [currentUID]: 'owner' },
        memberDonations: { [currentUID]: { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 } },
        level: 1, activeness: 0, weeklyActiveness: 0,
        lastWeekActiveness: 0,
        treasury: 0, familyCoins: 0,
        activenessClaimedMilestones: [],
        treasuryInventory: [],
        gachaLastUsed: null,
        taskProgress: {},
        joinRequests: [], joinMode: 'open', weeklyRank: null,
        createdAt: TS(),
        lastActivity: TS(),
    });

    await usersCollection.doc(currentUID).update({
        currency: firebase.firestore.FieldValue.increment(-FAMILY_CREATE_COST),
        familyId: ref.id, familyName: cleanName, familyTag: cleanTag,
        familySignLevel: null, familySignColor: null, familySignImageURL: null,
    });

    await postSystemMessage(ref.id, lang === 'ar' ? `🏠 تم إنشاء العائلة! مرحباً ${currentUserData?.displayName}` : `🏠 Family created! Welcome ${currentUserData?.displayName}`);
    return ref.id;
};

/**
 * Join an existing family.
 */
var joinFamily = async ({ familyId, currentUID, currentUserData, lang }) => {
    if (!currentUID || !familyId) return null;
    var snap = await familiesCollection.doc(familyId).get();
    if (!snap.exists) throw new Error('Family not found');
    var fd = snap.data();
    var lvl = getFamilyLevelConfig(fd.level || 1);
    if ((fd.members || []).length >= lvl.maxMembers) throw new Error('Family is full');

    if (fd.joinMode === 'approval') {
        await familiesCollection.doc(familyId).update({
            joinRequests: firebase.firestore.FieldValue.arrayUnion(currentUID)
        });
        return { status: 'pending' };
    }

    await familiesCollection.doc(familyId).update({
        members: firebase.firestore.FieldValue.arrayUnion(currentUID),
        [`memberRoles.${currentUID}`]: 'member',
        [`memberDonations.${currentUID}`]: { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 },
        lastActivity: TS(),
    });

    var signData = getFamilySignLevelData(fd.lastWeekActiveness || 0);
    await usersCollection.doc(currentUID).update({
        familyId, familyName: fd.name, familyTag: fd.tag,
        familySignLevel: signData?.level || null,
        familySignColor: signData?.color || null,
        familySignImageURL: fd.signImageURL || null,
    });

    await postSystemMessage(familyId, lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
    
    return { status: 'joined' };
};

/**
 * Leave the current family.
 */
var leaveFamily = async ({ family, currentUID, currentUserData, lang }) => {
    if (!family?.id || !currentUID) return;
    var role = getFamilyRole(family, currentUID);
    if (role === 'owner' && (family.members || []).length > 1) throw new Error('Assign another leader first');

    if ((family.members || []).length <= 1) {
        await familiesCollection.doc(family.id).delete();
    } else {
        var updRoles = { ...family.memberRoles }; delete updRoles[currentUID];
        var updDons = { ...family.memberDonations }; delete updDons[currentUID];
        await familiesCollection.doc(family.id).update({
            members: firebase.firestore.FieldValue.arrayRemove(currentUID),
            memberRoles: updRoles, memberDonations: updDons,
        });
        await postSystemMessage(family.id, lang === 'ar' ? `👋 ${currentUserData?.displayName} غادر العائلة` : `👋 ${currentUserData?.displayName} left the family`);
    }

    await usersCollection.doc(currentUID).update({
        familyId: null, familyName: null, familyTag: null,
        familySignLevel: null, familySignColor: null, familySignImageURL: null,
    });
};

/**
 * Atomic deletion of family (Owner only).
 */
var deleteFamily = async ({ family, currentUID }) => {
    if (!family?.id || getFamilyRole(family, currentUID) !== 'owner') throw new Error('Unauthorized');
    var memberIds = family.members || [];
    var batch = db.batch();
    memberIds.forEach(uid => {
        batch.update(usersCollection.doc(uid), {
            familyId: null, familyName: null, familyTag: null,
            familySignLevel: null, familySignColor: null, familySignImageURL: null,
        });
    });
    await batch.commit();
    await familiesCollection.doc(family.id).delete();
};

/**
 * Logic for member donations.
 */
var handleDonate = async ({ family, amount, currentUID, currentUserData, lang }) => {
    if (!amount || amount <= 0 || !family?.id) return;
    var don = family.memberDonations?.[currentUID] || { weekly:0, total:0, weeklyIntel:0, totalIntel:0 };

    // ft3 = "Donate to Clan" task — target:1 means "did at least one donation"
    var ft3Key = `ft3_${currentUID}`;
    var ft3Prog = family.taskProgress?.[ft3Key] || { current:0, claimed:false };

    var familyUpdates = {
        treasury: firebase.firestore.FieldValue.increment(amount),
        activeness: firebase.firestore.FieldValue.increment(amount),
        weeklyActiveness: firebase.firestore.FieldValue.increment(amount),
        [`memberDonations.${currentUID}.weekly`]: (don.weekly || 0) + amount,
        [`memberDonations.${currentUID}.total`]: (don.total || 0) + amount,
        [`memberDonations.${currentUID}.weeklyIntel`]: (don.weeklyIntel || 0) + amount,
        [`memberDonations.${currentUID}.totalIntel`]: (don.totalIntel || 0) + amount,
        lastActivity: TS(),
    };
    // Mark donate task progress (target = 1, so first donation completes it)
    if (!ft3Prog.claimed) {
        familyUpdates[`taskProgress.${ft3Key}.current`] = 1;
    }

    await familiesCollection.doc(family.id).update(familyUpdates);
    await usersCollection.doc(currentUID).update({
        currency: firebase.firestore.FieldValue.increment(-amount),
    });

    await familiesCollection.doc(family.id).collection('messages').add({
        senderId: currentUID,
        senderName: currentUserData?.displayName || 'Member',
        senderPhoto: currentUserData?.photoURL || null,
        type: 'donation',
        amount,
        text: lang === 'ar' ? `💰 ${currentUserData?.displayName} تبرع بـ ${amount} إنتل 🧠` : `💰 ${currentUserData?.displayName} donated ${amount} Intel 🧠`,
        timestamp: TS(),
    });
    try {
        await postNews(family.id, 'donation',
            lang === 'ar'
                ? `${currentUserData?.displayName || 'عضو'} تبرع بـ ${amount} إنتل`
                : `${currentUserData?.displayName || 'Member'} donated ${amount} Intel`,
            amount,
            { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
        );
    } catch (e) {
        console.warn('FamilyService.handleDonate: postNews failed (donation still applied)', e);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📰 NEWS & SYSTEM MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

var postNews = async (familyId, type, text, amount = 0, actor) => {
    if (!familyId) return;
    var coll = window.newsLogCollection;
    if (!coll) {
        console.warn('FamilyService.postNews: newsLogCollection missing (define in 01-config.js)');
        return;
    }
    try {
        var doc = {
            familyId,
            type,
            text,
            amount: amount || 0,
            timestamp: TS(),
        };
        if (actor && typeof actor === 'object') {
            if (actor.uid != null) doc.actorUID = actor.uid;
            if (actor.name) doc.actorName = actor.name;
            if (actor.photo) doc.actorPhoto = actor.photo;
        }
        await coll.add(doc);
    } catch (e) {
        console.error('FamilyService.postNews:', e);
    }
};

var postSystemMessage = async (familyId, text) => {
    if (!familyId) return;
    try {
        await familiesCollection.doc(familyId).collection('messages').add({
            senderId: 'system', senderName: 'SYSTEM',
            type: 'system', text, timestamp: TS(),
        });
    } catch (e) {
        console.error('FamilyService.postSystemMessage:', e);
    }
};

/**
 * Kicks a member from the family.
 */
var kickMember = async ({ family, targetUID, currentUID, lang }) => {
    if (!family?.id || targetUID === family.createdBy) return;
    
    // Authorization check
    var myRole = getFamilyRole(family, currentUID);
    if (!['owner', 'admin'].includes(myRole)) throw new Error('Unauthorized');
    if (myRole === 'admin' && getFamilyRole(family, targetUID) === 'admin') throw new Error('Admins cannot kick admins');

    var updRoles = { ...family.memberRoles }; delete updRoles[targetUID];
    var updDons = { ...family.memberDonations }; delete updDons[targetUID];
    
    await familiesCollection.doc(family.id).update({
        members: firebase.firestore.FieldValue.arrayRemove(targetUID),
        memberRoles: updRoles, memberDonations: updDons,
    });
    
    await usersCollection.doc(targetUID).update({
        familyId: null, familyName: null, familyTag: null,
        familySignLevel: null, familySignColor: null, familySignImageURL: null,
    });
    
    await postSystemMessage(family.id, lang === 'ar' ? `🚪 تم طرد أحد الأعضاء` : `🚪 A member was kicked`);
};

/**
 * Sets a member's role (Manager only).
 */
var setMemberRole = async ({ family, targetUID, newRole, currentUID, lang }) => {
    if (!family?.id || targetUID === family.createdBy) return;
    var myRole = getFamilyRole(family, currentUID);
    
    // Valid roles: admin, moderator, member
    if (newRole === 'admin' && myRole !== 'owner') return;
    if (newRole === 'member' && myRole !== 'owner' && getFamilyRole(family, targetUID) === 'admin') return;
    
    await familiesCollection.doc(family.id).update({
        [`memberRoles.${targetUID}`]: newRole,
    });
};

/**
 * Handles join requests (Accept/Reject).
 */
var handleJoinRequest = async ({ family, targetUID, accept, lang }) => {
    if (!family?.id) return;
    var updates = { joinRequests: firebase.firestore.FieldValue.arrayRemove(targetUID) };
    
    if (accept) {
        updates[`memberRoles.${targetUID}`] = 'member';
        updates[`memberDonations.${targetUID}`] = { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 };
        updates.members = firebase.firestore.FieldValue.arrayUnion(targetUID);
        
        await familiesCollection.doc(family.id).update(updates);
        
        // Update user document
        var signData = getFamilySignLevelData(family.lastWeekActiveness || 0);
        await usersCollection.doc(targetUID).update({
            familyId: family.id, familyName: family.name, familyTag: family.tag,
            familySignLevel: signData?.level || null,
            familySignColor: signData?.color || null,
            familySignImageURL: family.signImageURL || null,
        });
        
        await postSystemMessage(family.id, lang === 'ar' ? `🎉 عضو جديد انضم!` : `🎉 A new member joined!`);
    } else {
        await familiesCollection.doc(family.id).update(updates);
    }
};

/**
 * Updates family tag (Leader only).
 */
var saveTag = async ({ family, newTag, currentUID }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return;
    var clean = newTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (clean.length < 3) throw new Error('Tag too short');
    
    var tagCheck = await familiesCollection.where('tag', '==', clean).get();
    var alreadyMine = tagCheck.docs.some(d => d.id === family.id);
    if (!tagCheck.empty && !alreadyMine) throw new Error('Tag already taken');
    
    await familiesCollection.doc(family.id).update({ tag: clean });
    
    // Propagate to all members
    var batch = db.batch();
    (family.members || []).forEach(uid => {
        batch.update(usersCollection.doc(uid), { familyTag: clean });
    });
    await batch.commit();
};

/**
 * Updates general family info (Description, Announcement, Emblem, Photo).
 */
var saveInfo = async ({ family, updates, currentUID }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return;
    await familiesCollection.doc(family.id).update({
        ...updates,
        lastActivity: TS(),
    });
};

/**
 * Loads family list for discovery.
 */
var loadFamilies = async (limit = 30) => {
    var snap = await familiesCollection.orderBy('activeness', 'desc').limit(limit).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Searches for a family by tag.
 */
var searchFamilyByTag = async (tag) => {
    var clean = tag.trim().toUpperCase();
    var snap = await familiesCollection.where('tag', '==', clean).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─────────────────────────────────────────────────────────────────────────────
// 💬 CHAT & MESSAGING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a message to the family chat.
 */
var sendMessage = async ({ familyId, currentUID, currentUserData, text, image, type = 'text' }) => {
    if (!familyId || (!text?.trim() && !image)) return;
    
    var msgData = {
        senderId: currentUID,
        senderName: currentUserData?.displayName || 'Member',
        senderPhoto: currentUserData?.photoURL || null,
        type: type,
        text: text ? text.trim() : '',
        image: image || null,
        timestamp: TS(),
    };

    try {
        await familiesCollection.doc(familyId).collection('messages').add(msgData);
        await familiesCollection.doc(familyId).update({
            lastActivity: TS(),
            lastChat: {
                text: text ? text.trim().slice(0, 50) : (image ? '📷 [Image]' : ''),
                senderName: currentUserData?.displayName || 'Member',
                timestamp: TS(),
            }
        });
    } catch (e) {
        console.error('FamilyService.sendMessage:', e);
        throw e;
    }
};

/**
 * Handles image file upload and returns a data URL (resized).
 */
var handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) { reject('No file'); return; }
        var reader = new FileReader();
        reader.onload = (e) => {
            var img = new Image();
            img.onload = () => {
                var canvas = document.createElement('canvas');
                var { width, height } = img;
                var MAX_SIZE = 800;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Claims a daily milestone chest.
 */
var claimDailyMilestoneChest = async ({ family, currentUID, msIdx, ms, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    var today = new Date().toDateString();
    var dailyPtsKey = `dailyPts_${today}_${currentUID}`;
    var myDailyPoints = family[dailyPtsKey] || 0;
    if (myDailyPoints < ms.points) return;

    var claimKey = `dailyChestClaim_${today}_${currentUID}_${msIdx}`;
    if (family[claimKey]) return;

    try {
        await familiesCollection.doc(family.id).update({
            [claimKey]: true,
            lastActivity: TS(),
        });

        // Award rewards from ms.rewards array (currency = Intel, coins = Family Coins)
        var userRef = usersCollection.doc(currentUID);
        var userUpdates = {};
        var familyUpdates = {};
        var earnedParts = [];

        var rewards = ms.rewards || [];
        // Also support legacy ms.intel shorthand
        if (!rewards.length && ms.intel) rewards = [{ type: 'currency', amount: ms.intel }];

        rewards.forEach(r => {
            if (r.type === 'currency') {
                userUpdates.currency = firebase.firestore.FieldValue.increment(r.amount || 0);
                earnedParts.push(`+${r.amount} 🧠`);
            } else if (r.type === 'coins') {
                familyUpdates.familyCoins = firebase.firestore.FieldValue.increment(r.amount || 0);
                earnedParts.push(`+${r.amount} 🏅`);
            } else if (r.type === 'xp') {
                userUpdates.xp = firebase.firestore.FieldValue.increment(r.amount || 0);
                earnedParts.push(`+${r.amount} XP`);
            }
        });

        if (Object.keys(userUpdates).length > 0) await userRef.update(userUpdates);
        if (Object.keys(familyUpdates).length > 0) await familiesCollection.doc(family.id).update(familyUpdates);

        var earned = earnedParts.join(' • ');
        if (onNotification) onNotification(earned
            ? (lang === 'ar' ? `✅ الصندوق: ${earned}` : `✅ Chest: ${earned}`)
            : (lang === 'ar' ? '✅ تم استلام الصندوق!' : '✅ Chest claimed!'));
    } catch (e) {
        console.error('claimDailyMilestoneChest:', e);
    }
};

/**
 * Claims a family task.
 */
var claimTask = async ({ family, currentUID, task, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    var key = `${task.id}_${currentUID}`;
    var taskProgress = family.taskProgress || {};
    var prog = taskProgress[key] || { current: 0, claimed: false };
    if (prog.current < task.target || prog.claimed) return;

    try {
        var today = new Date().toDateString();
        var dailyPtsKey = `dailyPts_${today}_${currentUID}`;
        // task.points is the daily activity bar increment; fallback to intel value
        var pointsToAdd = task.points || task.reward?.intel || 0;
        
        var familyUpdates = {
            [`taskProgress.${key}.claimed`]: true,
            [dailyPtsKey]: firebase.firestore.FieldValue.increment(pointsToAdd),
            lastActivity: TS(),
        };
        // Tribe tasks: Intel reward → Family Coins (pool), not site currency. Coins field stacks too.
        var fcAdd = (task.reward?.coins || 0) + (task.reward?.intel || 0);
        if (fcAdd) {
            familyUpdates.familyCoins = firebase.firestore.FieldValue.increment(fcAdd);
        }
        await familiesCollection.doc(family.id).update(familyUpdates);

        var userRef = usersCollection.doc(currentUID);
        var userUpdates = {};
        if (task.reward?.xp) userUpdates.xp = firebase.firestore.FieldValue.increment(task.reward.xp);
        if (Object.keys(userUpdates).length > 0) await userRef.update(userUpdates);

        var earnedText = [];
        if (fcAdd) earnedText.push(`+${fcAdd} ${window.FAMILY_COINS_SYMBOL || FAMILY_COINS_SYMBOL || '🏅'}`);
        if (task.reward?.xp) earnedText.push(`+${task.reward.xp} XP`);
        var msg = earnedText.join(' • ');
        if (onNotification) onNotification(msg
            ? (lang === 'ar' ? `✅ ${msg}` : `✅ ${msg}`)
            : (lang === 'ar' ? '✅ تم استلام المكافأة!' : '✅ Reward claimed!'));

    } catch (e) {
        console.error('claimTask:', e);
    }
};

/**
 * Handles daily check-in task.
 */
var handleCheckIn = async ({ family, currentUID, currentUserData, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    var today = new Date().toDateString();
    var key = `ft1_${currentUID}`; // ft1 = Daily Check-in task
    var taskProgress = family.taskProgress || {};
    var prog = taskProgress[key] || { current: 0, claimed: false, lastCheckIn: '' };
    
    // Already checked in today?
    if (prog.lastCheckIn === today) {
        if (!prog.claimed) {
            // Already checked in but not yet claimed — notify they can collect
            if (onNotification) onNotification(lang === 'ar' ? '🎁 يمكنك اجمع المكافأة!' : '🎁 You can collect the reward!');
        } else {
            if (onNotification) onNotification(lang === 'ar' ? '✅ قمت بتسجيل الحضور اليوم' : '✅ Already checked in today');
        }
        return;
    }

    try {
        // Mark checked in — set current to 1 (target=1, so task is done)
        await familiesCollection.doc(family.id).update({
            [`taskProgress.${key}.current`]: 1,
            [`taskProgress.${key}.lastCheckIn`]: today,
            [`taskProgress.${key}.claimed`]: false, // reset daily claimed
            lastActivity: TS(),
        });

        if (onNotification) onNotification(lang === 'ar' ? '📅 تم تسجيل الحضور! اجمع المكافأة' : '📅 Checked in! Collect your reward');
    } catch (e) {
        console.error('handleCheckIn:', e);
    }
};

/**
 * Purchases an item from the family shop.
 */
var buyShopItem = async ({ currentUID, family, item, lang, onNotification }) => {
    if (!currentUID || !family?.id || !item) return;
    var coins = family.familyCoins || 0;
    var purchases = family.shopPurchases || {};

    if (coins < item.cost) {
        onNotification(lang==='ar' ? `❌ تحتاج ${item.cost}${FAMILY_COINS_SYMBOL}` : `❌ Need ${item.cost}${FAMILY_COINS_SYMBOL}`);
        return;
    }

    try {
        var key = `${currentUID}_${item.id}`;
        // Permanent items: block re-purchase. Time-limited items: allow re-purchase (renew)
        if (purchases[key] && !item.durationDays) {
            onNotification(lang==='ar' ? '✅ اشتريت هذا بالفعل' : '✅ Already purchased');
            return;
        }

        await familiesCollection.doc(family.id).update({
            familyCoins: firebase.firestore.FieldValue.increment(-item.cost),
            [`shopPurchases.${key}`]: true,
        });

        // Grant to user inventory based on type
        var inventoryKey = 
            item.type === 'badge' ? 'inventory.badges' : 
            item.type === 'title' ? 'inventory.titles' : 
            item.type === 'theme' ? 'inventory.themes' : 
            item.type === 'frame' ? 'inventory.frames' : 
            item.type === 'profileEffect' ? 'inventory.profileEffects' :
            item.type === 'gift' ? 'inventory.gifts' : null;

        if (inventoryKey) {
            var updatePayload = {
                [inventoryKey]: firebase.firestore.FieldValue.arrayUnion(item.id),
            };
            if (item.type === 'gift') {
                updatePayload[`inventory.giftCounts.${item.id}`] = firebase.firestore.FieldValue.increment(item.qty || 1);
            }
            // Only set expiry for time-limited items (durationDays is a positive number)
            if (item.durationDays && item.durationDays > 0 && item.type !== 'gift') {
                updatePayload[`inventory.expiry.${item.id}`] = Date.now() + (item.durationDays * 86400000);
            }
            await usersCollection.doc(currentUID).update(updatePayload);
        }

        var typeLabel = lang === 'ar'
            ? { badge:'بادج', title:'لقب', theme:'ثيم', frame:'إطار', profileEffect:'تأثير', gift:'هدية' }[item.type] || 'عنصر'
            : { badge:'Badge', title:'Title', theme:'Theme', frame:'Frame', profileEffect:'Effect', gift:'Gift' }[item.type] || 'Item';
        
        onNotification(`✅ ${item.emoji} ${lang==='ar'?`تم شراء ${typeLabel} — أُضيف للحقيبة!`:`${typeLabel} purchased — added to your bag!`}`);
    } catch(e) {
        console.error('FamilyService.buyShopItem:', e);
        onNotification(lang==='ar' ? '❌ خطأ في الشراء' : '❌ Purchase error');
    }
};

// Global access for legacy scripts
window.FamilyService = {
    getFamilyRole,
    canManageFamily,
    getFamilyLevelConfig,
    getFamilyLevelProgress,
    getFamilySignImage,
    getFamilySignLevelData,
    getFamilySignProgress,
    openAssignedChest,
    assignChestToMembers,
    handleGachaRoll,
    handleClaimChest,
    createFamily,
    joinFamily,
    leaveFamily,
    deleteFamily,
    handleDonate,
    postSystemMessage,
    postNews,
    kickMember,
    setMemberRole,
    handleJoinRequest,
    saveTag,
    saveInfo,
    loadFamilies,
    searchFamilyByTag,
    sendMessage,
    handleImageUpload,
    claimDailyMilestoneChest,
    claimTask,
    handleCheckIn,
    buyShopItem,
    useFamilyData
};
})();
