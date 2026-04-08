(function () {
    const { useEffect, useState } = React;

    /**
     * UpdateModal Component
     * Notifies users when a new version of the app is available.
     */
    const UpdateModal = ({ show, remoteVersion, updateNotes, lang, onUpdate, onSnooze }) => {
        if (!show) return null;

        const t = {
            ar: {
                title: "تحديث جديد متوفر",
                subtitle: "نسخة " + (remoteVersion || ""),
                description: "هناك تحديث جديد متاح للعبة. يرجى التحديث للحصول على آخر المميزات والتحسينات.",
                button: "تحديث الآن",
                later: "تحديث لاحقاً",
                notesTitle: "ما الجديد:"
            },
            en: {
                title: "New Update Available",
                subtitle: "Version " + (remoteVersion || ""),
                description: "A new version of the game is available. Please update to get the latest features and fixes.",
                button: "Update Now",
                later: "Update Later",
                notesTitle: "What's New:"
            }
        };

        const content = t[lang] || t.en;

        return (
            React.createElement(PortalModal, null,
                React.createElement("div", { 
                    className: "modal-overlay", 
                    style: { zIndex: window.Z.OVERLAY, background: 'rgba(5, 5, 15, 0.9)', backdropFilter: 'blur(10px)' } 
                },
                    React.createElement("div", { 
                        className: "modal-content animate-pop", 
                        style: { maxWidth: '400px', border: '1px solid rgba(0, 242, 255, 0.3)', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)' } 
                    },
                        React.createElement("div", { 
                            style: { textAlign: 'center', marginBottom: '24px' } 
                        },
                            React.createElement("div", { 
                                style: { fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.5))' } 
                            }, "🚀"),
                            React.createElement("h2", { 
                                style: { fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px' } 
                            }, content.title),
                            React.createElement("div", { 
                                style: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0, 242, 255, 0.1)', border: '1px solid rgba(0, 242, 255, 0.4)', color: '#00f2ff', fontSize: '12px', fontWeight: 800 } 
                            }, content.subtitle)
                        ),

                        React.createElement("div", { 
                            style: { marginBottom: '24px', textAlign: 'center' } 
                        },
                            React.createElement("p", { 
                                style: { color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 } 
                            }, content.description)
                        ),

                        updateNotes && React.createElement("div", { 
                            style: { marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' } 
                        },
                            React.createElement("h3", { 
                                style: { fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' } 
                            }, "✨ ", content.notesTitle),
                            React.createElement("p", { 
                                style: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'pre-wrap', lineHeight: 1.5 } 
                            }, updateNotes)
                        ),

                        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
                            React.createElement("button", {
                                className: "btn-neon",
                                onClick: onUpdate,
                                style: { width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 900, boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)' }
                            }, content.button),

                            React.createElement("button", {
                                className: "btn-ghost",
                                onClick: onSnooze,
                                style: { width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.2)' }
                            }, content.later)
                        )
                    )
                )
            )
        );
    };

    window.UpdateModal = UpdateModal;
})();
