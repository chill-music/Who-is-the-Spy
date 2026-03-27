(function() {
    "use strict";

    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\FamilyUtils.js ---

(() => {
    var { renderMsgText } = {
        renderMsgText: (text, familyMembers, currentUserData, currentUID, openMiniProfile) => {
            if (!text) return '';
            
            // Simple mention regex: @Name
            var parts = text.split(/(@\w[\w\s]*?)(?=\s|$)/g);
            
            return parts.map((part, i) => {
                if (part.startsWith('@')) {
                    var mentionName = part.slice(1).trim().toLowerCase();
                    return React.createElement('span', {
                        key: i,
                        style: { 
                            color: '#00f2ff', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            textDecoration: 'underline dotted rgba(0,242,255,0.4)' 
                        },
                        onClick: (e) => {
                            e.stopPropagation();
                            var allMbrs = [...(familyMembers || [])];
                            if (currentUserData) {
                                allMbrs.push({ 
                                    id: currentUID, 
                                    displayName: currentUserData.displayName, 
                                    photoURL: currentUserData.photoURL 
                                });
                            }
                            var found = allMbrs.find(m => (m.displayName || '').toLowerCase() === mentionName);
                            if (found) {
                                openMiniProfile(found.id, { name: found.displayName, photo: found.photoURL });
                            }
                        }
                    }, part);
                }
                return part;
            });
        }
    };

    window.FamilyUtils = { renderMsgText };
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\FamilyService.js ---


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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\19-family.js ---

(function() {
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
    { level:1,  activeness:0,       name_en:'Rookie',     name_ar:'مبتدئة',   color:'#4ade80', maxMembers:20,  icon:'🌱', upgradeCost:0,     imageURL: null },
    { level:2,  activeness:8000,    name_en:'Rising',     name_ar:'صاعدة',    color:'#22d3ee', maxMembers:25,  icon:'⬆️', upgradeCost:1000,  imageURL: null },
    { level:3,  activeness:24000,   name_en:'Established',name_ar:'راسخة',    color:'#60a5fa', maxMembers:30,  icon:'🏕️', upgradeCost:2000,  imageURL: null },
    { level:4,  activeness:60000,   name_en:'Warriors',   name_ar:'محاربون',  color:'#fbbf24', maxMembers:40,  icon:'⚔️', upgradeCost:3000,  imageURL: null },
    { level:5,  activeness:120000,  name_en:'Guardians',  name_ar:'حراس',     color:'#f97316', maxMembers:50,  icon:'🛡️', upgradeCost:5000,  imageURL: null },
    { level:6,  activeness:280000,  name_en:'Elite',      name_ar:'نخبة',     color:'#a78bfa', maxMembers:60,  icon:'💎', upgradeCost:8000,  imageURL: null },
    { level:7,  activeness:500000,  name_en:'Champions',  name_ar:'أبطال',    color:'#ffd700', maxMembers:80,  icon:'🏆', upgradeCost:12000, imageURL: null },
    { level:8,  activeness:800000,  name_en:'Legends',    name_ar:'أساطير',   color:'#ef4444', maxMembers:100, icon:'🔥', upgradeCost:18000, imageURL: null },
    { level:9,  activeness:1200000, name_en:'Dynasty',    name_ar:'سلالة',    color:'#818cf8', maxMembers:120, icon:'👑', upgradeCost:25000, imageURL: null },
    { level:10, activeness:2000000, name_en:'GOAT',       name_ar:'الأعظم',   color:'#00d4ff', maxMembers:160, icon:'🌌', upgradeCost:0,     imageURL: null },
];

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
        return Math.min(99, Math.round((weeklyActiveness / first.threshold) * 100));
    }
    var next = FAMILY_SIGN_LEVELS.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
};

var getFamilyLevel = (activeness = 0) => {
    var cfg = FAMILY_LEVEL_CONFIG[0];
    for (var i = FAMILY_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (activeness >= FAMILY_LEVEL_CONFIG[i].activeness) { cfg = FAMILY_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
var getFamilyLevelProgress = (activeness = 0) => {
    var cur = getFamilyLevel(activeness);
    var next = FAMILY_LEVEL_CONFIG.find(c => c.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((activeness - cur.activeness) / (next.activeness - cur.activeness)) * 100));
};

// ════ UPDATED TASKS — Triple Currency: Intel + XP + Family Coins ════
var FAMILY_TASKS_CONFIG = [
    { id:'ft1', icon:'🎮', title_en:'Play 5 Games',        title_ar:'العب 5 ألعاب',        sub_en:'Play 5 spy games this week',      sub_ar:'العب 5 ألعاب جاسوس هذا الأسبوع', target:5,   daily:false, reward:{ intel:50,  xp:200,  coins:5,  icon:'🏅' } },
    { id:'ft2', icon:'🏆', title_en:'Win 3 Games',         title_ar:'اكسب 3 ألعاب',        sub_en:'Win 3 games to earn rewards',     sub_ar:'اكسب 3 ألعاب للحصول على المكافآت', target:3,  daily:false, reward:{ intel:100, xp:400,  coins:10, icon:'🏅' } },
    { id:'ft3', icon:'💰', title_en:'Donate 500 Intel',    title_ar:'تبرع بـ 500 إنتل',     sub_en:'Donate 500 Intel to family fund', sub_ar:'تبرع بـ 500 إنتل لصندوق العائلة', target:500, daily:false, reward:{ intel:80,  xp:300,  coins:8,  icon:'🏅' } },
    { id:'ft4', icon:'📅', title_en:'Daily Check-in',      title_ar:'تسجيل الحضور',         sub_en:'Check in to the family today',    sub_ar:'سجّل حضورك في العائلة اليوم',     target:1,   daily:true,  reward:{ intel:30,  xp:100,  coins:3,  icon:'🏅' } },
    { id:'ft5', icon:'🎁', title_en:'Send 3 Gifts',        title_ar:'أرسل 3 هدايا',         sub_en:'Send 3 gifts to any players',     sub_ar:'أرسل 3 هدايا لأي لاعبين',        target:3,   daily:false, reward:{ intel:120, xp:500,  coins:12, icon:'🏅' } },
    { id:'ft6', icon:'💬', title_en:'Chat (10 messages)',  title_ar:'الشات (10 رسائل)',      sub_en:'Send 10 messages in family chat', sub_ar:'أرسل 10 رسائل في شات العائلة',   target:10,  daily:false, reward:{ intel:60,  xp:250,  coins:6,  icon:'🏅' } },
    { id:'ft7', icon:'❤️', title_en:'Daily Like Mission',  title_ar:'مهمة الإعجاب اليومي',  sub_en:'Like 3 clanmates profiles/posts', sub_ar:'أعجب بـ 3 منشورات/بروفايلات أعضاء', target:3, daily:true,  reward:{ intel:40,  xp:150,  coins:4,  icon:'🏅' } },
];



// ══ GACHA CONFIG ══
// freeDailyCost: 0 (مجانية مرة يومياً)
// paidCostPerSpin: 200 Intel من رصيد اللاعب (مش من الخزينة)
// maxPaidSpinsDaily: 50 سحبة مدفوعة يومياً
//
// ── لتغيير صورة أي جائزة: غير imageURL من null لرابط صورة/GIF ──
// ── لتغيير نسبة الظهور: غير weight (الإجمالي ~10000) ──
var GACHA_CONFIG = {
    paidCostPerSpin: 200, // Intel من رصيد اللاعب لكل سحبة مدفوعة
    maxPaidSpinsDaily: 50,
    rewards: [
        // ── خاتم كاريزما — نادر جداً ──
        { weight:20,   type:'charisma', amount:20000, rarity:'legendary', icon:'💍', imageURL: null,
          label_en:'+20K Charisma Ring', label_ar:'خاتم كاريزما 20K',
          rateDisplay:'0.2%' },

        // ── إطارات عادية (تدعم GIF) ──
        // imageURL: ضع رابط صورة/GIF للإطار هنا
        { weight:300,  type:'frame', frameId:'frame_temp_1d',  duration:1,  rarity:'rare', icon:'🖼️', imageURL: null,
          label_en:'Frame 1 Day', label_ar:'إطار يوم واحد', rateDisplay:'3%' },
        { weight:200,  type:'frame', frameId:'frame_temp_3d',  duration:3,  rarity:'rare', icon:'🖼️', imageURL: null,
          label_en:'Frame 3 Days', label_ar:'إطار 3 أيام', rateDisplay:'2%' },
        { weight:150,  type:'frame', frameId:'frame_temp_7d',  duration:7,  rarity:'epic', icon:'🖼️', imageURL: null,
          label_en:'Frame 7 Days', label_ar:'إطار 7 أيام', rateDisplay:'1.5%' },

        // ── إطارات متحركة GIF ──
        // imageURL: ضع رابط GIF للإطار المتحرك هنا
        { weight:200,  type:'frame_anim', frameId:'frame_anim_1d', duration:1,  rarity:'rare', icon:'✨', imageURL: null,
          label_en:'Animated Frame 1 Day', label_ar:'إطار متحرك يوم', rateDisplay:'2%' },
        { weight:150,  type:'frame_anim', frameId:'frame_anim_3d', duration:3,  rarity:'epic', icon:'✨', imageURL: null,
          label_en:'Animated Frame 3 Days', label_ar:'إطار متحرك 3 أيام', rateDisplay:'1.5%' },
        { weight:100,  type:'frame_anim', frameId:'frame_anim_7d', duration:7,  rarity:'legendary', icon:'✨', imageURL: null,
          label_en:'Animated Frame 7 Days', label_ar:'إطار متحرك 7 أيام', rateDisplay:'1%' },

        // ── هدايا ──
        { weight:200,  type:'gift', giftId:'gift_racecar', qty:1, rarity:'epic', icon:'🏎️', imageURL: null,
          label_en:'Gift 2000 Intel', label_ar:'هدية 2000 إنتل', rateDisplay:'2%' },
        { weight:500,  type:'gift', giftId:'gift_crown',   qty:1, rarity:'rare', icon:'👑', imageURL: null,
          label_en:'Gift 520 Intel', label_ar:'هدية 520 إنتل', rateDisplay:'5%' },
        { weight:1000, type:'gift', giftId:'gift_cake',    qty:1, rarity:'uncommon', icon:'🎂', imageURL: null,
          label_en:'Gift 200 Intel', label_ar:'هدية 200 إنتل', rateDisplay:'10%' },
        { weight:1200, type:'gift', giftId:'gift_coffee',  qty:1, rarity:'uncommon', icon:'☕', imageURL: null,
          label_en:'Gift 120 Intel', label_ar:'هدية 120 إنتل', rateDisplay:'12%' },
        { weight:1500, type:'gift', giftId:'gift_teddy',   qty:1, rarity:'common', icon:'🧸', imageURL: null,
          label_en:'Gift 50 Intel', label_ar:'هدية 50 إنتل', rateDisplay:'15%' },

        // ── عملة الموقع Intel ──
        { weight:1500, type:'currency', amount:30,   rarity:'common',   icon:'🧠', imageURL: null,
          label_en:'+30 Intel', label_ar:'+30 إنتل', rateDisplay:'15%' },
        { weight:800,  type:'currency', amount:555,  rarity:'uncommon', icon:'🧠', imageURL: null,
          label_en:'+555 Intel', label_ar:'+555 إنتل', rateDisplay:'8%' },
        { weight:300,  type:'currency', amount:1688, rarity:'rare',     icon:'🧠', imageURL: null,
          label_en:'+1688 Intel', label_ar:'+1688 إنتل', rateDisplay:'3%' },

        // ── عملة القبيلة ──
        { weight:1000, type:'coins', amount:30,   rarity:'common',   icon:'🏅', imageURL: null,
          label_en:'+30 Coins', label_ar:'+30 عملة قبيلة', rateDisplay:'10%' },
        { weight:500,  type:'coins', amount:50,   rarity:'uncommon', icon:'🏅', imageURL: null,
          label_en:'+50 Coins', label_ar:'+50 عملة قبيلة', rateDisplay:'5%' },
        { weight:300,  type:'coins', amount:88,   rarity:'rare',     icon:'🏅', imageURL: null,
          label_en:'+88 Coins', label_ar:'+88 عملة قبيلة', rateDisplay:'3%' },
        { weight:100,  type:'coins', amount:1688, rarity:'legendary',icon:'🏅', imageURL: null,
          label_en:'+1688 Coins', label_ar:'+1688 عملة قبيلة', rateDisplay:'1%' },

        // ── صناديق القبيلة (نادرة جداً) ──
        { weight:33, type:'chest', chestType:'normal',   rarity:'legendary', icon:'📦', imageURL: null,
          label_en:'Normal Chest', label_ar:'صندوق عادي', rateDisplay:'0.33%' },
        { weight:33, type:'chest', chestType:'advanced', rarity:'legendary', icon:'🎁', imageURL: null,
          label_en:'Advanced Chest', label_ar:'صندوق متقدم', rateDisplay:'0.33%' },
        { weight:34, type:'chest', chestType:'rare',     rarity:'legendary', icon:'💠', imageURL: null,
          label_en:'Rare Chest', label_ar:'صندوق نادر', rateDisplay:'0.34%' },
    ],
};
window.GACHA_CONFIG = GACHA_CONFIG;
window.GACHA_CONFIG_BASIC = GACHA_CONFIG;
window.GACHA_CONFIG_PREMIUM = GACHA_CONFIG;


// ── ألوان نادرية الجاتشه ──
var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

// ── Role Config ──
var FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',  label_ar:'المالك', color:'#ffd700', bg:'rgba(255,215,0,0.18)',    border:'rgba(255,215,0,0.45)',    icon:'👑' },
    admin:     { label_en:'Admin',  label_ar:'أدمن',   color:'#ef4444', bg:'rgba(239,68,68,0.18)',    border:'rgba(239,68,68,0.45)',    icon:'🛡️' },
    moderator: { label_en:'Mod',    label_ar:'مشرف',   color:'#3b82f6', bg:'rgba(59,130,246,0.18)',   border:'rgba(59,130,246,0.45)',   icon:'🔰' },
    member:    { label_en:'Member', label_ar:'عضو',    color:'#6b7280', bg:'rgba(107,114,128,0.12)',  border:'rgba(107,114,128,0.3)',   icon:'👤' },
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
var FAMILY_EMBLEMS = ['🏠','⚔️','🛡️','🔥','🌊','⚡','🌙','🌟','💎','👑','🐉','🦁','🐺','🦅','🦋','🌹','🏹','🎯','🌈','💫'];

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
var FamilyRoleBadge = window.FamilyRoleBadge || (function() { return null; });

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
var FamilySignBadge = (props) => (window.FamilySignBadge ? <window.FamilySignBadge {...props} /> : null);

// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// ════════════════════════════════════════════════════════
var FriendsMomentsModal = window.FriendsMomentsModal || (function() { return null; });


// ════════════════════════════════════════════════════════
// 💬 FAMILY CHAT MODAL — Standalone chat accessible from Chat tab
// ════════════════════════════════════════════════════════
var CHAT_EMOJIS_FAM = ['😀','😂','❤️','👍','🔥','⭐','💎','🎁','🎉','😎','🤩','💪','✨','🙏','😊','👑','💖','🥳','🏆','🎯','😍','🤣','😭','😱','🫡','💯','🌹','🎮','🕵️','🏅'];

var FamilyChatModal = window.FamilyChatModal || (function() { return null; });


// ════════════════════════════════════════════════════════
// 🏆 FAMILY RANKING INLINE — Used in ranking tab
// ════════════════════════════════════════════════════════
var FamilyRankingInline = window.FamilyRankingInline || (function() { return null; });

// ════════════════════════════════════════════════════════
// 👤 FamilyMemberQuickCard — Lightweight inline popup
//    position:absolute داخل modal (مش fixed)
//    يظهر عند الضغط على اسم عضو في chat العائلة
// ════════════════════════════════════════════════════════
var FamilyMemberQuickCard = window.FamilyMemberQuickCard || (function() { return null; });

// ════════════════════════════════════════════════════════
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
        if (!show) { setLoadingFamily(false); return; }
        setLoadingFamily(true);
        // If viewFamilyId passed (from profile badge click), load that family in read-only mode
        var fid = viewFamilyId || currentUserData?.familyId;
        if (!fid) { setFamily(null); setLoadingFamily(false); return; }
        var unsub = familiesCollection.doc(fid).onSnapshot(snap => {
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
                if (!viewFamilyId && canManageFamily(d, currentUID)) {
                    var now = new Date();
                    var lastReset = d.lastWeeklyReset;
                    var lastResetDate = lastReset ? (lastReset.toDate ? lastReset.toDate() : new Date(lastReset.seconds * 1000)) : null;
                    var isSunday = now.getDay() === 0;
                    var needsReset = isSunday && (!lastResetDate || lastResetDate.toDateString() !== now.toDateString());
                    if (needsReset) {
                        // Save last week's activeness and reset weekly counter
                        var newSignData = getFamilySignLevelData(d.weeklyActiveness || 0);
                        var updates = {
                            lastWeekActiveness: d.weeklyActiveness || 0,
                            weeklyActiveness: 0,
                            lastWeeklyReset: firebase.firestore.FieldValue.serverTimestamp(),
                        };
                        // Update all members' sign level based on last week
                        familiesCollection.doc(fid).update(updates).catch(() => {});
                        if (newSignData) {
                            for (var uid of (d.members || [])) {
                                usersCollection.doc(uid).update({
                                    familySignLevel: newSignData.level,
                                    familySignColor: newSignData.color,
                                    familySignImageURL: d.signImageURL || null,
                                }).catch(() => {});
                            }
                        } else {
                            // No sign earned — clear members' signs
                            for (var uid of (d.members || [])) {
                                usersCollection.doc(uid).update({
                                    familySignLevel: null,
                                    familySignColor: null,
                                    familySignImageURL: null,
                                }).catch(() => {});
                            }
                        }
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
        var unsub = familiesCollection.doc(family.id).collection('messages')
            .orderBy('timestamp', 'desc').limit(60)
            .onSnapshot(snap => {
                var msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setChatMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [family?.id, activeTab]);

    // ── Load family news log (real-time) — keep synced whenever family is open (not only on News tab) ──
    useEffect(() => {
        if (!family?.id) return;
        var nlColl = window.newsLogCollection;
        if (!nlColl) return;
        var unsub = nlColl
            .orderBy('timestamp', 'desc')
            .limit(80)
            .onSnapshot(snap => {
                setNewsLog(
                    snap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(item => item.familyId === family.id)
                        .slice(0, 30)
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
        if (!family?.members?.length) { setFamilyMembers([]); return; }
        var uids = family.members.slice(0, 30);
        var chunks = [];
        for (var i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            var members = [];
            results.forEach(snap => snap.docs.forEach(d => members.push({ id: d.id, ...d.data() })));
            setFamilyMembers(members);
        }).catch(() => {});
    }, [family?.members?.join(',')]);

    // ── news is loaded by the newsLogCollection listener above ──

    // ── Load join requester profiles ──
    useEffect(() => {
        var reqs = family?.joinRequests || [];
        if (!reqs.length || activeTab !== 'manage') { setJoinRequesterProfiles([]); return; }
        var chunks = [];
        for (var i = 0; i < reqs.length; i += 10) chunks.push(reqs.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            var ps = [];
            results.forEach(snap => snap.docs.forEach(d => ps.push({ id: d.id, ...d.data() })));
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
                createdAt: TS(),
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
                ...extra,
            });
        } catch (e) {}
    };

    var postSystemMessage = async (familyId, text) => {
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: 'system',
                senderName: 'SYSTEM',
                text, type: 'system',
                timestamp: TS(),
            });
        } catch (e) {}
    };

    // Update user's sign fields — uses lastWeekActiveness to determine sign level
    var syncUserFamilySign = async (familyId, familyData) => {
        try {
            // Use last week's activeness if available, otherwise current weekly
            var actToCheck = familyData.lastWeekActiveness !== undefined
                ? familyData.lastWeekActiveness
                : (familyData.weeklyActiveness || 0);
            var signD = getFamilySignLevelData(actToCheck);
            await usersCollection.doc(currentUID).update({
                familySignLevel: signD?.level || null,
                familySignColor: signD?.color || null,
                familySignImageURL: familyData.signImageURL || null,
            });
        } catch (e) {}
    };




    // ── حذف العائلة (المالك فقط) ──







    // ── Load all families for Find Family ──
    var loadAllFamilies = async () => {
        setLoadingAllFamilies(true);
        try {
            var snap = await familiesCollection.orderBy('activeness', 'desc').limit(30).get();
            setAllFamilies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) {}
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
                canvas.width = 120; canvas.height = 40;
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 120, 40);
                var scale = Math.min(120 / img.width, 40 / img.height);
                var dw = img.width * scale, dh = img.height * scale;
                ctx.drawImage(img, (120 - dw) / 2, (40 - dh) / 2, dw, dh);
                var base64 = canvas.toDataURL('image/png', 0.8);
                try {
                    await familiesCollection.doc(family.id).update({ signImageURL: base64 });
                    // Update all member user docs
                    for (var uid of (family.members || [])) {
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
        modal: { background:'linear-gradient(180deg,#0d0d1f,#08080f)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', width:'100%', maxWidth:'460px', height:'92vh', maxHeight:'800px', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.95)' },
        header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'rgba(0,0,0,0.3)', position:'relative' },
        tabBar: { display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.35)', flexShrink:0, overflowX:'auto', scrollbarWidth:'none' },
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
        input: { width:'100%', padding:'10px 13px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontSize:'13px', outline:'none', boxSizing:'border-box' },
        btn: { padding:'10px 18px', borderRadius:'10px', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer' },
        divider: { height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0' },
    };

    // هل المستخدم بيشوف قبيلة من الخارج (مش عضو فيها)؟
    var isMemberOfThisFamily = family ? (family.members || []).includes(currentUID) : false;
    var isExternalView = !!(viewFamilyId && (!currentUserData?.familyId || currentUserData?.familyId !== viewFamilyId) && !isMemberOfThisFamily);
    var isReadOnly = !isMemberOfThisFamily;

    var TABS = isReadOnly ? [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
    ] : [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
        { id:'tasks',    label_en:'Tasks',   label_ar:'مهام',     icon:'🎯' },
        { id:'shop',     label_en:'Shop',    label_ar:'المتجر',   icon:'🏅' },
        { id:'news',     label_en:'News',    label_ar:'أخبار',    icon:'📰' },
        { id:'manage',   label_en:'Manage',  label_ar:'إدارة',    icon:'⚙️' },
    ];

    var fLvl = family ? getFamilyLevel(family.activeness || 0) : null;
    var fProg = family ? getFamilyLevelProgress(family.activeness || 0) : 0;
    var myRole = family ? getFamilyRole(family, currentUID) : null;
    var canManage = family ? canManageFamily(family, currentUID) : false;
    var weeklyAct = family ? (family.weeklyActiveness || 0) : 0;
    // signData: based on lastWeekActiveness (last week's activity → this week's sign)
    // If lastWeekActiveness not set, use weeklyActiveness as fallback
    var SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    var lastWeekAct = family ? (family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : weeklyAct) : 0;
    var signData = (family ? getFamilySignLevelData(lastWeekAct) : null) || SIGN_FALLBACK;
    var signProg = family ? getFamilySignProgress(lastWeekAct) : 0;

    // ─────────────────────────────────────────────
    // TAB: PROFILE (redesigned to match reference image)
    // ─────────────────────────────────────────────
    var renderProfile = () => {
        var isReadOnly = !!viewFamilyId && viewFamilyId !== currentUserData?.familyId;
        if (window.FamilyProfile) return <window.FamilyProfile family={family} familyMembers={familyMembers} currentUID={currentUID} currentUserData={currentUserData} userData={userData} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} isReadOnly={isReadOnly} showDonatePanel={showDonatePanel} setShowDonatePanel={setShowDonatePanel} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };


    // ─────────────────────────────────────────────
    // TAB: MEMBERS
    // ─────────────────────────────────────────────
    var renderMembers = () => {
        if (window.FamilyMembers) return <window.FamilyMembers family={family} members={familyMembers} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: TASKS
    // ─────────────────────────────────────────────
    var renderTasks = () => {
        if (window.FamilyTasks) return <window.FamilyTasks family={family} currentUserData={currentUserData} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} setActiveTab={setActiveTab} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: FAMILY SHOP (Family Coins only)
    // ─────────────────────────────────────────────
    var renderShop = () => {
        if (window.FamilyShop) {
            return <window.FamilyShop family={family} currentUID={currentUID} currentUserData={currentUserData} lang={lang} onNotification={onNotification} S={S} />;
        }
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري تحميل المتجر...':'Loading Shop...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: RANKING (dedicated tab)
    // ─────────────────────────────────────────────
    var renderRankingTab = () => {
        if (window.FamilyRanking) return <window.FamilyRanking family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: NEWS
    // ─────────────────────────────────────────────
    var renderNews = () => {
        if (window.FamilyNews) return <window.FamilyNews family={family} newsLog={newsLog} currentUserData={currentUserData} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: MANAGE
    // ─────────────────────────────────────────────
    var renderManage = () => {
        if (window.FamilyManagement) return <window.FamilyManagement family={family} currentUID={currentUID} lang={lang} canManage={myRole === 'owner' || myRole === 'admin'} myRole={myRole} familyMembers={familyMembers} joinRequesterProfiles={joinRequesterProfiles} S={S} Z={Z} onNotification={onNotification} onUpdateFamily={() => {}} onLeaveFamily={() => {}} onDeleteFamily={() => {}} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };



    // ─────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────
    return (
        <>
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{zIndex: window.Z ? window.Z.MODAL_HIGH : 12000}}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>

                    {/* ── Top Header ── */}
                    <div style={S.header}>
                        {family ? (
                            <div style={{display:'flex', alignItems:'center', gap:'10px', flex:1, minWidth:0}}>
                                <div style={{width:'34px', height:'34px', borderRadius:'50%', border:`2px solid ${fLvl?.color}55`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>
                                    {family.photoURL ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (family.emblem||'🏠')}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
                                        {/* ── اسم القبيلة clickable يفتح الصفحة الرئيسية ── */}
                                        <span
                                            onClick={() => setActiveTab('profile')}
                                            style={{fontSize:'14px', fontWeight:900, color:'white', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px', cursor:'pointer', transition:'color 0.2s'}}
                                            onMouseEnter={e => e.currentTarget.style.color='#00f2ff'}
                                            onMouseLeave={e => e.currentTarget.style.color='white'}
                                            title={lang==='ar'?'انتقل للصفحة الرئيسية':'Go to family home'}
                                        >
                                            {family.name}
                                        </span>
                                        {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280', display:'flex', alignItems:'center', gap:'6px'}}>
                                        <span>{fLvl?.icon} {lang==='ar'?`المستوى ${fLvl?.level}`:`Lv.${fLvl?.level}`}</span>
                                        <span>·</span>
                                        <span>👥 {family.members?.length||0} {lang==='ar'?'عضو':'members'}</span>
                                        {myRole && myRole !== 'owner' && <FamilyRoleBadge role={myRole} lang={lang} small />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', alignItems:'center', gap:'8px', flex:1}}>
                                <span style={{fontSize:'20px'}}>🏠</span>
                                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>{lang==='ar'?'العائلة':'Family'}</span>
                            </div>
                        )}

                        <div style={{display:'flex', alignItems:'center', gap:'6px', flexShrink:0}}>
                            {/* Close */}
                            <button onClick={onClose} style={{width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                        </div>
                    </div>

                    {/* ── Tab Bar (always visible) ── */}
                    {family && (
                        <div style={S.tabBar}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                    flex:1, padding:'10px 4px 8px', fontSize:'10px', fontWeight:activeTab===tab.id?800:500,
                                    color:activeTab===tab.id?'#00f2ff':'#6b7280', background:'transparent', border:'none',
                                    borderBottom:`2px solid ${activeTab===tab.id?'#00f2ff':'transparent'}`,
                                    cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
                                    minWidth:'50px', position:'relative',
                                }}>
                                    <div style={{fontSize:'14px', marginBottom:'1px'}}>{tab.icon}</div>
                                    <div>{lang==='ar'?tab.label_ar:tab.label_en}</div>
                                    {tab.id==='manage'&&(family?.joinRequests?.length>0)&&<span style={{position:'absolute', top:'4px', right:'6px', fontSize:'8px', background:'#f97316', color:'white', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>{family.joinRequests.length}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Body ── */}
                    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                        {loadingFamily ? (
                            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>⏳</div>
                        ) : !family ? (
                            window.FamilySearch ? <window.FamilySearch view={view} setView={setView} currentUID={currentUID} currentUserData={currentUserData} lang={lang} onNotification={onNotification} onClose={onClose} S={S} /> : <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>
                        ) : (
                            <>
                                {activeTab==='profile'  && renderProfile()}
                                {activeTab==='members'  && renderMembers()}

                                {activeTab==='tasks'    && renderTasks()}
                                {activeTab==='shop'     && renderShop()}
                                {activeTab==='ranking'  && renderRankingTab()}
                                {activeTab==='news'     && renderNews()}
                                {activeTab==='manage'   && renderManage()}
                            </>
                        )}
                    </div>

                    {/* ── Bottom Nav Bar (visible when family exists, profile tab) ── */}
                    {family && activeTab === 'profile' && (
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 16px',background:'rgba(255,255,255,0.04)',borderTop:'1px solid #e5e7eb',flexShrink:0}}>
                            {/* Chat */}
                            <button onClick={()=> onOpenChat ? onOpenChat() : setShowChatModal(true)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(107,114,128,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>💬</div>
                                <span style={{fontSize:'9px',color:'#6b7280',fontWeight:600}}>{lang==='ar'?'شات':'Chat'}</span>
                            </button>
                            {/* Room button removed as requested */}
                            {/* Gacha */}
                            <button onClick={()=>setShowGachaModal(true)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(167,139,250,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🎰</div>
                                <span style={{fontSize:'9px',color:'#a78bfa',fontWeight:600}}>{lang==='ar'?'جاتشه':'Gacha'}</span>
                            </button>
                            {/* Plus - donate shortcut */}
                            {!(!!viewFamilyId && viewFamilyId !== currentUserData?.familyId) && (
                                <button onClick={()=>setShowDonatePanel(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:900,color:'#10b981'}}>+</div>
                                    <span style={{fontSize:'9px',color:'#10b981',fontWeight:600}}>{lang==='ar'?'تبرع':'Donate'}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PortalModal>

        {/* ── GACHA MODAL ── */}
        {showGachaModal && window.FamilyGacha && (
            <window.FamilyGacha 
                show={true}
                family={family} 
                currentUID={currentUID} 
                currentUserData={currentUserData}
                lang={lang} 
                onNotification={onNotification} 
                onClose={() => setShowGachaModal(false)}
                S={S}
            />
        )}
        </>
    );
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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyShared.js ---

/**
 * FamilyShared.js - Shared UI components for the Family System.
 */
var { FAMILY_ROLE_CONFIG, FAMILY_SIGN_LEVELS } = window.FamilyConstants || {};

// Global access for legacy scripts
window.FamilyShared = {
    FamilyRoleBadge: window.FamilyRoleBadge,
    // FamilySignBadge is now globally available via FamilySignBadge.js
};


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyRoleBadge.js ---

var { FAMILY_ROLE_CONFIG } = window.FamilyConstants || {};

var FamilyRoleBadge = ({ role, lang, small = false }) => {
    var cfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'2px',
            padding: small ? '1px 5px' : '2px 7px',
            borderRadius:'5px', fontSize: small ? '9px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
            letterSpacing:'0.3px', whiteSpace:'nowrap', flexShrink:0,
        }}>
            {cfg.icon} {lang === 'ar' ? cfg.label_ar : cfg.label_en}
        </span>
    );
};


window.FamilyRoleBadge = FamilyRoleBadge;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilySignBadge.js ---

var { FAMILY_SIGN_LEVELS, getFamilySignImage } = window.FamilyConstants || {};

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
var FamilySignBadge = ({ level, size = 40, lang, tag, color, small, signLevel, imageURL }) => {
    // Correct call to getFamilySignImage(activeness=0, level=signLevel)
    var imgSrc = imageURL || (typeof getFamilySignImage === 'function' ? getFamilySignImage(0, signLevel) : null);
    
    var signLevelData = typeof FAMILY_SIGN_LEVELS !== 'undefined'
        ? FAMILY_SIGN_LEVELS.find(s => s.level === signLevel)
        : null;
    var hasGlow = signLevelData?.hasGlow || signLevel >= 4;
    var glowIntensity = signLevel === 5 ? 'dd' : signLevel === 4 ? 'cc' : '99';
    var glowMid       = signLevel === 5 ? '88' : signLevel === 4 ? '77' : '55';
    var glowFar       = signLevel === 5 ? '44' : '33';
    var displayTag = tag || 'FAM';

    // لو في صورة: تظهر مع التاج مكتوب فوقها
    if (imgSrc) {
        // Badge is purely the image size; tag text floats centered over the image
        var imgW = small
            ? 36 + (displayTag.length * 3)   // small: 3→45  4→48  5→51
            : 54 + (displayTag.length * 5);   // normal: 3→69 4→74  5→79
        var imgH = Math.round(imgW * 0.55);
        var fontSize = small
            ? (displayTag.length <= 3 ? 8 : displayTag.length === 4 ? 7 : 6)
            : (displayTag.length <= 3 ? 11 : displayTag.length === 4 ? 10 : 9);

        return (
            <span style={{
                position:'relative',
                display:'inline-block',
                flexShrink:0,
                width:`${imgW}px`,
                height:`${imgH}px`,
                filter: hasGlow
                    ? `drop-shadow(0 0 6px ${color}${glowIntensity}) drop-shadow(0 0 14px ${color}${glowMid}) drop-shadow(0 0 22px ${color}${glowFar})`
                    : 'none',
                transition:'all 0.2s',
            }}>
                {/* Background image fills the container */}
                <img
                    src={imgSrc}
                    alt=""
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'contain',
                        display:'block',
                    }}
                />
                {/* Tag text: absolutely centered, small pill */}
                <span style={{
                    position:'absolute',
                    left:'50%', top:'50%',
                    transform:'translate(-50%, -50%)',
                    zIndex:1,
                    fontSize:`${fontSize}px`,
                    fontWeight:900,
                    fontStyle:'italic',
                    letterSpacing:'1.5px',
                    color:'#fff',
                    textShadow:`
                        0 0 6px rgba(0,0,0,0.9),
                        0 0 12px rgba(0,0,0,0.7),
                        1px 1px 0 rgba(0,0,0,0.8),
                        -1px -1px 0 rgba(0,0,0,0.8),
                        1px -1px 0 rgba(0,0,0,0.8),
                        -1px 1px 0 rgba(0,0,0,0.8),
                        0 0 16px ${color}cc
                    `,
                    userSelect:'none',
                    lineHeight:1,
                    whiteSpace:'nowrap',
                    pointerEvents:'none',
                }}>
                    {displayTag}
                </span>
            </span>
        );
    }

    // لو ما في صورة: badge نصي عادي
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'3px',
            padding: small ? '1px 5px' : '2px 8px',
            borderRadius:'5px', fontSize: small ? '8px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:`${color}20`, border:`1px solid ${color}55`,
            color:color, letterSpacing:'0.5px', whiteSpace:'nowrap', flexShrink:0,
            boxShadow: hasGlow ? `0 0 10px ${color}55, 0 0 20px ${color}33` : 'none',
        }}>
            {displayTag}
        </span>
    );
};


window.FamilySignBadge = FamilySignBadge;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyProfile.js ---

/**
 * FamilyProfile.js - Redesigned family profile tab.
 * Sections: Header → Activeness → Weekly Activeness → Treasury → Announcement
 */
var FamilyProfile = ({
    family,
    familyMembers,
    currentUID,
    currentUserData,
    userData,
    lang,
    onUpdateInfo,
    isReadOnly,
    showDonatePanel,
    setShowDonatePanel
}) => {
    if (!family) return null;
    if (!familyMembers) familyMembers = family.members || [];
    if (isReadOnly === undefined) isReadOnly = false;

    var photoFileRef = React.useRef(null);
    var onNotification = window.showNotification || (() => {});

    // ── Activeness modal state ──
    var [showActModal, setShowActModal] = React.useState(false);
    var [buyingAct, setBuyingAct] = React.useState(false);
    var [upgradingClan, setUpgradingClan] = React.useState(false);
    var [weeklyChestBusy, setWeeklyChestBusy] = React.useState(false);

    var fmtFamilyNum = window.fmtFamilyNum || ((n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)));
    var { 
        getFamilyLevelConfig = () => ({}), 
        getFamilyRole = () => 'member', 
        getFamilySignLevelData = () => ({ level: 0 }),
        FAMILY_LEVEL_CONFIG = []
    } = window.FamilyConstants || {};

    var fLvl = getFamilyLevelConfig(family.level || 1);
    var myRole = getFamilyRole(family, currentUID);
    var canManage = myRole === 'owner' || myRole === 'admin';

    // ── Sign data: based on lastWeekActiveness ──
    var SIGN_FALLBACK = { level: 1, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'العائلة', name_en: 'Family', threshold: 0 };
    var lastWeekAct = family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : (family.weeklyActiveness || 0);
    var signData = getFamilySignLevelData(lastWeekAct) || SIGN_FALLBACK;

    // ── Activeness progress ──
    var totalActiveness = family.activeness || 0;
    var weeklyActiveness = family.weeklyActiveness || 0;
    var ORIGINAL_MILESTONES = window.ACTIVENESS_MILESTONES || [];
    // Create sorted version for display while keeping original indices for functionality
    var WEEKLY_MILESTONES = ORIGINAL_MILESTONES.map((ms, originalIdx) => ({ ...ms, originalIdx })).sort((a, b) => a.threshold - b.threshold);

    // Level progress
    var nextLevelCfg = FAMILY_LEVEL_CONFIG.find(c => c.level === (fLvl.level + 1));
    var lvlProgress = nextLevelCfg
        ? Math.min(100, Math.round(((totalActiveness - fLvl.activeness) / (nextLevelCfg.activeness - fLvl.activeness)) * 100))
        : 100;
    var nextLevelAt = nextLevelCfg ? nextLevelCfg.activeness : null;

    // ── Next weekly reset (Sunday) ──
    var getNextSunday = () => {
        var now = new Date();
        var daysUntilSun = (7 - now.getDay()) % 7 || 7;
        var next = new Date(now);
        next.setDate(now.getDate() + daysUntilSun);
        next.setHours(0, 0, 0, 0);
        var diff = next - now;
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        if (d > 0) return lang === 'ar' ? `${d} يوم ${h} ساعة` : `${d}d ${h}h`;
        return lang === 'ar' ? `${h} ساعة` : `${h}h`;
    };

    // Treasury chests claimed
    var treasuryInv = family.treasuryInventory || [];
    var familyTreasury = family.treasury || 0;
    var myIntel = (currentUserData && currentUserData.currency) || 0;

    // ── Photo upload ──
    var handlePhotoUpload = async (e) => {
        var file = e.target.files[0];
        if (!file) return;
        try {
            var dataUrl = await window.FamilyService.handleImageUpload(file);
            await window.FamilyService.saveInfo({ family, updates: { photoURL: dataUrl }, currentUID });
            if (window.FamilyService?.postNews) {
                await window.FamilyService.postNews(
                    family.id,
                    'settings_change',
                    lang === 'ar'
                        ? `${currentUserData?.displayName || 'المسؤول'} عدّل صورة القبيلة 🖼️`
                        : `${currentUserData?.displayName || 'Admin'} updated the family photo 🖼️`,
                    0,
                    { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
                );
            }
            onNotification(lang === 'ar' ? '✅ تم تحديث الصورة' : '✅ Photo updated');
        } catch (err) { console.error(err); }
    };

    // ── Buy activeness gift ──
    var ACTIVENESS_GIFTS = [
        { label_ar: 'هدية نشاط صغيرة',  label_en: 'Small Activity Gift',  activeness: 50,   cost: 500,   icon: '🎁',  color: '#4ade80' },
        { label_ar: 'هدية نشاط متوسطة', label_en: 'Medium Activity Gift', activeness: 500,  cost: 5000,  icon: '🎀',  color: '#60a5fa' },
        { label_ar: 'هدية نشاط كبيرة',  label_en: 'Large Activity Gift',  activeness: 5000, cost: 50000, icon: '🏆',  color: '#fbbf24' },
    ];

    var handleBuyActiveness = async (gift) => {
        if (buyingAct) return;
        if (myIntel < gift.cost) {
            onNotification(lang === 'ar' ? '❌ إنتل غير كافٍ' : '❌ Not enough Intel');
            return;
        }
        setBuyingAct(true);
        try {
            var { firebase, familiesCollection, usersCollection } = window;
            var uid = currentUID;
            var fid = family.id;
            await usersCollection.doc(uid).update({
                currency: firebase.firestore.FieldValue.increment(-gift.cost),
            });
            await familiesCollection.doc(fid).update({
                activeness: firebase.firestore.FieldValue.increment(gift.activeness),
                weeklyActiveness: firebase.firestore.FieldValue.increment(gift.activeness),
            });
            onNotification(`✅ +${gift.activeness} ${lang === 'ar' ? 'نشاط!' : 'Activeness!'}`);
            setShowActModal(false);
        } catch (e) {
            console.error('Buy activeness error:', e);
            onNotification(lang === 'ar' ? '❌ خطأ في الشراء' : '❌ Purchase failed');
        }
        setBuyingAct(false);
    };

    var upgradeClan = async () => {
        if (!family?.id || !canManage || !nextLevelCfg || upgradingClan) return;
        if (totalActiveness < nextLevelCfg.activeness) {
            onNotification(lang === 'ar' ? `❌ تحتاج ${fmtFamilyNum(nextLevelCfg.activeness)} نشاطاً` : `❌ Need ${fmtFamilyNum(nextLevelCfg.activeness)} activeness`);
            return;
        }
        if ((nextLevelCfg.upgradeCost || 0) > 0 && familyTreasury < nextLevelCfg.upgradeCost) {
            onNotification(lang === 'ar' ? '❌ خزينة القبيلة غير كافية' : '❌ Clan treasury too low');
            return;
        }
        setUpgradingClan(true);
        try {
            var firebase = window.firebase;
            var familiesCollection = window.familiesCollection;
            var newLevel = (fLvl.level || 1) + 1;
            await familiesCollection.doc(family.id).update({
                treasury: firebase.firestore.FieldValue.increment(-(nextLevelCfg.upgradeCost || 0)),
                level: newLevel,
            });
            if (window.FamilyService?.postNews) {
                try {
                    await window.FamilyService.postNews(family.id, 'level_up',
                        lang === 'ar'
                            ? `⬆️ ترقية للمستوى ${newLevel}: ${nextLevelCfg.name_ar}`
                            : `⬆️ Leveled up to ${newLevel}: ${nextLevelCfg.name_en}`,
                        0,
                        { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
                    );
                } catch (e) {
                    console.warn('postNews after level up failed', e);
                }
            }
            onNotification(`🆙 ${lang === 'ar' ? 'مبروك! ارتفع مستوى القبيلة!' : 'Congrats! Clan leveled up!'}`);
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ فشل الترقية' : '❌ Upgrade failed');
        }
        setUpgradingClan(false);
    };

    // ── Chest status ──
    var getChestStatus = (chestType) => {
        var myItems = treasuryInv.filter(inv => inv.chestType === chestType);
        var myAssigned = myItems.find(inv => (inv.assignedTo || []).includes(currentUID));
        if (!myAssigned) return 'none';
        var claimedCount = (myAssigned.claimedBy || {})[currentUID] || 0;
        var maxClaims = myAssigned.maxClaimsPerMember || 1;
        if (claimedCount >= maxClaims) return 'claimed';
        return 'unclaimed';
    };

    var onWeeklyChestClick = async (ms, milestoneIdx) => {
        if (weeklyChestBusy || isReadOnly) return;
        setWeeklyChestBusy(true);
        try {
            var claimedList = family.activenessClaimedMilestones || [];
            var originalIdx = ms.originalIdx !== undefined ? ms.originalIdx : milestoneIdx;
            var milestoneClaimed = claimedList.includes(originalIdx);
            var reachedTotal = weeklyActiveness >= ms.threshold;

            if (canManage && reachedTotal && !milestoneClaimed) {
                var res = await window.FamilyService.handleClaimChest({
                    family, chestIdx: originalIdx, currentUID, lang, onNotification,
                });
                if (res) {
                    onNotification(lang === 'ar' ? `🎁 ${res.cfg.name_ar} في الخزينة` : `🎁 ${res.cfg.name_en} added to treasury`);
                }
                return;
            }

            var inv = family.treasuryInventory || [];
            for (var i = 0; i < inv.length; i++) {
                if (inv[i].chestType !== ms.chestType) continue;
                var assigned = inv[i].assignedTo || [];
                if (!assigned.includes(currentUID)) continue;
                var claimedN = (inv[i].claimedBy || {})[currentUID] || 0;
                if (claimedN >= (inv[i].maxClaimsPerMember || 1)) continue;
                var openRes = await window.FamilyService.openAssignedChest({
                    family,
                    currentUID,
                    currentUserData,
                    inventoryIdx: i,
                    lang,
                    onNotification,
                });
                if (openRes && openRes.receiptText) {
                    onNotification(openRes.receiptText);
                } else if (openRes) {
                    onNotification(lang === 'ar' ? '✅ تم الاستلام' : '✅ Claimed');
                }
                return;
            }

            if (reachedTotal && milestoneClaimed) {
                onNotification(lang === 'ar' ? '📦 الصندوق في الخزينة — اطلب من المسؤول التوزيع' : '📦 Chest is in treasury — ask admin to assign');
            } else if (!reachedTotal) {
                onNotification(lang === 'ar' ? '⏳ لم يصل النشاط الأسبوعي للحد بعد' : '⏳ Weekly activeness not at threshold yet');
            }
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ حدث خطأ' : '❌ Something went wrong');
        } finally {
            setWeeklyChestBusy(false);
        }
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#0d0d1f' }}>

            {/* ══ HEADER ══ */}
            <div style={{
                background: family.photoURL
                    ? `linear-gradient(rgba(0,0,0,0.5),rgba(13,13,31,0.95)),url(${family.photoURL}) center/cover no-repeat`
                    : 'linear-gradient(160deg,#1a1040 0%,#0a0a2e 100%)',
                padding: '16px 16px 14px',
                position: 'relative',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Photo */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '62px', height: '62px', borderRadius: '16px', border: `3px solid ${fLvl.color}`, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: `0 0 18px ${fLvl.color}66` }}>
                            {family.photoURL ? <img src={family.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (family.emblem || '🏠')}
                        </div>
                        {canManage && <button onClick={() => photoFileRef.current?.click()} style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,242,255,0.9)', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>📷</button>}
                        <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Sign */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', fontStyle: 'italic', fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{family.name}</span>
                            {signData.level >= 1 && window.FamilySignBadge && <window.FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={signData.imageURL} />}
                        </div>
                        {/* Level badge + Member count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${fLvl.color}22`, border: `1px solid ${fLvl.color}66`, borderRadius: '20px', padding: '2px 8px' }}>
                                {fLvl.imageURL
                                    ? <img src={fLvl.imageURL} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                                    : <span style={{ fontSize: '12px' }}>{fLvl.icon}</span>}
                                <span style={{ color: fLvl.color, fontSize: '10px', fontWeight: 900 }}>LV.{fLvl.level} {lang === 'ar' ? fLvl.name_ar : fLvl.name_en}</span>
                            </div>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)' }}>👥 {family.members?.length || 0}/{fLvl.maxMembers}</span>
                        </div>
                        {/* ID + Weekly Rank */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>ID · {family.id?.slice(-6).toUpperCase()}</span>
                            {family.weeklyRank && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '20px', padding: '1px 7px', fontSize: '9px', fontWeight: 800, color: '#ffd700' }}>
                                    🏅 #{family.weeklyRank}
                                </div>
                            )}
                            {myRole && window.FamilyRoleBadge && <window.FamilyRoleBadge role={myRole} lang={lang} small />}
                        </div>
                    </div>
                </div>

                {/* Level progress bar */}
                {nextLevelCfg && (
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '9px', color: fLvl.color, fontWeight: 700 }}>{lang === 'ar' ? 'تقدم المستوى' : 'Level Progress'}</span>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{totalActiveness.toLocaleString()} / {nextLevelCfg.activeness.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${lvlProgress}%`, background: `linear-gradient(90deg,${fLvl.color},${fLvl.color}bb)`, borderRadius: '10px', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ══ ACTIVENESS SECTION ══ */}
            <div style={{ margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚡</span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lang === 'ar' ? 'النشاط الكلي' : 'Activeness'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{totalActiveness.toLocaleString()}</span>
                        {nextLevelCfg && <span style={{ fontSize: '9px', color: '#6b7280' }}>/ {nextLevelCfg.activeness.toLocaleString()}</span>}
                        {!isReadOnly && (
                            <button
                                onClick={() => setShowActModal(true)}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, lineHeight: 1, flexShrink: 0 }}
                            >+</button>
                        )}
                    </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden', marginBottom: nextLevelCfg ? '12px' : 0 }}>
                    <div style={{ height: '100%', width: `${nextLevelCfg ? lvlProgress : 100}%`, background: 'linear-gradient(90deg,#00f2ff,#7000ff)', borderRadius: '10px', transition: 'width 0.6s ease', boxShadow: '0 0 8px rgba(0,242,255,0.5)' }} />
                </div>

                {/* Next level requirements (inside Activeness card) */}
                {nextLevelCfg && (
                    <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '6px' }}>
                            🔒 {lang === 'ar' ? 'متطلبات المستوى التالي' : 'Next Level Requirements'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>🔥 {lang === 'ar' ? 'النشاط الكلي' : 'Total Activeness'}</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: totalActiveness >= nextLevelCfg.activeness ? '#10b981' : '#f97316' }}>
                                {fmtFamilyNum(totalActiveness)} / {fmtFamilyNum(nextLevelCfg.activeness)} {totalActiveness >= nextLevelCfg.activeness ? '✅' : ''}
                            </span>
                        </div>
                        {nextLevelCfg.upgradeCost > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', color: '#6b7280' }}>🏅 {lang === 'ar' ? 'خزينة القبيلة' : 'Treasury'}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: familyTreasury >= nextLevelCfg.upgradeCost ? '#10b981' : '#f97316' }}>
                                    {fmtFamilyNum(familyTreasury)} / {fmtFamilyNum(nextLevelCfg.upgradeCost)} {familyTreasury >= nextLevelCfg.upgradeCost ? '✅' : ''}
                                </span>
                            </div>
                        )}
                        {canManage && totalActiveness >= nextLevelCfg.activeness && familyTreasury >= (nextLevelCfg.upgradeCost || 0) && (
                            <button type="button" onClick={upgradeClan} disabled={upgradingClan} style={{ width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', color: 'white', fontSize: '12px', fontWeight: 900, cursor: upgradingClan ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: upgradingClan ? 0.7 : 1 }}>
                                🆙 {lang === 'ar' ? 'ترقية القبيلة' : 'Upgrade Clan'} → {lang === 'ar' ? nextLevelCfg.name_ar : nextLevelCfg.name_en}
                            </button>
                        )}
                        {canManage && (totalActiveness < nextLevelCfg.activeness || familyTreasury < (nextLevelCfg.upgradeCost || 0)) && (
                            <div style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center', fontStyle: 'italic' }}>
                                {lang === 'ar' ? 'أكمل متطلبات النشاط والخزينة للترقية' : 'Meet activeness & treasury to upgrade'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ══ WEEKLY ACTIVENESS + TOTAL MILESTONE CHESTS ══ */}
            <div style={{ flexShrink: 0, margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px', display: 'flex', alignItems: 'center', gap: '14px', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {/* Left Side: Small Box Info */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, minWidth: '90px' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        {lang === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activeness'}
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' }}>i</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '4px 0', letterSpacing: '-0.5px' }}>
                        {weeklyActiveness >= 1000 ? (weeklyActiveness / 1000).toFixed(1) + 'K' : weeklyActiveness}
                    </div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', opacity: 0.8 }}>
                        {lang === 'ar' ? 'إعادة يوم الأحد' : 'Refresh on Sun'}
                    </div>
                </div>

                {/* Right Side: Chests Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {WEEKLY_MILESTONES.map((ms, idx) => {
                        var reached = weeklyActiveness >= ms.threshold;
                        var status = getChestStatus(ms.chestType);
                        var isClaimed = status === 'claimed';
                        var isUnclaimed = status === 'unclaimed';
                        var milestoneDone = (family.activenessClaimedMilestones || []).includes(ms.originalIdx);
                        var showDone = milestoneDone || isClaimed;
                        
                        // Scale chests: first 3 are smaller, last 2 are bigger
                        var chestSize = idx < 3 ? 32 : 44;
                        
                        return (
                            <button
                                type="button"
                                key={ms.chestType + '-' + idx}
                                onClick={() => onWeeklyChestClick(ms, idx)}
                                disabled={weeklyChestBusy}
                                style={{
                                    background: 'transparent', border: 'none', padding: 0,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                    cursor: weeklyChestBusy ? 'wait' : 'pointer',
                                    filter: !reached ? 'grayscale(0.8) opacity(0.5)' : 'none',
                                    position: 'relative',
                                    flexShrink: 0
                                }}
                            >
                                <div style={{ position: 'relative', width: `${chestSize}px`, height: `${chestSize}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {ms.imageURL ? <img src={ms.imageURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{fontSize: `${chestSize - 4}px`}}>{ms.icon}</span>}
                                    
                                    {showDone && (
                                        <div style={{ position: 'absolute', bottom: idx < 3 ? '-2px' : '0px', right: idx < 3 ? '-2px' : '0px', width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', border: '1.5px solid #1a1a2e' }}>✓</div>
                                    )}
                                    {isUnclaimed && !showDone && reached && (
                                        <div style={{ position: 'absolute', bottom: '-2px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#111', border: '1.5px solid #1a1a2e' }}>!</div>
                                    )}
                                </div>
                                
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>
                                    {ms.threshold >= 1000 ? (ms.threshold / 1000).toFixed(1) + 'K' : ms.threshold}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ══ TREASURY ══ */}
            <div style={{ margin: '10px 12px 0' }}>
                {window.FamilyTreasury
                    ? <window.FamilyTreasury
                        family={family}
                        familyMembers={familyMembers}
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                        canManage={canManage}
                        onNotification={onNotification}
                        isReadOnly={isReadOnly}
                        showDonatePanel={showDonatePanel}
                        setShowDonatePanel={setShowDonatePanel}
                      />
                    : null}
            </div>

            {/* ══ ANNOUNCEMENT ══ */}
            {family.announcement && (
                <div style={{ margin: '10px 12px', background: 'linear-gradient(135deg,rgba(255,165,0,0.12),rgba(255,80,0,0.08))', border: '1px solid rgba(255,165,0,0.35)', borderRadius: '14px', padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius: '14px 0 0 14px' }} />
                    <div style={{ paddingLeft: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' }}>
                            📢 {lang === 'ar' ? 'إعلان' : 'Announcement'}
                            {family.announcementBy && <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 400, marginRight: '4px' }}> · {lang === 'ar' ? 'بواسطة:' : 'By:'} {family.announcementBy}</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 600 }}>
                            {family.announcement}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ JOIN (read-only) ══ */}
            {isReadOnly && !currentUserData?.familyId && (
                <div style={{ margin: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏠</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{lang === 'ar' ? 'انضم لهذه العائلة' : 'Join this Family'}</div>
                    <button style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                        ➕ {lang === 'ar' ? 'انضم الآن' : 'Join Now'}
                    </button>
                </div>
            )}

            <div style={{ height: '12px' }} />

            {/* ══ ACTIVENESS PURCHASE MODAL ══ */}
            {showActModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={() => setShowActModal(false)}>
                    <div style={{ width: '100%', maxWidth: '480px', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f2ff' }}>⚡ {lang === 'ar' ? 'شراء نشاط' : 'Buy Activeness'}</div>
                            <button onClick={() => setShowActModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                        </div>
                        {/* Balance */}
                        <div style={{ textAlign: 'center', padding: '10px 16px 4px', fontSize: '11px', color: '#9ca3af' }}>
                            {lang === 'ar' ? 'رصيدك (إنتل):' : 'Your Intel:'} <span style={{ color: '#00f2ff', fontWeight: 800 }}>{myIntel.toLocaleString()} 🧠</span>
                        </div>
                        {/* Gift options */}
                        <div style={{ padding: '12px 14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {ACTIVENESS_GIFTS.map((gift, i) => {
                                var canAfford = myIntel >= gift.cost;
                                return (
                                    <button
                                        key={i}
                                        disabled={!canAfford || buyingAct}
                                        onClick={() => handleBuyActiveness(gift)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '14px', background: canAfford ? `${gift.color}14` : 'rgba(255,255,255,0.03)', border: `1px solid ${canAfford ? gift.color + '44' : 'rgba(255,255,255,0.06)'}`, cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.45, textAlign: 'left', width: '100%', boxSizing: 'border-box', transition: 'all 0.15s' }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${gift.color}20`, border: `1px solid ${gift.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{gift.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 800, color: gift.color }}>{lang === 'ar' ? gift.label_ar : gift.label_en}</div>
                                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>⚡ +{gift.activeness.toLocaleString()} {lang === 'ar' ? 'نشاط' : 'Activeness'}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 800, color: gift.color, flexShrink: 0 }}>{gift.cost.toLocaleString()} 🧠</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.FamilyProfile = FamilyProfile;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyMembers.js ---

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
    var { fmtFamilyNum = n => n } = window;
    var { FamilyRoleBadge } = window.FamilyShared || {};
    var FamilySignBadge = window.FamilySignBadge;
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
    }).filter(m => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

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

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {/* Search + member count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '5px 10px' }}>
                        <span style={{ fontSize: '13px' }}>🔍</span>
                        <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '11px' }}
                            placeholder={lang === 'ar' ? 'بحث...' : 'Search...'} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, flexShrink: 0 }}>
                        {family.members?.length || 0}/{getFamilyLevelConfig(family.level || 1).maxMembers}
                    </span>
                </div>
                {/* Tab buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setDonationSort('intel')} style={{ flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'intel' ? 'rgba(0,242,255,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'intel' ? 'rgba(0,242,255,0.1)' : 'transparent', color: donationSort === 'intel' ? '#00f2ff' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'intel' ? 800 : 500, cursor: 'pointer' }}>
                        🧠 {lang === 'ar' ? 'التبرعات' : 'Donations'}
                    </button>
                    <button onClick={() => setDonationSort('activity')} style={{ flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'activity' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'activity' ? 'rgba(251,191,36,0.1)' : 'transparent', color: donationSort === 'activity' ? '#fbbf24' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'activity' ? 800 : 500, cursor: 'pointer' }}>
                        ⚡ {lang === 'ar' ? 'الاكتيفيتي' : 'Activity'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }} onClick={() => gearMenuUid && setGearMenuUid(null)}>
                {sorted.map((m, i) => {
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

                    return (
                        <div key={m.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isTop3 ? topColors[i] : 'transparent' }}>
                            {/* Rank */}
                            <div style={{ width: '20px', textAlign: 'center', fontSize: '11px', color: i === 0 ? '#ffd700' : i === 1 ? '#9ca3af' : i === 2 ? '#fb923c' : '#4b5563', fontWeight: 800, marginRight: '8px', flexShrink: 0 }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                            </div>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0, marginRight: '10px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${rCfg.color}66`, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                                    {m.photoURL ? <img src={m.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>😎</div>}
                                </div>
                                {role === 'owner' && <div style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '10px' }}>👑</div>}
                            </div>
                            {/* Name + role */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{m.displayName}</span>
                                    {signData.level > 0 && FamilySignBadge && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                </div>
                                {FamilyRoleBadge && <FamilyRoleBadge role={role} lang={lang} small />}
                            </div>
                            {/* Stats */}
                            <div style={{ textAlign: 'right', flexShrink: 0, marginRight: showGear ? '6px' : '0' }}>
                                {donationSort === 'intel' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>W</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00f2ff' }}>{fmtFamilyNum(weeklyDon)}🧠</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>T</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>{fmtFamilyNum(totalDon)}🧠</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>W</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>⚡{fmtFamilyNum(weeklyAct)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>T</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa' }}>∑{fmtFamilyNum(totalAct)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Gear button */}
                            {showGear && (
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); setGearMenuUid(isGearOpen ? null : m.id); }}
                                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                    >⚙️</button>
                                    {/* Gear dropdown */}
                                    {isGearOpen && (
                                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '32px', right: 0, zIndex: 50, background: '#0f1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '6px', minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                                            {/* Role options */}
                                            {canSetAdmin && targetRole !== 'admin' && (
                                                <button onClick={() => handleSetRole(m.id, 'admin')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🛡️ {lang === 'ar' ? 'ترقية لأدمن' : 'Set Admin'}
                                                </button>
                                            )}
                                            {canSetMod && targetRole !== 'moderator' && (
                                                <button onClick={() => handleSetRole(m.id, 'moderator')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🔰 {lang === 'ar' ? 'ترقية لمشرف' : 'Set Mod'}
                                                </button>
                                            )}
                                            {(targetRole === 'admin' || targetRole === 'moderator') && canSetAdmin && (
                                                <button onClick={() => handleSetRole(m.id, 'member')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,114,128,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    👤 {lang === 'ar' ? 'تخفيض لعضو' : 'Set Member'}
                                                </button>
                                            )}
                                            {/* Divider */}
                                            {canKick && <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                                            {canKick && (
                                                <button onClick={() => handleKick(m.id)} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🚫 {lang === 'ar' ? 'طرد من القبيلة' : 'Kick'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {sorted.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#4b5563', fontSize: '12px' }}>{lang === 'ar' ? 'لا أعضاء' : 'No members found'}</div>}
            </div>
        </div>
    );
};

window.FamilyMembers = FamilyMembers;



    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyTasks.js ---

/**
 * FamilyTasks.js — Complete redesign. All 7 tasks functional.
 *
 * Tasks (from FamilyConstants.FAMILY_TASKS_CONFIG):
 *  ft1 – Daily Check-in    (daily, target:1, points:20) — handled by check-in button
 *  ft2 – Daily Like        (daily, target:1, points:10) — "Go" → members tab
 *  ft3 – Donate to Clan    (weekly, target:1, points:20) — auto-tracked by handleDonate
 *  ft4 – Send 3 Gifts      (weekly, target:3, points:20) — "Go" → gifts UI
 *  ft5 – Send 10 Gifts     (weekly, target:10, points:30) — "Go" → gifts UI
 *  ft6 – Play 5 Games      (weekly, target:5, points:20) — "Go" → game lobby
 *  ft7 – Win 3 Games       (weekly, target:3, points:30) — "Go" → game lobby
 *
 * Daily activity bar: 20 / 60 / 100 pts → chest at each milestone.
 */

var { useState, useEffect } = React;

var FamilyTasks = ({
    family,
    currentUserData,
    currentUID,
    lang,
    onNotification,
    S,
    setActiveTab,   // for "Go" actions to switch tab
    onOpenChat,     // optional
}) => {
    var { FAMILY_TASKS_CONFIG = [], DAILY_TASKS_MILESTONES = [] } = window.FamilyConstants || {};
    if (!family) return null;

    var [previewMs, setPreviewMs] = useState(null);

    var isAr = lang === 'ar';
    var today = new Date().toDateString();
    var taskProgress = family.taskProgress || {};
    var dailyPtsKey  = `dailyPts_${today}_${currentUID}`;
    var myDailyPts   = family[dailyPtsKey] || 0;
    var maxPts       = DAILY_TASKS_MILESTONES[DAILY_TASKS_MILESTONES.length - 1]?.points || 100;
    var barPct       = Math.min(100, (myDailyPts / maxPts) * 100);

    // ── Claim Daily Chesem ──────────────────────────
    var handleClaimDailyChest = async (msIdx, ms) => {
        await window.FamilyService.claimDailyMilestoneChest({
            family, currentUID, msIdx, ms, lang, onNotification,
        });
    };

    // ── Claim Task Reward ────────────────────────────
    var claimTask = async (task) => {
        await window.FamilyService.claimTask({
            family, currentUID, task, lang, onNotification,
        });
    };

    // ── Daily Check-in ───────────────────────────────
    var handleCheckIn = async () => {
        await window.FamilyService.handleCheckIn({
            family, currentUID, currentUserData, lang, onNotification,
        });
    };

    // ── Action button handler ────────────────────────
    var handleAction = (action) => {
        if (!action) return;
        if (action === 'like' && setActiveTab)   { setActiveTab('members'); return; }
        if (action === 'donate' && setActiveTab) { setActiveTab('profile'); return; }
        // gifts / games — navigate to home where user can trigger the action
        if (setActiveTab) setActiveTab('profile');
    };

    // ── Helpers ─────────────────────────────────────
    var getTaskState = (task) => {
        var key  = `${task.id}_${currentUID}`;
        var prog = taskProgress[key] || { current: 0, claimed: false };

        // Daily tasks: reset check if last check-in was not today
        if (task.daily) {
            var lastCI = prog.lastCheckIn;
            if (lastCI !== today) {
                prog = { current: 0, claimed: false };
            }
        }

        var pct     = Math.min(100, Math.round((prog.current / task.target) * 100));
        var isDone  = prog.current >= task.target;
        var claimed = prog.claimed;
        return { prog, pct, isDone, claimed };
    };

    // ── Styles ───────────────────────────────────────
    var cardBase = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '12px',
        transition: 'border-color 0.3s',
    };

    return (
        <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>

            {/* ── Balance Header ── */}
            <div style={{ display:'flex', gap:'8px' }}>
                {[
                    { label_ar:'صندوق القبيلة', label_en:'Family Fund',   icon:'🛡️', val: window.fmtFamilyNum(family.treasury||0),       color:'#10b981' },
                    { label_ar:'عملات القبيلة', label_en:'Family Coins',  icon:'🏅', val: window.fmtFamilyNum(family.familyCoins||0),     color:'#fbbf24' },
                    { label_ar:'رصيدك',          label_en:'My Intel',      icon:'🧠', val: window.fmtFamilyNum(currentUserData?.currency||0), color:'#00f2ff' },
                ].map((item, i) => (
                    <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'8px 6px', textAlign:'center' }}>
                        <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'2px' }}>{item.icon} {isAr ? item.label_ar : item.label_en}</div>
                        <div style={{ fontSize:'14px', fontWeight:900, color:item.color }}>{item.val}</div>
                    </div>
                ))}
            </div>

            {/* ── Daily Activity Bar ── */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'14px 14px 28px', position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <span style={{ fontSize:'12px', fontWeight:800, color:'#e2e8f0' }}>
                        {isAr ? '🌟 النشاط اليومي' : '🌟 Daily Activity'}
                    </span>
                    <span style={{ fontSize:'13px', fontWeight:900, color:'#f97316' }}>
                        {myDailyPts} <span style={{ fontSize:'10px', color:'#6b7280' }}>/ {maxPts} pts</span>
                    </span>
                </div>

                {/* Bar track */}
                <div style={{ position:'relative', height:'8px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', margin:'0 12px' }}>
                    {/* Filled */}
                    <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${barPct}%`, background:'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius:'4px', transition:'width 0.5s ease-out', boxShadow: barPct > 0 ? '0 0 8px rgba(249,115,22,0.5)' : 'none' }} />

                    {/* Milestone nodes */}
                    {DAILY_TASKS_MILESTONES.map((ms, idx) => {
                        var nodePct   = (ms.points / maxPts) * 100;
                        var isReached = myDailyPts >= ms.points;
                        var claimKey  = `dailyChestClaim_${today}_${currentUID}_${idx}`;
                        var isClaimed = family[claimKey] === true;
                        return (
                            <div key={idx}
                                onClick={() => setPreviewMs({ ms, idx, isReached, isClaimed })}
                                title={`${ms.points} pts`}
                                style={{ position:'absolute', top:'50%', left:`${nodePct}%`, transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', cursor: 'pointer' }}>
                                <div style={{
                                    width:'30px', height:'30px', borderRadius:'50%',
                                    background: isClaimed ? '#10b981' : isReached ? '#f97316' : '#1f2937',
                                    border: `2px solid ${isClaimed ? '#10b981' : isReached ? '#fb923c' : '#374151'}`,
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                                    boxShadow: isReached && !isClaimed ? '0 0 14px rgba(249,115,22,0.9)' : 'none',
                                    transition:'all 0.3s',
                                }}>
                                    {isClaimed ? '✅' : '🎁'}
                                </div>
                                <div style={{ position:'absolute', top:'34px', fontSize:'9px', fontWeight:800, color: isReached ? '#f97316' : '#6b7280', whiteSpace:'nowrap' }}>
                                    {ms.points}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop:'16px', textAlign:'center', fontSize:'9px', color:'#4b5563' }}>
                    {isAr ? '💡 اضغط الصندوق لمعاينة المحتوى والاستلام' : '💡 Tap a chest to preview & claim'}
                </div>
            </div>

            {previewMs && (
                <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }} onClick={() => setPreviewMs(null)}>
                    <div style={{ background:'#111827', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)', maxWidth:'340px', width:'100%', padding:'16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize:'14px', fontWeight:800, color:'#f97316', marginBottom:'8px' }}>🎁 {isAr ? 'محتوى الصندوق' : 'Chest contents'}</div>
                        <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'12px' }}>
                            {isAr ? `عند ${previewMs.ms.points} نقطة يومية` : `At ${previewMs.ms.points} daily points`}
                            {previewMs.isClaimed ? (isAr ? ' · تم الاستلام' : ' · Claimed') : !previewMs.isReached ? (isAr ? ' · لم تصل بعد' : ' · Not reached yet') : ''}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            {(previewMs.ms.rewards || []).map((r, ri) => (
                                <div key={ri} style={{ fontSize:'12px', color:'#e5e7eb', display:'flex', justifyContent:'space-between' }}>
                                    <span>{r.type === 'currency' ? '🧠 Intel' : r.type === 'coins' ? '🏅 ' + (isAr ? 'عملة قبيلة' : 'Family Coins') : r.type}</span>
                                    <span style={{ color:'#fbbf24', fontWeight:700 }}>+{r.amount}</span>
                                </div>
                            ))}
                        </div>
                        {previewMs.isReached && !previewMs.isClaimed && (
                            <button type="button" onClick={async () => { await handleClaimDailyChest(previewMs.idx, previewMs.ms); setPreviewMs(null); }} style={{ marginTop:'12px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'#fff', fontWeight:800, cursor:'pointer' }}>
                                {isAr ? 'استلام' : 'Claim'}
                            </button>
                        )}
                        <button type="button" onClick={() => setPreviewMs(null)} style={{ marginTop:'10px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.08)', color:'#fff', fontWeight:800, cursor:'pointer' }}>{isAr ? 'إغلاق' : 'Close'}</button>
                    </div>
                </div>
            )}

            {/* ── Info strip ── */}
            <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center', padding:'5px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)' }}>
                {isAr ? '📌 جميع المهام يومية — تتجدد كل يوم في منتصف الليل' : '📌 All tasks are daily — reset every midnight'}
            </div>

            {/* ── SECTION: Daily Tasks ── */}
            <div style={{ fontSize:'10px', fontWeight:800, color:'#f97316', textTransform:'uppercase', letterSpacing:'0.5px', paddingTop:'4px' }}>
                📅 {isAr ? 'مهام اليوم' : 'Today\'s Tasks'}
            </div>

            {FAMILY_TASKS_CONFIG.map(task => {
                var { prog, pct, isDone, claimed } = getTaskState(task);
                var isCheckIn = task.id === 'ft1';
                var checkedInToday = isCheckIn && taskProgress[`ft1_${currentUID}`]?.lastCheckIn === today;

                return (
                    <TaskCard key={task.id}
                        task={task} prog={prog} pct={pct} isDone={isDone} claimed={claimed}
                        isAr={isAr} cardBase={cardBase}
                        onClaim={() => claimTask(task)}
                        onCheckIn={isCheckIn ? handleCheckIn : null}
                        onAction={!isCheckIn ? () => handleAction(task.action) : null}
                        checkedInToday={checkedInToday}
                    />
                );
            })}

            <div style={{ height:'12px' }} />
        </div>
    );
};

// ── Sub-component: Task Card ──────────────────────────────────────────────────
var TaskCard = ({ task, prog, pct, isDone, claimed, isAr, cardBase, onClaim, onCheckIn, onAction, checkedInToday }) => {
    var borderColor = claimed ? 'rgba(16,185,129,0.35)'
                    : isDone  ? 'rgba(0,242,255,0.3)'
                    : 'rgba(255,255,255,0.07)';
    var bgGrad = claimed ? 'linear-gradient(120deg,rgba(16,185,129,0.06),rgba(0,0,0,0))'
               : isDone  ? 'linear-gradient(120deg,rgba(0,242,255,0.06),rgba(0,0,0,0))'
               : 'rgba(255,255,255,0.02)';
    var iconBg = claimed ? 'rgba(16,185,129,0.15)'
               : isDone  ? 'rgba(0,242,255,0.12)'
               : 'rgba(255,255,255,0.05)';

    return (
        <div style={{ ...cardBase, border:`1px solid ${borderColor}`, background:bgGrad }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                {/* Icon */}
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:iconBg, border:`1px solid ${borderColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                    {claimed ? '✅' : isDone ? '🎯' : task.icon}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px', flexWrap:'wrap' }}>
                        <div style={{ fontSize:'12px', fontWeight:800, color: claimed ? '#10b981' : isDone ? '#00f2ff' : '#e2e8f0' }}>
                            {isAr ? task.title_ar : task.title_en}
                        </div>
                        {task.daily && (
                            <span style={{ fontSize:'8px', fontWeight:800, color:'#f97316', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', padding:'1px 5px', borderRadius:'6px' }}>
                                {isAr ? 'يومي' : 'DAILY'}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize:'10px', color:'#6b7280', marginBottom:'6px' }}>
                        {isAr ? task.sub_ar : task.sub_en}
                    </div>

                    {/* Progress bar */}
                    {!claimed && (
                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px' }}>
                                <span>{prog.current} / {task.target}</span>
                                <span>{pct}%</span>
                            </div>
                            <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                                <div style={{ height:'100%', borderRadius:'2px', width:`${pct}%`, background: isDone ? 'linear-gradient(90deg,#00f2ff,#7000ff)' : 'linear-gradient(90deg,#374151,#6b7280)', transition:'width 0.5s' }} />
                            </div>
                        </div>
                    )}
                    {claimed && (
                        <div style={{ fontSize:'10px', color:'#10b981', fontWeight:700 }}>
                            ✅ {isAr ? 'تم الاستلام' : 'Claimed'}
                        </div>
                    )}
                </div>

                {/* Right column: rewards + action */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0, minWidth:'64px' }}>
                    <div style={{ fontSize:'10px', fontWeight:800, color:'#fbbf24' }}>+{((task.reward.coins || 0) + (task.reward.intel || 0))} 🏅</div>
                    <div style={{ fontSize:'9px', fontWeight:700, color:'#6b7280' }}>+{task.reward.xp} XP</div>
                    <div style={{ fontSize:'8px', color:'#374151' }}>+{task.points}pt</div>

                    {/* Action buttons */}
                    {onCheckIn ? (
                        /* Check-in task: shows check-in button if not yet done, claim if done */
                        claimed ? (
                            <div style={{ fontSize:'9px', color:'#10b981', fontWeight:700, textAlign:'center' }}>✅</div>
                        ) : checkedInToday ? (
                            <button onClick={onClaim} style={{ padding:'5px 9px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'white' }}>
                                {isAr ? 'اجمع' : 'Claim'}
                            </button>
                        ) : (
                            <button onClick={onCheckIn} style={{ padding:'5px 9px', borderRadius:'8px', border:'1px solid rgba(249,115,22,0.4)', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'rgba(249,115,22,0.15)', color:'#f97316' }}>
                                {isAr ? 'تسجيل' : 'Check-in'}
                            </button>
                        )
                    ) : claimed ? (
                        <div style={{ fontSize:'9px', color:'#10b981', fontWeight:700, textAlign:'center' }}>✅</div>
                    ) : isDone ? (
                        <button onClick={onClaim} style={{ padding:'5px 9px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'white' }}>
                            {isAr ? 'اجمع' : 'Claim'}
                        </button>
                    ) : (
                        onAction && (
                            <button onClick={onAction} style={{ padding:'5px 9px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', fontSize:'10px', fontWeight:700, background:'rgba(255,255,255,0.05)', color:'#9ca3af' }}>
                                {isAr ? 'ابدأ ←' : 'Go →'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

window.FamilyTasks = FamilyTasks;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyShop.js ---

/**
 * FamilyShop Component
 * Displays the family shop with items purchasable via Family Coins.
 * Supports: badge | title | frame | profileEffect (time-limited, re-purchasable)
 */
var FamilyShop = ({
    family,
    currentUID,
    currentUserData,
    lang,
    onNotification,
    S
}) => {
    if (!family) return null;

    var [activeType, setActiveType] = React.useState('all');
    var [buying, setBuying] = React.useState(null);

    var coins = family.familyCoins || 0;
    var purchases = family.shopPurchases || {};
    var userInventory = currentUserData?.inventory || {};

    var RARITY_COLORS = {
        uncommon:  '#34d399',
        rare:      '#60a5fa',
        epic:      '#a78bfa',
        legendary: '#ffd700',
    };
    var coinsSymbol = (typeof window.FAMILY_COINS_SYMBOL !== 'undefined')
        ? window.FAMILY_COINS_SYMBOL
        : '🏅';

    // ── Ownership logic ───────────────────────────────────────────────────────
    var isOwned = (item) => {
        var key = `${currentUID}_${item.id}`;
        if (!purchases[key]) return false;
        // Time-limited items: check if still active in inventory.expiry
        if (item.durationDays) {
            var expiry = userInventory?.expiry?.[item.id];
            if (!expiry) return false;           // never granted or already wiped
            return Date.now() < expiry;          // still active
        }
        return true; // permanent
    };

    var getExpiryLabel = (item) => {
        if (!item.durationDays) return null;
        var expiry = userInventory?.expiry?.[item.id];
        if (!expiry || Date.now() >= expiry) return null;
        var daysLeft = Math.ceil((expiry - Date.now()) / 86400000);
        return lang === 'ar' ? `${daysLeft}د متبقية` : `${daysLeft}d left`;
    };

    var handleBuy = async (item) => {
        if (buying) return;
        setBuying(item.id);
        try {
            if (window.FamilyService?.buyShopItem) {
                await window.FamilyService.buyShopItem({
                    currentUID,
                    family,
                    item,
                    lang,
                    onNotification,
                });
            }
        } finally {
            setBuying(null);
        }
    };

    // ── Type tabs ─────────────────────────────────────────────────────────────
    var shopItems = (typeof window.FAMILY_SHOP_ITEMS !== 'undefined')
        ? window.FAMILY_SHOP_ITEMS
        : [];

    var TABS = [
        { key: 'all',           label_en: 'All',     label_ar: 'الكل',    icon: '🏪' },
        { key: 'badge',         label_en: 'Badges',  label_ar: 'شارات',   icon: '🎖️' },
        { key: 'title',         label_en: 'Titles',  label_ar: 'ألقاب',   icon: '🏷️' },
        { key: 'frame',         label_en: 'Frames',  label_ar: 'إطارات',  icon: '🖼️' },
        { key: 'profileEffect', label_en: 'Effects', label_ar: 'تأثيرات', icon: '✨' },
    ];

    var filtered = activeType === 'all'
        ? shopItems
        : shopItems.filter(i => i.type === activeType);

    var localS = S || {
        card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' },
        sectionTitle: { fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '10px', borderLeft: '3px solid #00f2ff', marginBottom: '12px' },
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Balance Header */}
            <div style={{ ...localS.card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(15,15,35,0.9),rgba(26,26,50,0.9))', border: '1px solid rgba(167,139,250,0.25)' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        {lang === 'ar' ? 'رصيد العائلة' : 'Family Balance'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#a78bfa', fontStyle: 'italic' }}>
                        {coins} {coinsSymbol}
                    </div>
                </div>
                <div style={{ fontSize: '36px' }}>💰</div>
            </div>

            {/* Type Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {TABS.map(tab => {
                    var active = activeType === tab.key;
                    var count = tab.key === 'all' ? shopItems.length : shopItems.filter(i => i.type === tab.key).length;
                    return (
                        <button key={tab.key} onClick={() => setActiveType(tab.key)} style={{
                            padding: '6px 12px', borderRadius: '20px', border: active ? '1.5px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                            background: active ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                            color: active ? '#a78bfa' : '#9ca3af', fontSize: '10px', fontWeight: active ? 800 : 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        }}>
                            {tab.icon} {lang === 'ar' ? tab.label_ar : tab.label_en}
                            <span style={{ background: active ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 5px', fontSize: '9px' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ ...localS.sectionTitle, marginTop: '4px' }}>
                🏅 {lang === 'ar' ? 'المتجر الحصري' : 'Exclusive Store'}
            </div>

            {/* Shop Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {filtered.map(item => {
                    var owned = isOwned(item);
                    var expiryLabel = getExpiryLabel(item);
                    // For timed items that were purchased but expired, allow re-buy
                    var purchasedButExpired = !owned && purchases[`${currentUID}_${item.id}`] && item.durationDays;
                    var canAfford = coins >= item.cost;
                    var rColor = RARITY_COLORS[item.rarity] || '#9ca3af';
                    var isBuying = buying === item.id;

                    // For timed items: button is active even if previously purchased (allows renewal)
                    var canBuy = !owned && canAfford && !isBuying;

                    return (
                        <div key={item.id} style={{
                            ...localS.card,
                            padding: '14px 12px',
                            border: `1px solid ${owned ? 'rgba(16,185,129,0.4)' : canAfford ? rColor + '44' : 'rgba(255,255,255,0.07)'}`,
                            background: owned ? 'rgba(16,185,129,0.06)' : canAfford ? `${rColor}08` : 'rgba(255,255,255,0.02)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s', position: 'relative',
                        }}>
                            {/* Rarity badge */}
                            <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '8px', fontWeight: 800, color: rColor, background: `${rColor}20`, padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                {item.rarity}
                            </div>

                            {/* Duration badge for timed items */}
                            {item.durationDays && (
                                <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '8px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                                    {item.durationDays}{lang === 'ar' ? 'ي' : 'd'}
                                </div>
                            )}

                            <div style={{ fontSize: '32px', lineHeight: 1, marginTop: item.durationDays ? '8px' : '0', filter: owned ? 'none' : `drop-shadow(0 0 6px ${rColor}88)` }}>
                                {item.emoji}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: owned ? '#10b981' : canAfford ? 'white' : '#6b7280', marginBottom: '2px' }}>
                                    {lang === 'ar' ? item.name_ar : item.name_en}
                                </div>
                                <div style={{ fontSize: '9px', color: '#6b7280', lineHeight: 1.3, marginBottom: '4px' }}>
                                    {lang === 'ar' ? item.desc_ar : item.desc_en}
                                </div>
                                {/* Expiry countdown */}
                                {expiryLabel && (
                                    <div style={{ fontSize: '9px', color: '#34d399', fontWeight: 700 }}>
                                        ⏰ {expiryLabel}
                                    </div>
                                )}
                                {/* Expired — show renew hint */}
                                {purchasedButExpired && (
                                    <div style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 700 }}>
                                        {lang === 'ar' ? '🔄 تجديد' : '🔄 Renew'}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => canBuy && handleBuy(item)}
                                disabled={!canBuy}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 800,
                                    cursor: canBuy ? 'pointer' : 'not-allowed',
                                    background: owned
                                        ? 'rgba(16,185,129,0.2)'
                                        : canAfford
                                            ? `linear-gradient(135deg,${rColor},${rColor}cc)`
                                            : 'rgba(255,255,255,0.05)',
                                    color: owned ? '#10b981' : canAfford ? 'white' : '#4b5563',
                                    width: '100%',
                                    opacity: isBuying ? 0.6 : 1,
                                }}
                            >
                                {isBuying
                                    ? '...'
                                    : owned
                                        ? `✅ ${lang === 'ar' ? 'مفعّل' : 'Active'}`
                                        : purchasedButExpired
                                            ? `🔄 ${item.cost}${coinsSymbol}`
                                            : `${item.cost}${coinsSymbol}`
                                }
                            </button>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</div>
                    <div style={{ fontSize: '12px' }}>{lang === 'ar' ? 'لا عناصر في هذه الفئة' : 'No items in this category'}</div>
                </div>
            )}

            <div style={{ height: '12px' }} />
        </div>
    );
};

window.FamilyShop = FamilyShop;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyRanking.js ---

var FamilyRanking = ({ currentUID, lang, isLeaderboard = true }) => {
    var [rankings, setRankRankings] = React.useState([]);
    var [loading, setLoading] = React.useState(true);

    var { 
        getFamilyLevelConfig = () => ({}), 
        getFamilySignLevelData = () => ({ level: 0 }),
        getFamilySignImage = () => ''
    } = window.FamilyConstants || window.FamilyService || {};
    var familiesCollection = window.familiesCollection;
    var currentFamilyId = window.currentFamilyId;

    React.useEffect(() => {
        if (!familiesCollection) {
            setLoading(false);
            return;
        }
        setLoading(true);
        familiesCollection.orderBy('xp', 'desc').limit(50).get().then(snap => {
            setRankRankings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [familiesCollection]);

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>;

    var medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rankings.map((fam, i) => {
                    var fl = getFamilyLevelConfig(fam.level || 1);
                    var sign = getFamilySignLevelData(fam.weeklyActiveness || 0);
                    var signColor = sign?.color || '#6b7280';
                    var signLevel = sign?.level || 1;
                    var isMine = fam.id === currentFamilyId;

                    return (
                        <div key={fam.id}
                            onClick={() => window.onOpenFamily && window.onOpenFamily(fam.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                                borderRadius: '16px',
                                background: isMine 
                                    ? 'rgba(0,242,255,0.08)' 
                                    : i < 3 
                                        ? 'rgba(255,215,0,0.04)' 
                                        : 'rgba(255,255,255,0.03)',
                                border: isMine 
                                    ? '1px solid rgba(0,242,255,0.3)' 
                                    : i === 0 
                                        ? '1px solid rgba(255,215,0,0.2)' 
                                        : '1px solid rgba(255,255,255,0.06)',
                                cursor: window.onOpenFamily ? 'pointer' : 'default',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Rank Indicator */}
                            <div style={{ width: '28px', textAlign: 'center', fontSize: '16px', flexShrink: 0 }}>
                                {i < 3 ? medals[i] : <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 800 }}>#{i + 1}</span>}
                            </div>

                            {/* Emblem */}
                            <div style={{ 
                                width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', 
                                border: `2px solid ${signColor}55`, background: 'rgba(0,0,0,0.4)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                fontSize: '20px', flexShrink: 0 
                            }}>
                                {fam.photoURL ? <img src={fam.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (fam.emblem || '🏠')}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                        fontSize: '13px', fontWeight: 800, color: isMine ? '#00f2ff' : 'white', 
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' 
                                    }}>
                                        {fam.name}
                                    </span>
                                    {window.FamilySignBadge && <window.FamilySignBadge tag={fam.tag} color={signColor} small signLevel={signLevel} imageURL={getFamilySignImage(0, signLevel)} />}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{fl.icon} Lv.{fl.level}</span>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span>👥 {(fam.members || []).length}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, color: '#fbbf24' }}>
                                    {window.fmtFamilyNum ? window.fmtFamilyNum(fam.xp || 0) : (fam.xp || 0)} XP
                                </div>
                                {sign && <div style={{ fontSize: '9px', color: signColor, fontWeight: 700 }}>{lang === 'ar' ? sign.name_ar : sign.name_en}</div>}
                            </div>
                            
                            {/* Hover Arrow */}
                            {window.onOpenFamily && <div style={{ fontSize: '12px', color: '#4b5563', marginLeft: '4px' }}>›</div>}
                        </div>
                    );
                })}
                {rankings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '13px' }}>
                        {lang === 'ar' ? 'لا يوجد ترتيب بعد' : 'No rankings yet'}
                    </div>
                )}
            </div>
        </div>
    );
};

window.FamilyRanking = FamilyRanking;
window.FamilyRankingInline = FamilyRanking; // For backward compatibility if needed internally


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyTreasury.js ---

/**
 * FamilyTreasury - Component for managing family funds, chests, and upgrades.
 */
var MIN_DONATE_INTEL = 10;

var FamilyTreasury = ({ 
    family, 
    currentUID, 
    currentUserData, 
    lang, 
    show, 
    onClose, 
    onNotification,
    canManage,
    isReadOnly,
    familyMembers,
    showDonatePanel,
    setShowDonatePanel
}) => {
    // ─── Late-Binding Dependencies ───
    var { 
        CHEST_CONFIG = {}, 
        ACTIVENESS_MILESTONES = [], 
        Z = { MODAL_TOP: 10000 }, 
        PortalModal,
        FAMILY_COINS_SYMBOL = '🏅',
        FamilyService = window.FamilyService || {},
        fmtFamilyNum = window.fmtFamilyNum || ((n) => n?.toLocaleString() || '0')
    } = window;

    // ─── State ───
    var [activeTab, setActiveTab] = React.useState('vault');
    var [depositing, setDepositing] = React.useState(false);
    var [upgradeLoading, setUpgradeLoading] = React.useState(null);
    var [openingChest, setOpeningChest] = React.useState(false);
    var [showHistory, setShowHistory] = React.useState(false);
    var [history, setHistory] = React.useState([]);
    var [historyLoading, setHistoryLoading] = React.useState(false);
    var [internalShowDonate, setInternalShowDonate] = React.useState(false);
    var showDonate = (typeof showDonatePanel !== 'undefined') ? showDonatePanel : internalShowDonate;
    var setShowDonate = setShowDonatePanel || setInternalShowDonate;
    
    var [donateAmount, setDonateAmount] = React.useState('');
    var [showChestModal, setShowChestModal] = React.useState(false);
    var [selectedChest, setSelectedChest] = React.useState(null);
    var [chestResult, setChestResult] = React.useState(null);
    var [showAssignModal, setShowAssignModal] = React.useState(false);
    var [assigningChest, setAssigningChest] = React.useState(null);
    var [selectedAssignees, setSelectedAssignees] = React.useState([]);
    var [assigningLoading, setAssigningLoading] = React.useState(false);

    var { treasury, treasuryInventory, level } = family || {};
    var fLvl = FamilyService.getFamilyLevelConfig(level || 1);

    var handleDonate = async () => {
        var amt = parseInt(donateAmount, 10);
        if (isNaN(amt) || amt < MIN_DONATE_INTEL) {
            onNotification(lang === 'ar' ? `❌ أقل تبرع ${MIN_DONATE_INTEL} إنتل` : `❌ Minimum donation is ${MIN_DONATE_INTEL} Intel`);
            return;
        }
        if ((currentUserData?.currency || 0) < amt) {
            onNotification(lang === 'ar' ? '❌ رصيدك غير كافٍ' : '❌ Insufficient balance');
            return;
        }
        try {
            await FamilyService.handleDonate({ family, amount: amt, currentUID, currentUserData, lang });
            setDonateAmount('');
            setShowDonate(false);
            onNotification(lang === 'ar' ? '✅ تم التبرع بنجاح' : '✅ Donation successful');
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ فشل التبرع' : '❌ Donation failed');
        }
    };

    var assignChest = async () => {
        if (!assigningChest || selectedAssignees.length === 0) return;
        setAssigningLoading(true);
        try {
            await FamilyService.assignChestToMembers({
                family,
                chestIdx: assigningChest.inventoryIdx,
                selectedUIDs: selectedAssignees,
                currentUID,
                lang
            });
            setShowAssignModal(false);
            setAssigningChest(null);
            setSelectedAssignees([]);
            onNotification(lang === 'ar' ? '✅ تم توزيع الصندوق بنجاح' : '✅ Chest assigned successfully');
        } catch (e) {
            console.error('assignChest', e);
            onNotification(lang === 'ar' ? '❌ فشل التوزيع' : '❌ Assignment failed');
        } finally {
            setAssigningLoading(false);
        }
    };

    var openAssignedChest = async (idx) => {
        try {
            var res = await FamilyService.openAssignedChest({
                family,
                currentUID,
                currentUserData,
                inventoryIdx: idx,
                lang,
                onNotification
            });
            if (res) {
                setChestResult(res.myBundle);
                setSelectedChest({ cfg: res.cfg });
                setShowChestModal(true);
            }
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ حدث خطأ أثناء فتح الصندوق' : '❌ Error opening chest');
        }
    };

    return (
        <React.Fragment>
            {/* ── Treasury Section (milestone chests are on Profile → Weekly & milestone chests) ── */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#e2e8f0', borderLeft: '3px solid #10b981', paddingLeft: '8px' }}>🛡️ {lang === 'ar' ? 'الخزينة' : 'Treasury'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '3px 10px' }}>
                            <span style={{ fontSize: '13px' }}>🏅</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{fmtFamilyNum(treasury)}</span>
                            {!isReadOnly && <button onClick={() => setShowDonate(!showDonate)} style={{ background: 'rgba(16,185,129,0.2)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 900, lineHeight: 1 }}>+</button>}
                        </div>
                    </div>
                </div>

                {/* Donate Panel */}
                {showDonate && (
                    <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>{lang === 'ar' ? 'تبرع بالبصيرة للقبيلة' : 'Donate Intel to Family'}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px' }}>{lang === 'ar' ? `الحد الأدنى ${MIN_DONATE_INTEL} إنتل 🧠` : `Minimum ${MIN_DONATE_INTEL} Intel 🧠`}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} min={MIN_DONATE_INTEL} placeholder={String(MIN_DONATE_INTEL)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '8px', fontSize: '13px' }} />
                            <button onClick={handleDonate} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                {lang === 'ar' ? 'تبرع' : 'Donate'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Chest inventory */}
                {(() => {
                    var visibleInventory = (treasuryInventory || []).map((item, i) => ({ item, i }));
                    return visibleInventory.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                            {visibleInventory.map(({ item, i }) => {
                                var cfg = CHEST_CONFIG[item.chestType];
                                if (!cfg) return null;
                                var ms = ACTIVENESS_MILESTONES.find(m => m.chestType === item.chestType);
                                var chestImg = ms?.imageURL || null;
                                var myAssigned = (item.assignedTo || []).includes(currentUID);
                                var myClaimCount = (item.claimedBy || {})[currentUID] || 0;
                                var canClaim = myAssigned && myClaimCount < (item.maxClaimsPerMember || 1);
                                var remainingClaims = myAssigned ? Math.max(0, (item.maxClaimsPerMember || 1) - myClaimCount) : 0;
                                return (
                                    <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '72px', padding: '8px 4px', borderRadius: '12px', background: `${cfg.color}14`, border: `1px solid ${cfg.color}44`, cursor: 'pointer', position: 'relative' }}
                                        onClick={() => {
                                            if (canManage && !canClaim && (!item.assignedTo || item.assignedTo.length === 0)) {
                                                setAssigningChest({ inventoryIdx: i, cfg, item });
                                                setShowAssignModal(true);
                                            } else if (canClaim) {
                                                openAssignedChest(i);
                                            } else {
                                                setSelectedChest({ cfg, item });
                                                setChestResult(null);
                                                setShowChestModal(true);
                                            }
                                        }}>
                                        {chestImg ? <img src={chestImg} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} /> : <div style={{ fontSize: '32px' }}>{ms?.icon || '📦'}</div>}
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: cfg.color, textAlign: 'center' }}>{lang === 'ar' ? cfg.name_ar : cfg.name_en}</div>
                                        {canClaim && (
                                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: 'white' }}>
                                                {remainingClaims}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '8px', color: '#9ca3af', textAlign: 'center' }}>
                                            {canManage && (!item.assignedTo || item.assignedTo.length === 0) ? (lang === 'ar' ? 'توزيع' : 'Assign') : canClaim ? (lang === 'ar' ? 'افتح' : 'Open') : (lang === 'ar' ? 'تفاصيل' : 'Details')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '11px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '6px' }}>📦</div>
                            {lang === 'ar' ? 'لا توجد صناديق متاحة في الخزينة بعد' : 'No chests available in treasury yet'}
                        </div>
                    );
                })()}
            </div>

            {/* ── Chest Detail Modal ── */}
            {showChestModal && selectedChest && (
                <PortalModal>
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowChestModal(false)}>
                        <div className="modal-content animate-pop" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>{selectedChest.cfg.icon}</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{lang === 'ar' ? selectedChest.cfg.name_ar : selectedChest.cfg.name_en}</h3>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>{lang === 'ar' ? 'محتويات الصندوق المحتملة' : 'Potential chest contents'}</p>

                                {chestResult ? (
                                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '12px' }}>🎉 {lang === 'ar' ? 'لقد ربحت!' : 'You Won!'}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {chestResult.currency > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>🧠 {chestResult.currency} {lang === 'ar' ? 'إنتل' : 'Intel'}</div>}
                                            {chestResult.coins > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{FAMILY_COINS_SYMBOL} {chestResult.coins} {lang === 'ar' ? 'عملة' : 'Coins'}</div>}
                                            {chestResult.charisma > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>⭐ {chestResult.charisma} {lang === 'ar' ? 'كاريزما' : 'Charisma'}</div>}
                                            {(chestResult.items || []).map((it, idx) => (
                                                <div key={idx} style={{ fontSize: '13px', color: '#e5e7eb' }}>{it.icon} {it.qty || 1}× {lang === 'ar' ? it.label_ar : it.label_en}</div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                                        {(selectedChest.item?.availableRewards || selectedChest.cfg.rewards).map((r, idx) => {
                                            var resolved = typeof window.resolveRewardItem === 'function' ? window.resolveRewardItem(r) : r;
                                            return (
                                                <div key={idx} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '18px' }}>{resolved.icon}</span>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'white' }}>{resolved.amountRemaining !== undefined ? fmtFamilyNum(resolved.amountRemaining) : (resolved.amount ? fmtFamilyNum(resolved.amount) : (resolved.qty ? resolved.qty + '×' : '1×'))}</div>
                                                        <div style={{ fontSize: '9px', color: '#6b7280' }}>{lang === 'ar' ? resolved.label_ar : resolved.label_en}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <button onClick={() => setShowChestModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </PortalModal>
            )}

            {/* ── Assign Chest Modal ── */}
            {showAssignModal && assigningChest && (
                <PortalModal>
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div className="modal-content animate-pop" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', pointerEvents: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{assigningChest.cfg.icon}</div>
                                <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{lang === 'ar' ? 'توزيع الصندوق' : 'Assign Chest'}</h3>
                                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ar' ? `اختر الأعضاء للحصول على نصيب من ${assigningChest.cfg.name_ar}` : `Select members to share ${assigningChest.cfg.name_en}`}</p>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                {(familyMembers || []).map(m => {
                                    var isSelected = selectedAssignees.includes(m.id);
                                    return (
                                        <div key={m.id} onClick={() => {
                                            if (isSelected) setSelectedAssignees(selectedAssignees.filter(id => id !== m.id));
                                            else setSelectedAssignees([...selectedAssignees, m.id]);
                                        }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', background: isSelected ? 'rgba(16,185,129,0.1)' : 'transparent', cursor: 'pointer', marginBottom: '4px' }}>
                                            <img src={m.photoURL || 'icos/default_avatar.png'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            <div style={{ flex: 1, fontSize: '13px', color: isSelected ? '#10b981' : '#e5e7eb', fontWeight: isSelected ? 800 : 400 }}>{m.displayName}</div>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.2)', background: isSelected ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isSelected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setShowAssignModal(false); setAssigningChest(null); setSelectedAssignees([]); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={assignChest} disabled={assigningLoading || selectedAssignees.length === 0} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: selectedAssignees.length ? 'pointer' : 'not-allowed', opacity: selectedAssignees.length ? 1 : 0.5 }}>
                                    {assigningLoading ? '...' : lang === 'ar' ? 'توزيع' : 'Assign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </PortalModal>
            )}
        </React.Fragment>
    );
};

window.FamilyTreasury = FamilyTreasury;
// No export default.


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\FamilyGacha.js ---

// Lazy access — avoids crash if PortalModal / Z not yet on window at parse time
var getZ = () => window.Z || {};
var getPortalModal = () => window.PortalModal || (({ children }) => children);
var fmtFamilyNum = (...args) => (window.fmtFamilyNum || (n => String(n)))(...args);

/**
 * FamilyGacha - Modal component for family gacha spins.
 */
var FamilyGacha = ({ family, currentUID, currentUserData, lang, onNotification, show, onClose }) => {
    var [spinning, setSpinning] = React.useState(false);
    var [result, setResult] = React.useState(null);
    var [spinMode, setSpinMode] = React.useState('free'); // 'free' or 'paid'

    if (!show) return null;

    var cBasic = window.FamilyConstants?.GACHA_CONFIG_BASIC || window.GACHA_CONFIG_BASIC || window.GACHA_CONFIG || {};
    var cPrem = window.FamilyConstants?.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG || {};
    var currentGachaConfig = (family?.level >= 5) ? cPrem : cBasic;
    var rewards = currentGachaConfig.rewards || [];

    var handleSpin = async (mode) => {
        if (spinning) return;
        setSpinMode(mode);
        setSpinning(true);
        setResult(null);

        try {
            await new Promise(r => setTimeout(r, 2000));

            var res = await window.FamilyService.handleGachaRoll({
                family,
                currentUID,
                currentUserData,
                mode,
                lang,
                onNotification
            });

            if (res) setResult(res);
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ فشل السحب' : '❌ Spin failed');
        } finally {
            setSpinning(false);
        }
    };

    var PortalModal = getPortalModal();
    var Z = getZ();
    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH + 10 }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                    background: 'linear-gradient(180deg, #1a1040, #0a0a2e)',
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                }}>
                    <h2 style={{ color: '#a78bfa', marginBottom: '8px' }}>🎰 {lang === 'ar' ? 'جاتشه القبيلة' : 'Family Gacha'}</h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                        {lang === 'ar' ? 'جرب حظك واربح جوائز نادرة!' : 'Try your luck and win rare rewards!'}
                    </p>

                    {/* Machine View */}
                    <div style={{
                        height: '160px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '2px solid rgba(167, 139, 250, 0.2)'
                    }}>
                        {spinning ? (
                            <div className="spinning-slots" style={{ fontSize: '60px' }}>✨</div>
                        ) : result ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '50px', marginBottom: '8px' }}>{result.icon || '🎁'}</div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f2ff' }}>
                                    {lang === 'ar' ? result.name_ar : result.name_en}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '60px', opacity: 0.3 }}>🎰</div>
                        )}
                        
                        {/* Decoration */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }}></div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button 
                            onClick={() => handleSpin('free')} 
                            disabled={spinning}
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#e2e8f0',
                                fontWeight: 800,
                                cursor: 'pointer',
                                opacity: spinning ? 0.5 : 1
                            }}
                        >
                            🆓 {lang === 'ar' ? 'سحبة مجانية يومية' : 'Daily Free Spin'}
                        </button>
                        
                        <button 
                            onClick={() => handleSpin('paid')} 
                            disabled={spinning}
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #a78bfa, #7000ff)',
                                color: 'white',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(112, 0, 255, 0.4)',
                                opacity: spinning ? 0.5 : 1
                            }}
                        >
                            💎 {lang === 'ar' ? `سحبة بـ ${currentGachaConfig.paidCostPerSpin} إنتل` : `Spin for ${currentGachaConfig.paidCostPerSpin} Intel`}
                        </button>
                    </div>

                    {/* Rewards Preview Section */}
                    <div style={{
                        marginTop: '24px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '16px',
                        textAlign: 'left'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'
                        }}>
                            <span style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '14px' }}>
                                {lang === 'ar' ? 'الجوائز المتاحة' : 'Available Rewards'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#a78bfa' }}>
                                {lang === 'ar' ? 'النسب المئوية التقريبية' : 'Estimated Rates'}
                            </span>
                        </div>
                        
                        <div style={{
                            maxHeight: '120px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            paddingRight: '6px'
                        }}>
                            {rewards.map((r, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px',
                                    padding: '8px 12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '18px' }}>{r.icon}</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '13px' }}>
                                            {lang === 'ar' ? r.label_ar : r.label_en}
                                        </span>
                                    </div>
                                    <span style={{ 
                                        color: r.rarity === 'legendary' ? '#fbbf24' : 
                                               r.rarity === 'epic' ? '#a78bfa' : 
                                               r.rarity === 'rare' ? '#60a5fa' : 
                                               r.rarity === 'uncommon' ? '#4ade80' : '#9ca3af',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {r.rateDisplay}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}
                    >
                        {lang === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            </div>

            <style>{`
                .spinning-slots {
                    animation: gacha-spin 0.2s infinite;
                }
                @keyframes gacha-spin {
                    0% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(0deg); }
                    50% { transform: translateY(5px) scale(0.9); filter: hue-rotate(180deg); }
                    100% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(360deg); }
                }
            `}</style>
        </PortalModal>
    );
};

// No export default. Access via window.FamilyGacha.
window.FamilyGacha = FamilyGacha;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\family\components\RedPacketCard.js ---

/**
 * 🧧 RED PACKET CARD — Tap once to see details, tap Claim to get funds
 * Used in Public Chat, Family Chat, Group Chat
 */
var RedPacketCard = ({ rpId, rpAmount, maxClaims, senderName, currentUID, user, currentUser, lang, onClaim }) => {
    var redPacketsCollection = window.redPacketsCollection || (window.db || window.firestore)?.collection('redPackets');
    var [showDetails, setShowDetails] = React.useState(false);
    var [rpData, setRpData] = React.useState(null);
    var [loading, setLoading] = React.useState(false);
    var [selfClaimed, setSelfClaimed] = React.useState(false);

    // Auto-load to detect claimed state without user tap
    React.useEffect(() => {
        if (!rpId) return;
        redPacketsCollection.doc(rpId).get().then(doc => {
            if (doc.exists) {
                var d = doc.data();
                setRpData(d);
                if (d.claimedBy?.includes(user?.uid)) setSelfClaimed(true);
            }
        }).catch(()=>{});
    }, [rpId, user?.uid]);

    var fetchDetails = async () => {
        if (rpData) { setShowDetails(true); return; }
        setLoading(true);
        try {
            var doc = await redPacketsCollection.doc(rpId).get();
            if (doc.exists) setRpData(doc.data());
        } catch(e) {}
        setLoading(false);
        setShowDetails(true);
    };

    var claimed = selfClaimed || rpData?.claimedBy?.includes(user?.uid);
    var isReclaimed = rpData?.status === 'reclaimed';
    var exhausted = isReclaimed || (rpData?.claimedBy?.length||0) >= (rpData?.maxClaims||maxClaims||1);
    var remaining = rpData?.remaining ?? rpAmount;
    var claimedCount = rpData?.claimedBy?.length || 0;

    if (showDetails && rpData) return (
        <React.Fragment>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(185,28,28,0.1))',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'16px',padding:'12px 14px',minWidth:'200px',maxWidth:'min(260px,calc(100vw-90px))'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                <div style={{fontSize:'26px',filter:'drop-shadow(0 0 6px rgba(239,68,68,0.7))'}}>🧧</div>
                <div>
                    <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                    <div style={{fontSize:'10px',color:'#fca5a5'}}>{rpAmount?.toLocaleString()} 🧠 · {lang==='ar'?'من':'from'} {senderName}</div>
                </div>
                <button onClick={()=>setShowDetails(false)} style={{marginLeft:'auto',background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'14px',lineHeight:1}}>✕</button>
            </div>
            {/* Progress bar */}
            <div style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#9ca3af',marginBottom:'3px'}}>
                    <span>{lang==='ar'?'تم الاستلام':'Claimed'}: {claimedCount}/{rpData.maxClaims||maxClaims}</span>
                    <span>{lang==='ar'?'متبقي':'Remaining'}: {remaining?.toLocaleString?.()} 🧠</span>
                </div>
                <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.1)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:'2px',background:'linear-gradient(90deg,#ef4444,#fbbf24)',width:`${Math.min(100,((claimedCount/(rpData.maxClaims||maxClaims||1))*100))}%`}}/>
                </div>
            </div>
            {!claimed && !exhausted && (
                <button onClick={()=>{onClaim(rpId);setShowDetails(false);}} style={{width:'100%',padding:'8px',borderRadius:'10px',background:'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))',border:'1px solid rgba(239,68,68,0.5)',color:'#ffd700',fontSize:'12px',fontWeight:800,cursor:'pointer'}}>
                    🎁 {lang==='ar'?'استلم الآن':'Claim Now'}
                </button>
            )}
            {claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#4ade80',padding:'6px'}}>✅ {lang==='ar'?'استلمته':'Claimed'}</div>}
            {isReclaimed && !claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#f87171',padding:'6px'}}>↩ {lang==='ar'?'تم استرداد المغلف':'Packet reclaimed'}</div>}
            {exhausted && !claimed && !isReclaimed && <div style={{textAlign:'center',fontSize:'11px',color:'#6b7280',padding:'6px'}}>🔴 {lang==='ar'?'نفد المغلف':'Exhausted'}</div>}
        </div>
        </React.Fragment>
    );

    return (
        <button onClick={fetchDetails} style={{
            display:'flex',alignItems:'center',gap:'10px',padding:'11px 15px',borderRadius:'16px',
            background: claimed
                ? 'linear-gradient(135deg,rgba(75,85,99,0.28),rgba(55,65,81,0.2))'
                : 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
            border: claimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
            cursor:'pointer',
            boxShadow: claimed ? 'none' : '0 4px 16px rgba(239,68,68,0.25)',
            textAlign:'left',
            maxWidth:'min(260px,calc(100vw-90px))',
            opacity: claimed ? 0.55 : 1,
            transition:'all 0.25s',
        }}>
            <div style={{fontSize:'30px',filter: claimed ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>{loading?'⏳':'🧧'}</div>
            <div>
                <div style={{fontSize:'12px',fontWeight:800,color: claimed ? '#6b7280' : '#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                <div style={{fontSize:'10px',color: claimed ? '#4b5563' : '#fca5a5',marginTop:'2px'}}>{rpAmount?.toLocaleString()} 🧠 · {maxClaims} {lang==='ar'?'استلام':'claims'}</div>
                <div style={{fontSize:'9px',color: claimed ? '#374151' : 'rgba(252,165,165,0.6)',marginTop:'2px'}}>
                    {claimed ? (lang==='ar'?'✅ تم الاستلام':'✅ Claimed') : (lang==='ar'?'اضغط للتفاصيل':'Tap for details')}
                </div>
            </div>
        </button>
    );
};

window.RedPacketCard = RedPacketCard;

})();
