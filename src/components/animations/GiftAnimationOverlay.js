(function () {
    var { useState, useEffect, useRef } = React;

    window.GiftAnimationOverlay = function ({ queue, setQueue, lang }) {
        var [activeGift, setActiveGift] = useState(null);
        var [isExiting, setIsExiting] = useState(false);
        var audioRef = useRef(null);

        // Translate helper
        var t = function (key) {
            if (window.TRANSLATIONS && window.TRANSLATIONS[lang] && window.TRANSLATIONS[lang][key]) {
                return window.TRANSLATIONS[lang][key];
            }
            if (window.getTranslation) return window.getTranslation(key);
            return key;
        };

        useEffect(() => {
            // Sync quantity live if the first item in the queue updates (e.g., from useGiftListener)
            if (activeGift && queue.length > 0) {
                var currentInQueue = queue[0];
                if (currentInQueue.id === activeGift.id && currentInQueue.quantity !== activeGift.quantity) {
                    setActiveGift(prev => ({ ...prev, quantity: currentInQueue.quantity }));
                }
            }
        }, [queue, activeGift]);

        useEffect(() => {
            // Pick next gift only when nothing is showing
            if (activeGift) return;
            if (queue.length > 0) {
                setActiveGift(queue[0]);
                setIsExiting(false);
            }
        }, [queue, activeGift]);

        useEffect(() => {
            if (!activeGift) return;

            // 1. Play Sound (if provided)
            if (activeGift.sound && activeGift.sound.trim() !== '') {
                try {
                    var audio = new Audio(activeGift.sound);
                    audio.volume = 0.8;
                    audio.play().catch(function (err) {
                        console.warn('[GiftOverlay] Sound blocked:', err);
                    });
                    audioRef.current = audio;
                } catch (e) {
                    console.error('[GiftOverlay] Sound error:', e);
                }
            }

            // 2. Set Timer to Dismiss (increase duration to 4.5s for premium feel)
            var dismissTimer = setTimeout(function () {
                setIsExiting(true);
                // Wait for premium exit animation (0.8s)
                setTimeout(function () {
                    setActiveGift(null);
                    setQueue(function (prev) { return prev.slice(1); });
                }, 800);
            }, 4500);

            return function () {
                clearTimeout(dismissTimer);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            };
        }, [activeGift]);

        if (!activeGift) return null;

        // Visual metadata
        var rarity = activeGift.rarity || 'Common';
        var hasImage = activeGift.giftImageUrl && activeGift.giftImageUrl !== '';

        // Final name mapping with better fallbacks
        var finalGiftName = (lang === 'ar' ? activeGift.giftName_ar : activeGift.giftName_en) || activeGift.giftName || "Gift";
        var finalSenderName = activeGift.senderName || "Unknown";
        var finalReceiverName = activeGift.receiverName || "Someone";

        // Build the sender sentence correctly using translated keys
        var qtyPrefix = activeGift.quantity > 1 ? (activeGift.quantity + 'x ') : '';
        var senderSentence = finalSenderName + ' ' + t('sent') + ' ' + qtyPrefix + finalGiftName + ' ' + t('toPlayer') + ' ' + finalReceiverName;

        return /*#__PURE__*/React.createElement("div", { className: "gw-premium-overlay " + (isExiting ? 'gw-gift-exiting-premium' : '') },

            /* Dynamic Glow Background Layer */
            /*#__PURE__*/React.createElement("div", {
            className: "gw-glow-background rarity-" + rarity
        }),

            /* Hero Container */
            /*#__PURE__*/React.createElement("div", { className: "gw-gift-hero-container" },

                /* Gift Visual Area */
                /*#__PURE__*/React.createElement("div", { className: "gw-gift-hero-image-wrap" },
            hasImage ?
                        /*#__PURE__*/React.createElement("img", {
                src: activeGift.giftImageUrl,
                className: "gw-gift-hero-img",
                alt: finalGiftName,
                onError: (e) => { e.target.style.display = 'none'; }
            }) :
                        /*#__PURE__*/React.createElement("span", { className: "gw-gift-hero-emoji" }, activeGift.giftEmoji || "🎁"),

            /* Floating Quantity Badge */
            activeGift.quantity > 1 && /*#__PURE__*/React.createElement("div", {
                className: "gw-gift-hero-qty",
                key: activeGift.quantity
            },
                "x", activeGift.quantity
            )
        ),

                /* Cinematic Text Stack */
                /*#__PURE__*/React.createElement("div", { className: "gw-gift-text-stack" },
                    /*#__PURE__*/React.createElement("div", { className: "gw-gift-sender-text" }, senderSentence),
                    /*#__PURE__*/React.createElement("div", { className: "gw-gift-name-text" }, finalGiftName),
            (activeGift.description || activeGift.descriptionAr) && /*#__PURE__*/React.createElement("div", { className: "gw-gift-desc-text" }, lang === 'ar' ? activeGift.descriptionAr : activeGift.description)
        ),

                /* Premium Reward Chips */
                /*#__PURE__*/React.createElement("div", { className: "gw-reward-chips-row" },
                    /* Charisma Chip */
                    /*#__PURE__*/React.createElement("div", { className: "gw-reward-chip star" },
                        /*#__PURE__*/React.createElement("i", null, "⭐"),
            "+", ((activeGift.charisma || 0) * (activeGift.quantity || 1)).toLocaleString(), " ", (lang === 'ar' ? "كاريزما" : "Charisma")
        ),
            /* Intel/Bonus Chip */
            activeGift.bonusAmount > 0 && /*#__PURE__*/React.createElement("div", { className: "gw-reward-chip coin" },
                        /*#__PURE__*/React.createElement("i", null, "🧠"),
                "+", ((activeGift.bonusAmount || 0) * (activeGift.quantity || 1)).toLocaleString(), " ", (lang === 'ar' ? "إنتل" : "Intel")
            )
        )
        )
        );
    };
})();
