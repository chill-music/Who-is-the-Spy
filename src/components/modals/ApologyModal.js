(function () {
    const { useEffect, useState } = React;

    /**
     * ApologyModal Component
     * Displays a red notification after a critical forced update.
     */
    const ApologyModal = ({ show, remoteVersion, adminMessage, lang, onConfirm }) => {
        if (!show) return null;

        const t = {
            ar: {
                title: "تم استعادة استقرار النظام",
                apology: "نعتذر عن الإزعاج، ولكن كان من الضروري تحديث الموقع فوراً بسبب مشكلة فنية كبيرة.",
                versionLabel: "الإصدار الجديد",
                adminLabel: "رسالة الإدارة:",
                button: "فهمت"
            },
            en: {
                title: "System Integrity Restored",
                apology: "We apologize for the inconvenience, but the site was updated immediately due to a major technical problem.",
                versionLabel: "New Version",
                adminLabel: "Admin Message:",
                button: "Understood"
            }
        };

        const content = t[lang] || t.en;

        return (
            React.createElement(PortalModal, null,
                React.createElement("div", { 
                    className: "modal-overlay", 
                    style: { zIndex: window.Z ? window.Z.OVERLAY + 1000 : 999999, background: 'rgba(5, 5, 15, 0.95)', backdropFilter: 'blur(15px)' } 
                },
                    React.createElement("div", { 
                        className: "modal-content animate-pop", 
                        style: { 
                            maxWidth: '420px', 
                            border: '1px solid rgba(239, 68, 68, 0.4)', 
                            background: 'linear-gradient(135deg, #1a0a0a, #2e1a1a)',
                            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
                        } 
                    },
                        React.createElement("div", { 
                            style: { textAlign: 'center', marginBottom: '24px' } 
                        },
                            React.createElement("div", { 
                                style: { fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))' } 
                            }, "⚠️"),
                            React.createElement("h2", { 
                                style: { fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' } 
                            }, content.title),
                            React.createElement("div", { 
                                style: { 
                                    display: 'inline-flex', 
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 16px', 
                                    borderRadius: '20px', 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    border: '1px solid rgba(239, 68, 68, 0.4)', 
                                    color: '#f87171', 
                                    fontSize: '13px', 
                                    fontWeight: 800 
                                } 
                            }, 
                                React.createElement("span", { style: { opacity: 0.6 } }, content.versionLabel + ":"),
                                React.createElement("span", null, remoteVersion || "???")
                            )
                        ),

                        React.createElement("div", { 
                            style: { marginBottom: '24px', textAlign: 'center' } 
                        },
                            React.createElement("p", { 
                                style: { color: '#fca5a5', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 } 
                            }, content.apology)
                        ),

                        adminMessage && React.createElement("div", { 
                            style: { 
                                marginBottom: '28px', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                background: 'rgba(0, 0, 0, 0.3)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                textAlign: 'left'
                            } 
                        },
                            React.createElement("h3", { 
                                style: { fontSize: '12px', fontWeight: 800, color: '#f87171', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' } 
                            }, "💬 " + content.adminLabel),
                            React.createElement("p", { 
                                style: { fontSize: '14px', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontStyle: 'italic' } 
                            }, adminMessage)
                        ),

                        React.createElement("button", {
                            className: "btn-neon",
                            onClick: onConfirm,
                            style: { 
                                width: '100%', 
                                padding: '18px', 
                                borderRadius: '14px', 
                                fontSize: '16px', 
                                fontWeight: 900, 
                                background: '#ef4444',
                                color: '#fff',
                                boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
                                border: 'none',
                                cursor: 'pointer'
                            }
                        }, content.button)
                    )
                )
            )
        );
    };

    window.ApologyModal = ApologyModal;
})();
