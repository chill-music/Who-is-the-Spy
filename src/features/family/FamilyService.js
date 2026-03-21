const { db, auth, usersCollection, familiesCollection, redPacketsCollection, newsLogCollection, firebase } = window;
const { TS } = window;
const { 
    FAMILY_CREATE_COST,
    FAMILY_LEVEL_CONFIG, 
    FAMILY_SIGN_LEVELS,
    FAMILY_TASKS_CONFIG,
    CHEST_CONFIG, 
    FAMILY_SIGN_IMAGES,
    GACHA_CONFIG_BASIC,
    GACHA_CONFIG_PREMIUM,
    ACTIVENESS_MILESTONES,
    FAMILY_COINS_SYMBOL
} = window.FamilyConstants || {};

/**
 * useFamilyData - React hook for real-time family data in the FamilyModal.
 */
const useFamilyData = () => {
    const [currentUID, setCurrentUID] = React.useState(auth.currentUser?.uid || null);
    const [currentUserData, setCurrentUserData] = React.useState(null);
    const [family, setFamily] = React.useState(null);
    const [familyMembers, setFamilyMembers] = React.useState([]);
    const [loadingFamily, setLoadingFamily] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(user => {
            setCurrentUID(user?.uid || null);
        });

        if (!currentUID) {
            setLoadingFamily(false);
            return () => unsubAuth();
        }

        // 1. Listen to user doc for familyId
        const unsubUser = usersCollection.doc(currentUID).onSnapshot(snap => {
            const userData = snap.data();
            setCurrentUserData(userData);
            const familyId = userData?.familyId;

            if (!familyId) {
                setFamily(null);
                setFamilyMembers([]);
                setLoadingFamily(false);
                return;
            }

            // 2. Listen to family doc
            const unsubFam = familiesCollection.doc(familyId).onSnapshot(fSnap => {
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

            // 3. Listen to members
            const unsubMbrs = familiesCollection.doc(familyId).collection('membersData').onSnapshot(mSnap => {
                // Actually, members might be in the main users collection
                // or a subcollection. Based on createFamily, they are in families subcollection?
                // Let's check createFamily line 420.
                // It doesn't show a subcollection.
                // But FamilyService.js handleJoinRequest (line 651) updates families doc.
                // Wait, membersData is used in line 266: (family.membersData || [])
            }, err => console.error("Members listener error:", err));

            // Actually, many systems store membersData as a field or subcollection.
            // In this specific project, it seems family.members is an array of UIDs.
            // And family.membersData might be populated by a cloud function or listener.
            
            // For now, let's assume familyMembers comes from family.membersData field
            // if it exists, or we fetch them.
            
            return () => {
                unsubFam();
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

const getFamilyRole = (family, uid) => {
    if (!family || !uid) return 'member';
    if (family.createdBy === uid) return 'owner';
    const roles = family.memberRoles || {};
    return roles[uid] || 'member';
};

const canManageFamily = (family, uid) => {
    const role = getFamilyRole(family, uid);
    return role === 'owner' || role === 'admin';
};

const getFamilyLevelConfig = (level = 1) => {
    return FAMILY_LEVEL_CONFIG.find(c => c.level === level) || FAMILY_LEVEL_CONFIG[0];
};

const getFamilyLevelProgress = (activeness = 0, currentLevel = 1) => {
    const cur = getFamilyLevelConfig(currentLevel);
    const next = FAMILY_LEVEL_CONFIG.find(c => c.level === currentLevel + 1);
    if (!next) return 100;
    const progress = Math.max(0, activeness - cur.activeness);
    const range = next.activeness - cur.activeness;
    return Math.max(0, Math.min(100, Math.round((progress / range) * 100)));
};

const getFamilySignImage = (level) => {
    if (typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    const cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

const getFamilySignLevelData = (weeklyActiveness = 0) => {
    let cfg = null;
    for (let i = FAMILY_SIGN_LEVELS.length - 1; i >= 0; i--) {
        if (weeklyActiveness >= FAMILY_SIGN_LEVELS[i].threshold) { 
            cfg = FAMILY_SIGN_LEVELS[i]; 
            break; 
        }
    }
    if (!cfg) return null;
    return { ...cfg, imageURL: getFamilySignImage(cfg.level) };
};

const getFamilySignProgress = (weeklyActiveness = 0) => {
    const cur = getFamilySignLevelData(weeklyActiveness);
    if (!cur) {
        const first = FAMILY_SIGN_LEVELS[0];
        return Math.min(99, Math.round((weeklyActiveness / first.threshold) * 100));
    }
    const next = FAMILY_SIGN_LEVELS.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
};

// ─────────────────────────────────────────────────────────────────────────────
// 📦 TREASURY & CHESTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Claims a share from an assigned chest.
 */
const openAssignedChest = async ({ family, currentUID, currentUserData, inventoryIdx, lang, onNotification }) => {
    if (!family?.id || !currentUID) return null;
    const inv = family.treasuryInventory || [];
    const chest = inv[inventoryIdx];
    if (!chest || !(chest.assignedTo || []).includes(currentUID)) return null;

    const cfg = CHEST_CONFIG[chest.chestType];
    if (!cfg) return null;

    const claims = chest.claimedBy || {};
    const myClaimCount = claims[currentUID] || 0;
    if (myClaimCount >= (chest.maxClaimsPerMember || 1)) {
        onNotification(lang === 'ar' ? '✅ استلمت حصتك بالكامل' : '✅ You already claimed your share');
        return null;
    }

    try {
        const familyRef = familiesCollection.doc(family.id);
        let myBundle = { currency: 0, coins: 0, charisma: 0, items: [] };

        await db.runTransaction(async (transaction) => {
            const famDoc = await transaction.get(familyRef);
            if (!famDoc.exists) throw new Error('Family not found');
            const famData = famDoc.data();
            const freshInv = famData.treasuryInventory || [];
            const freshChest = freshInv[inventoryIdx];
            if (!freshChest || !(freshChest.assignedTo || []).includes(currentUID)) throw new Error('Not assigned');
            
            const freshClaims = freshChest.claimedBy || {};
            const freshClaimCount = freshClaims[currentUID] || 0;
            if (freshClaimCount >= (freshChest.maxClaimsPerMember || 1)) throw new Error('Already claimed');

            const totalParticipants = freshChest.assignedTo.length;
            const remainingParticipants = totalParticipants - Object.keys(freshClaims).length;
            let numClaimsNow = remainingParticipants > 0 ? remainingParticipants : 1;
            
            let updatedRewards = [];
            const rewardsToGive = { currency: 0, coins: 0, charisma: 0, items: [] };

            (freshChest.availableRewards || []).forEach(r => {
                let newR = { ...r };
                if (r.type === 'currency' || r.type === 'familyCoins' || r.type === 'coins' || r.type === 'charisma') {
                    let total = r.amountRemaining || 0;
                    let myShare = Math.floor(total / numClaimsNow);
                    if (numClaimsNow === 1) {
                        myShare = total;
                    } else {
                        let remainder = total % numClaimsNow;
                        if (remainder > 0 && Math.random() < 0.5) myShare += 1;
                    }
                    if (myShare > total) myShare = total;
                    
                    if (myShare > 0) {
                        if (r.type === 'currency') rewardsToGive.currency += myShare;
                        else if (r.type === 'charisma') rewardsToGive.charisma += myShare;
                        else rewardsToGive.coins += myShare;
                    }
                    newR.amountRemaining = total - myShare;
                    updatedRewards.push(newR);
                } else {
                    if (!r.claimedBy) {
                        if (Math.random() < 1 / numClaimsNow) {
                            rewardsToGive.items.push({ ...r, qty: 1 });
                            newR.claimedBy = currentUID;
                        }
                    }
                    updatedRewards.push(newR);
                }
            });

            freshChest.availableRewards = updatedRewards;
            freshChest.claimedBy = { ...freshClaims, [currentUID]: freshClaimCount + 1 };
            freshInv[inventoryIdx] = freshChest;

            // Calculate and apply rewards inside the transaction
            const userRef = usersCollection.doc(currentUID);
            const userUpdate = {};
            
            if (rewardsToGive.currency > 0) userUpdate.currency = firebase.firestore.FieldValue.increment(rewardsToGive.currency);
            if (rewardsToGive.charisma > 0) userUpdate.charisma = firebase.firestore.FieldValue.increment(rewardsToGive.charisma);
            
            const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
            rewardsToGive.items.forEach(r => {
                if (r.type === 'frame') {
                    const expiresAt = r.duration ? Date.now() + r.duration * 86400000 : null;
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

            const familyUpdates = { treasuryInventory: freshInv };
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
        const receiptParts = [];
        if (myBundle.currency > 0) receiptParts.push(`${myBundle.currency} 🧠`);
        if (myBundle.coins > 0) receiptParts.push(`${myBundle.coins} ${FAMILY_COINS_SYMBOL}`);
        if (myBundle.charisma > 0) receiptParts.push(`${myBundle.charisma} ⭐`);
        myBundle.items.forEach(r => {
            let rIcon = r.icon || '🎁';
            if (r.type === 'frame') receiptParts.push(`${rIcon} ${r.duration || '?'}d`);
            else receiptParts.push(`${r.qty || 1}× ${rIcon}`);
        });
        const receiptText = receiptParts.join(' • ') || (lang==='ar'?'لا شيء':'Nothing');

        // Post to chat
        const chestIcon = ACTIVENESS_MILESTONES.find(m => m.chestType === chest.chestType)?.icon || '📦';
        await familiesCollection.doc(family.id).collection('messages').add({
            senderId: currentUID,
            senderName: currentUserData?.displayName || 'Member',
            senderPhoto: currentUserData?.photoURL || null,
            type: 'chest_opened',
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
const assignChestToMembers = async ({ family, chestIdx, selectedUIDs, currentUID, lang }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) throw new Error('Unauthorized');
    const inv = [...(family.treasuryInventory || [])];
    const chest = inv[chestIdx];
    if (!chest || chest.assignedTo) return;

    inv[chestIdx] = {
        ...chest,
        assignedTo: selectedUIDs,
        assignedAt: TS(),
        assignedBy: currentUID,
        maxClaimsPerMember: 1,
        claimedBy: {},
    };

    await familiesCollection.doc(family.id).update({ treasuryInventory: inv });

    // Announcement in chat
    const cfg = CHEST_CONFIG[chest.chestType];
    const chestIcon = cfg?.icon || '📦';
    const names = (family.membersData || [])
        .filter(m => selectedUIDs.includes(m.id))
        .map(m => m.displayName)
        .join(', ');

    await familiesCollection.doc(family.id).collection('messages').add({
        type: 'chest_assigned',
        chestType: chest.chestType,
        chestIcon,
        assignedTo: selectedUIDs,
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

const handleGachaRoll = async ({ family, currentUID, currentUserData, mode = 'free', lang, onNotification }) => {
    if (!family?.id || !currentUID) throw new Error('Invalid context');
    
    const currentGachaConfig = (family?.level >= 5) ? GACHA_CONFIG_PREMIUM : GACHA_CONFIG_BASIC;
    const today = new Date().toDateString();
    const HARD_COST_CAP = 200;

    if (mode === 'free') {
        const lastFree = family.gachaFreeLastUsed;
        if (lastFree) {
            const lastDate = lastFree.toDate ? lastFree.toDate() : new Date(lastFree.seconds * 1000);
            if (lastDate.toDateString() === today) {
                onNotification(lang === 'ar' ? '⏳ استخدمت السحبة المجانية اليوم' : '⏳ Free spin already used today');
                return null;
            }
        }
    } else {
        const costPerSpin = Math.min(currentGachaConfig.paidCostPerSpin, HARD_COST_CAP);
        if ((currentUserData?.currency || 0) < costPerSpin) {
            onNotification(lang === 'ar' ? `❌ تحتاج ${costPerSpin} إنتل` : `❌ Need ${costPerSpin} Intel`);
            return null;
        }
        const spinsToday = family.gachaPaidSpins?.[today] || 0;
        if (spinsToday >= currentGachaConfig.maxPaidSpinsDaily) {
            onNotification(lang === 'ar' ? `❌ وصلت الحد اليومي (${currentGachaConfig.maxPaidSpinsDaily} سحبة)` : `❌ Daily limit reached (${currentGachaConfig.maxPaidSpinsDaily} spins)`);
            return null;
        }
    }

    try {
        const total = currentGachaConfig.rewards.reduce((s, r) => s + r.weight, 0);
        let rand = Math.random() * total;
        let picked = currentGachaConfig.rewards[currentGachaConfig.rewards.length - 1];
        for (const r of currentGachaConfig.rewards) {
            rand -= r.weight;
            if (rand <= 0) { picked = r; break; }
        }

        const rewardUpdates = {};

        if (mode === 'free') {
            rewardUpdates.gachaFreeLastUsed = TS();
        } else {
            const costPerSpin = Math.min(currentGachaConfig.paidCostPerSpin, HARD_COST_CAP);
            const userRef = usersCollection.doc(currentUID);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User not found');
                const currentBalance = userDoc.data()?.currency || 0;
                if (currentBalance < costPerSpin) throw new Error('Insufficient balance');
                transaction.update(userRef, {
                    currency: firebase.firestore.FieldValue.increment(-costPerSpin),
                });
            });
            rewardUpdates[`gachaPaidSpins.${today}`] = firebase.firestore.FieldValue.increment(1);
        }

        // Apply reward to user document
        const userRewardUpdate = {};
        if (picked.type === 'currency') {
            userRewardUpdate.currency = firebase.firestore.FieldValue.increment(picked.amount);
        } else if (picked.type === 'charisma') {
            userRewardUpdate.charisma = firebase.firestore.FieldValue.increment(picked.amount);
        } else if (picked.type === 'coins') {
            rewardUpdates.familyCoins = firebase.firestore.FieldValue.increment(picked.amount);
        } else if (picked.type === 'frame' || picked.type === 'frame_anim') {
            const expiresAt = picked.duration ? Date.now() + picked.duration * 86400000 : null;
            userRewardUpdate[`inventory.frames`] = firebase.firestore.FieldValue.arrayUnion(picked.frameId);
            userRewardUpdate[`inventory.expiry.${picked.frameId}`] = expiresAt;
        } else if (picked.type === 'gift') {
            userRewardUpdate[`inventory.gifts`] = firebase.firestore.FieldValue.arrayUnion(picked.giftId);
            userRewardUpdate[`inventory.giftCounts.${picked.giftId}`] = firebase.firestore.FieldValue.increment(picked.qty || 1);
            if (picked.giftId !== 'gift_ring') {
                userRewardUpdate[`inventory.expiry.${picked.giftId}`] = Date.now() + 30 * 86400000;
            }
        } else if (picked.type === 'chest') {
            const chestItem = { chestType: picked.chestType, gachaWon: true, wonAt: Date.now(), wonBy: currentUID };
            rewardUpdates.treasuryInventory = firebase.firestore.FieldValue.arrayUnion(chestItem);
        }

        if (Object.keys(userRewardUpdate).length > 0) {
            await usersCollection.doc(currentUID).update(userRewardUpdate);
        }
        if (Object.keys(rewardUpdates).length) {
            await familiesCollection.doc(family.id).update(rewardUpdates);
        }

        return picked;
    } catch (e) {
        console.error('FamilyService.handleGachaRoll:', e);
        throw e;
    }
};

/**
 * Claims a milestone chest from activeness.
 */
const handleClaimChest = async ({ family, chestIdx, currentUID, lang, onNotification }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return null;
    const ms = ACTIVENESS_MILESTONES[chestIdx];
    if (!ms || (family.activeness || 0) < ms.threshold) return null;
    const claimed = family.activenessClaimedMilestones || [];
    if (claimed.includes(chestIdx)) return null;

    try {
        const chestItem = { chestType: ms.chestType, idx: chestIdx, claimedAt: Date.now(), claimedBy: currentUID };
        await familiesCollection.doc(family.id).update({
            activenessClaimedMilestones: firebase.firestore.FieldValue.arrayUnion(chestIdx),
            treasuryInventory: firebase.firestore.FieldValue.arrayUnion(chestItem),
        });
        return { ms, cfg: CHEST_CONFIG[ms.chestType] };
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
const createFamily = async ({ tribeName, tribeTag, tribeDesc, tribeEmblem, currentUID, currentUserData, lang }) => {
    if (!tribeName.trim() || !tribeTag.trim() || !currentUID) return null;
    const cleanTag = tribeTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    const cleanName = tribeName.trim().slice(0, 10);
    
    const tagCheck = await familiesCollection.where('tag', '==', cleanTag).get();
    if (!tagCheck.empty) throw new Error('Tag already taken');

    const ref = await familiesCollection.add({
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
const joinFamily = async ({ familyId, currentUID, currentUserData, lang }) => {
    if (!currentUID || !familyId) return null;
    const snap = await familiesCollection.doc(familyId).get();
    if (!snap.exists) throw new Error('Family not found');
    const fd = snap.data();
    const lvl = getFamilyLevelConfig(fd.level || 1);
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

    const signData = getFamilySignLevelData(fd.lastWeekActiveness || 0);
    await usersCollection.doc(currentUID).update({
        familyId, familyName: fd.name, familyTag: fd.tag,
        familySignLevel: signData?.level || null,
        familySignColor: signData?.color || null,
        familySignImageURL: fd.signImageURL || null,
    });

    await postSystemMessage(familyId, lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
    await postNews(familyId, 'join', lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
    
    return { status: 'joined' };
};

/**
 * Leave the current family.
 */
const leaveFamily = async ({ family, currentUID, currentUserData, lang }) => {
    if (!family?.id || !currentUID) return;
    const role = getFamilyRole(family, currentUID);
    if (role === 'owner' && (family.members || []).length > 1) throw new Error('Assign another leader first');

    if ((family.members || []).length <= 1) {
        await familiesCollection.doc(family.id).delete();
    } else {
        const updRoles = { ...family.memberRoles }; delete updRoles[currentUID];
        const updDons = { ...family.memberDonations }; delete updDons[currentUID];
        await familiesCollection.doc(family.id).update({
            members: firebase.firestore.FieldValue.arrayRemove(currentUID),
            memberRoles: updRoles, memberDonations: updDons,
        });
        await postSystemMessage(family.id, lang === 'ar' ? `👋 ${currentUserData?.displayName} غادر العائلة` : `👋 ${currentUserData?.displayName} left the family`);
        await postNews(family.id, 'leave', lang === 'ar' ? `${currentUserData?.displayName} غادر العائلة` : `${currentUserData?.displayName} left the family`);
    }

    await usersCollection.doc(currentUID).update({
        familyId: null, familyName: null, familyTag: null,
        familySignLevel: null, familySignColor: null, familySignImageURL: null,
    });
};

/**
 * Atomic deletion of family (Owner only).
 */
const deleteFamily = async ({ family, currentUID }) => {
    if (!family?.id || getFamilyRole(family, currentUID) !== 'owner') throw new Error('Unauthorized');
    const memberIds = family.members || [];
    const batch = db.batch();
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
const handleDonate = async ({ family, amount, currentUID, currentUserData, lang }) => {
    if (!amount || amount <= 0 || !family?.id) return;
    const don = family.memberDonations?.[currentUID] || { weekly:0, total:0, weeklyIntel:0, totalIntel:0 };
    const ft3Key = `ft3_${currentUID}`;
    const ft3Prog = family.taskProgress?.[ft3Key] || { current:0, claimed:false };
    const newFt3 = ft3Prog.claimed ? ft3Prog.current : Math.min(500, (ft3Prog.current || 0) + amount);

    await familiesCollection.doc(family.id).update({
        treasury: firebase.firestore.FieldValue.increment(amount),
        activeness: firebase.firestore.FieldValue.increment(amount),
        weeklyActiveness: firebase.firestore.FieldValue.increment(amount),
        [`memberDonations.${currentUID}.weekly`]: (don.weekly || 0) + amount,
        [`memberDonations.${currentUID}.total`]: (don.total || 0) + amount,
        [`memberDonations.${currentUID}.weeklyIntel`]: (don.weeklyIntel || 0) + amount,
        [`memberDonations.${currentUID}.totalIntel`]: (don.totalIntel || 0) + amount,
        ...(ft3Prog.claimed ? {} : { [`taskProgress.${ft3Key}.current`]: newFt3 }),
        lastActivity: TS(),
    });
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
    await postNews(family.id, 'donation', lang === 'ar' ? `${currentUserData?.displayName} تبرع بـ ${amount} إنتل` : `${currentUserData?.displayName} donated ${amount} Intel`, amount);
};

// ─────────────────────────────────────────────────────────────────────────────
// 📰 NEWS & SYSTEM MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

const postNews = async (familyId, type, text, amount = 0) => {
    if (!familyId) return;
    try {
        await newsLogCollection.add({
            familyId, type, text, amount: amount || 0, timestamp: TS(),
        });
    } catch (e) {
        console.error('FamilyService.postNews:', e);
    }
};

const postSystemMessage = async (familyId, text) => {
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
const kickMember = async ({ family, targetUID, currentUID, lang }) => {
    if (!family?.id || targetUID === family.createdBy) return;
    
    // Authorization check
    const myRole = getFamilyRole(family, currentUID);
    if (!['owner', 'admin'].includes(myRole)) throw new Error('Unauthorized');
    if (myRole === 'admin' && getFamilyRole(family, targetUID) === 'admin') throw new Error('Admins cannot kick admins');

    const updRoles = { ...family.memberRoles }; delete updRoles[targetUID];
    const updDons = { ...family.memberDonations }; delete updDons[targetUID];
    
    await familiesCollection.doc(family.id).update({
        members: firebase.firestore.FieldValue.arrayRemove(targetUID),
        memberRoles: updRoles, memberDonations: updDons,
    });
    
    await usersCollection.doc(targetUID).update({
        familyId: null, familyName: null, familyTag: null,
        familySignLevel: null, familySignColor: null, familySignImageURL: null,
    });
    
    await postSystemMessage(family.id, lang === 'ar' ? `🚪 تم طرد أحد الأعضاء` : `🚪 A member was kicked`);
    await postNews(family.id, 'leave', lang === 'ar' ? `🚪 تم طرد أحد الأعضاء` : `🚪 A member was kicked`);
};

/**
 * Sets a member's role (Manager only).
 */
const setMemberRole = async ({ family, targetUID, newRole, currentUID, lang }) => {
    if (!family?.id || targetUID === family.createdBy) return;
    const myRole = getFamilyRole(family, currentUID);
    
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
const handleJoinRequest = async ({ family, targetUID, accept, lang }) => {
    if (!family?.id) return;
    const updates = { joinRequests: firebase.firestore.FieldValue.arrayRemove(targetUID) };
    
    if (accept) {
        updates[`memberRoles.${targetUID}`] = 'member';
        updates[`memberDonations.${targetUID}`] = { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 };
        updates.members = firebase.firestore.FieldValue.arrayUnion(targetUID);
        
        await familiesCollection.doc(family.id).update(updates);
        
        // Update user document
        const signData = getFamilySignLevelData(family.lastWeekActiveness || 0);
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
const saveTag = async ({ family, newTag, currentUID }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return;
    const clean = newTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (clean.length < 3) throw new Error('Tag too short');
    
    const tagCheck = await familiesCollection.where('tag', '==', clean).get();
    const alreadyMine = tagCheck.docs.some(d => d.id === family.id);
    if (!tagCheck.empty && !alreadyMine) throw new Error('Tag already taken');
    
    await familiesCollection.doc(family.id).update({ tag: clean });
    
    // Propagate to all members
    const batch = db.batch();
    (family.members || []).forEach(uid => {
        batch.update(usersCollection.doc(uid), { familyTag: clean });
    });
    await batch.commit();
};

/**
 * Updates general family info (Description, Announcement, Emblem, Photo).
 */
const saveInfo = async ({ family, updates, currentUID }) => {
    if (!family?.id || !canManageFamily(family, currentUID)) return;
    await familiesCollection.doc(family.id).update({
        ...updates,
        lastActivity: TS(),
    });
};

/**
 * Loads family list for discovery.
 */
const loadFamilies = async (limit = 30) => {
    const snap = await familiesCollection.orderBy('activeness', 'desc').limit(limit).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Searches for a family by tag.
 */
const searchFamilyByTag = async (tag) => {
    const clean = tag.trim().toUpperCase();
    const snap = await familiesCollection.where('tag', '==', clean).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─────────────────────────────────────────────────────────────────────────────
// 💬 CHAT & MESSAGING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a message to the family chat.
 */
const sendMessage = async ({ familyId, currentUID, currentUserData, text, image, type = 'text' }) => {
    if (!familyId || (!text?.trim() && !image)) return;
    
    const msgData = {
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
const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) { reject('No file'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const MAX_SIZE = 800;
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
const claimDailyMilestoneChest = async ({ family, currentUID, msIdx, ms, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    const today = new Date().toDateString();
    const dailyPtsKey = `dailyPts_${today}_${currentUID}`;
    const myDailyPoints = family[dailyPtsKey] || 0;
    if (myDailyPoints < ms.points) return;

    const claimKey = `dailyChestClaim_${today}_${currentUID}_${msIdx}`;
    if (family[claimKey]) return;

    try {
        await familiesCollection.doc(family.id).update({
            [claimKey]: true,
            lastActivity: TS(),
        });

        // Give rewards (simplified logic for now)
        const userRef = usersCollection.doc(currentUID);
        const updates = {};
        if (ms.reward?.intel) updates.currency = firebase.firestore.FieldValue.increment(ms.reward.intel);
        if (Object.keys(updates).length > 0) await userRef.update(updates);

        if (onNotification) onNotification(lang === 'ar' ? '✅ تم استلام الصندوق!' : '✅ Chest claimed!');
    } catch (e) {
        console.error(e);
    }
};

/**
 * Claims a family task.
 */
const claimTask = async ({ family, currentUID, task, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    const key = `${task.id}_${currentUID}`;
    const taskProgress = family.taskProgress || {};
    const prog = taskProgress[key] || { current: 0, claimed: false };
    if (prog.current < task.target || prog.claimed) return;

    try {
        const today = new Date().toDateString();
        const dailyPtsKey = `dailyPts_${today}_${currentUID}`;
        
        await familiesCollection.doc(family.id).update({
            [`taskProgress.${key}.claimed`]: true,
            [dailyPtsKey]: firebase.firestore.FieldValue.increment(task.reward?.points || 0),
            treasury: firebase.firestore.FieldValue.increment(task.reward?.intel || 0),
            activeness: firebase.firestore.FieldValue.increment(task.reward?.intel || 0),
            weeklyActiveness: firebase.firestore.FieldValue.increment(task.reward?.intel || 0),
            familyCoins: firebase.firestore.FieldValue.increment(task.reward?.coins || 0),
            lastActivity: TS(),
        });

        const userRef = usersCollection.doc(currentUID);
        const userUpdates = {};
        if (task.reward?.intel) userUpdates.currency = firebase.firestore.FieldValue.increment(task.reward.intel);
        if (task.reward?.xp) userUpdates.xp = firebase.firestore.FieldValue.increment(task.reward.xp);
        if (Object.keys(userUpdates).length > 0) await userRef.update(userUpdates);

        if (onNotification) onNotification(lang === 'ar' ? '✅ تم استلام المكافأة!' : '✅ Reward claimed!');
    } catch (e) {
        console.error(e);
    }
};

/**
 * Handles daily check-in task.
 */
const handleCheckIn = async ({ family, currentUID, lang, onNotification }) => {
    if (!family?.id || !currentUID) return;
    const today = new Date().toDateString();
    const key = `ft4_${currentUID}`;
    const taskProgress = family.taskProgress || {};
    const prog = taskProgress[key] || { current: 0, claimed: false, lastCheckIn: '' };
    
    if (prog.lastCheckIn === today) {
        if (onNotification) onNotification(lang === 'ar' ? '✅ قمت بتسجيل الحضور اليوم' : '✅ Already checked in today');
        return;
    }

    try {
        await familiesCollection.doc(family.id).update({
            [`taskProgress.${key}.current`]: firebase.firestore.FieldValue.increment(1),
            [`taskProgress.${key}.lastCheckIn`]: today,
            lastActivity: TS(),
        });
        if (onNotification) onNotification(lang === 'ar' ? '✅ تم تسجيل الحضور!' : '✅ Checked in!');
    } catch (e) {
        console.error(e);
    }
};

/**
 * Purchases an item from the family shop.
 */
const buyShopItem = async ({ currentUID, family, item, lang, onNotification }) => {
    if (!currentUID || !family?.id || !item) return;
    const coins = family.familyCoins || 0;
    const purchases = family.shopPurchases || {};

    if (coins < item.cost) {
        onNotification(lang==='ar' ? `❌ تحتاج ${item.cost}${FAMILY_COINS_SYMBOL}` : `❌ Need ${item.cost}${FAMILY_COINS_SYMBOL}`);
        return;
    }

    try {
        const key = `${currentUID}_${item.id}`;
        if (purchases[key]) {
            onNotification(lang==='ar' ? '✅ اشتريت هذا بالفعل' : '✅ Already purchased');
            return;
        }

        await familiesCollection.doc(family.id).update({
            familyCoins: firebase.firestore.FieldValue.increment(-item.cost),
            [`shopPurchases.${key}`]: true,
        });

        // Grant to user inventory based on type
        const inventoryKey = 
            item.type === 'badge' ? 'inventory.badges' : 
            item.type === 'title' ? 'inventory.titles' : 
            item.type === 'theme' ? 'inventory.themes' : 
            item.type === 'frame' ? 'inventory.frames' : 
            item.type === 'profileEffect' ? 'inventory.profileEffects' :
            item.type === 'gift' ? 'inventory.gifts' : null;

        if (inventoryKey) {
            const updatePayload = {
                [inventoryKey]: firebase.firestore.FieldValue.arrayUnion(item.id),
            };
            if (item.type === 'gift') {
                updatePayload[`inventory.giftCounts.${item.id}`] = firebase.firestore.FieldValue.increment(item.qty || 1);
            }
            if (item.id !== 'gift_ring') {
                const dDays = item.durationDays || 30;
                updatePayload[`inventory.expiry.${item.id}`] = Date.now() + (dDays * 86400000);
            }
            await usersCollection.doc(currentUID).update(updatePayload);
        }

        const typeLabel = lang === 'ar'
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
