(function () {
    var { useEffect, useRef } = React;

    window.useGiftListener = function (currentUID, giftOverlayQueue, setGiftOverlayQueue, currentContext) {
        var lastDocId = useRef(null);
        var pendingGroups = useRef({}); // Key -> { timeout, entry }
        var contextRef = useRef(currentContext);
        var sessionStartTime = useRef(Date.now());

        useEffect(() => {
            contextRef.current = currentContext;
        }, [currentContext]);

        // --- Persistence Logic: Prevent repeat animations on refresh ---
        var SEEN_KEY = 'gw_seen_gifts_' + currentUID;
        var DEFERRED_KEY = 'gw_deferred_gifts_' + currentUID;

        var getSeenMap = () => {
            try {
                var data = localStorage.getItem(SEEN_KEY);
                return data ? JSON.parse(data) : {};
            } catch (e) { return {}; }
        };
        var saveSeenMap = (map) => {
            try {
                var now = Date.now();
                var cleanMap = {};
                var count = 0;
                for (var id in map) {
                    if (now - map[id] < 120 * 60 * 1000) {
                        cleanMap[id] = map[id];
                        count++;
                    }
                    if (count > 200) break;
                }
                localStorage.setItem(SEEN_KEY, JSON.stringify(cleanMap));
            } catch (e) { }
        };

        var getDeferredGifts = () => {
            try {
                var data = localStorage.getItem(DEFERRED_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) { return []; }
        };
        var addDeferredGift = (giftData) => {
            var deferred = getDeferredGifts();
            if (deferred.some(g => g.docId === giftData.docId)) return;
            deferred.push(giftData);
            localStorage.setItem(DEFERRED_KEY, JSON.stringify(deferred));
        };

        // --- GLOBAL TRIGGER FOR MANUAL/CATCH-UP ---
        window.triggerGiftManual = function (docId, data) {
            if (!docId || !data) return;
            var seen = getSeenMap();
            // deduplicate using shared eventId if available, fallback to docId
            var persistenceKey = data.giftEventId || docId;
            if (seen[persistenceKey]) return;

            // Only process if high tier
            var giftData = findGiftDataById(data.giftId);
            if (!giftData) return;

            var highRarities = ['Legendary', 'Mythic', 'Divine', 'Special', 'Vip'];
            var itemRarity = data.rarity || giftData.rarity || 'Common';
            var isHighTier = (giftData.cost >= 10000) || highRarities.includes(itemRarity);

            if (isHighTier) {
                processGiftEvent(docId, { ...data, _isManual: true });
            }

            // Mark as seen
            seen[persistenceKey] = Date.now();
            saveSeenMap(seen);
        };

        useEffect(() => {
            if (!currentUID || !giftsLogCollection) return;

            var fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            var unsubscribe = giftsLogCollection
                .where('timestamp', '>', fiveMinutesAgo)
                .orderBy('timestamp', 'desc')
                .limit(15)
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            var doc = change.doc;
                            var data = doc.data();

                            var seenMap = getSeenMap();
                            var persistenceKey = data.giftEventId || doc.id;
                            if (seenMap[persistenceKey]) return;
                            if (lastDocId.current === doc.id) return;
                            if (data.senderId !== currentUID && data.receiverId !== currentUID) return;

                            seenMap[persistenceKey] = Date.now();
                            saveSeenMap(seenMap);
                            lastDocId.current = doc.id;

                            // Context check for live events
                            var giftOrigin = data.originContext || 'global';
                            if (giftOrigin !== 'global' && giftOrigin !== contextRef.current) {
                                addDeferredGift({ docId: doc.id, ...data });
                                return;
                            }

                            processGiftEvent(doc.id, data);
                        }
                    });
                }, (err) => console.error('[GiftListener] Error:', err));

            return () => unsubscribe();
        }, [currentUID]);

        // --- CATCH-UP EFFECT: Play deferred gifts when entering context ---
        useEffect(() => {
            if (!currentUID || !currentContext || currentContext === 'lobby') return;

            var deferred = getDeferredGifts();
            var matches = deferred.filter(g => g.originContext === currentContext);

            if (matches.length > 0) {
                matches.forEach(gift => {
                    var seenMap = getSeenMap();
                    if (!seenMap[gift.docId]) {
                        processGiftEvent(gift.docId, { ...gift, _isManual: true });
                    }
                });
                var matchIds = new Set(matches.map(m => m.docId));
                var remaining = deferred.filter(g => !matchIds.has(g.docId));
                localStorage.setItem(DEFERRED_KEY, JSON.stringify(remaining));
            }
        }, [currentContext, currentUID]);

        function processGiftEvent(docId, data) {
            var giftData = findGiftDataById(data.giftId);
            if (!giftData) return;

            var highRarities = ['Legendary', 'Mythic', 'Divine', 'Special', 'Vip'];
            var itemRarity = data.rarity || giftData.rarity || 'Common';
            var isHighTier = (giftData.cost >= 10000) || highRarities.includes(itemRarity);

            if (!isHighTier) return;

            if (!data._isManual) {
                var giftOrigin = data.originContext || 'global';
                if (giftOrigin === 'global') {
                    var docTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
                    if (docTime < sessionStartTime.current - 10000) return;
                }
            }

            var groupKey = data.senderId + "_" + (data.receiverId || 'all') + "_" + data.giftId;

            if (pendingGroups.current[groupKey]) {
                var group = pendingGroups.current[groupKey];
                group.entry.quantity += (data.qty || 1);

                setGiftOverlayQueue(prev => {
                    return prev.map(item => {
                        if (item.groupKey === groupKey && item.id === group.entry.id) {
                            return { ...item, quantity: group.entry.quantity };
                        }
                        return item;
                    });
                });
                return;
            }

            var newEntry = {
                id: docId,
                groupKey: groupKey,
                giftId: data.giftId,
                giftName_en: data.giftName_en || giftData?.name_en || "",
                giftName_ar: data.giftName_ar || giftData?.name_ar || "",
                giftImageUrl: data.giftImageUrl,
                giftEmoji: data.giftEmoji,
                senderName: data.senderName,
                receiverName: data.receiverName || (data.originContext === 'public' ? 'Public' : 'Someone'),
                receiverId: data.receiverId,
                quantity: data.qty || 1,
                timestamp: Date.now(),
                description: data.giftDesc_en || giftData?.desc_en || "",
                descriptionAr: data.giftDesc_ar || giftData?.desc_ar || "",
                charisma: giftData?.charisma || 0,
                rarity: itemRarity,
                sound: giftData?.sound || "",
                bonusAmount: giftData ? (window.generateRandomBonus ? window.generateRandomBonus(giftData.minBonus || 0, giftData.maxBonus || 0, giftData.cost) : 0) : 0
            };

            setGiftOverlayQueue(prev => [...prev, newEntry]);

            pendingGroups.current[groupKey] = {
                entry: newEntry,
                timeout: setTimeout(() => {
                    delete pendingGroups.current[groupKey];
                }, 2000)
            };
        }

        function findGiftDataById(giftId) {
            var items = window.GIFT_DATA || window.SHOP_ITEMS;
            if (!items) return null;
            var categories = ['gifts', 'gifts_vip', 'gifts_family', 'gifts_special', 'gifts_flag'];
            for (var cat of categories) {
                var found = (items[cat] || []).find(g => g.id === giftId);
                if (found) return found;
            }
            return null;
        }
    };
})();
