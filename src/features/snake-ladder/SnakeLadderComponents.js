(function() {
    const { useState } = React;
    const el = React.createElement;

    /**
     * SnakeLadderModeSelector
     * Game-specific setup component for Snake & Ladder Pro
     */
    const SnakeLadderModeSelector = ({ 
        lang = 'ar', 
        onSelectMode, 
        onClose,
        isLoggedIn, 
        isGuest, 
        requireLogin,
        loading = false
    }) => {
        const t = {
            ar: {
                title: 'تجهيز اللعبة',
                subtitle: 'اختر نمط اللعب المفضل لديك',
                online: 'لعب أونلاين',
                onlineDesc: 'العب مع لاعبين عشوائيين من اللوبي',
                private: 'غرفة خاصة',
                privateDesc: 'العب مع أصدقائك عبر كود الغرفة',
                createBtn: 'إنشاء الغرفة',
                cancel: 'إلغاء',
                fee: 'القيمة:'
            },
            en: {
                title: 'Setup Game',
                subtitle: 'Choose your preferred play mode',
                online: 'Play Online',
                onlineDesc: 'Play with random players from the lobby',
                private: 'Private Room',
                privateDesc: 'Play with your friends via room code',
                createBtn: 'Create Room',
                cancel: 'Cancel',
                fee: 'Fee:'
            }
        }[lang];

        const [mode, setMode] = useState('online'); // 'online' or 'private'
        const [password, setPassword] = useState('');

        const handleConfirm = () => {
            if (!isLoggedIn && !isGuest) {
                requireLogin();
                return;
            }
            
            onSelectMode('normal', {
                isPrivate: mode === 'private',
                password: mode === 'private' ? password : null,
                setupMode: 'normal' // Fixed mode for now
            });
        };

        return el('div', { 
            className: 'snl-modal-fixed fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300',
            style: { background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' },
            onClick: onClose
        },
            el('div', { 
                className: 'snl-mode-selector-card w-full max-w-sm bg-[#0a0a1a] rounded-[2rem] border border-[rgba(16,185,129,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 p-8 relative overflow-hidden animate-in zoom-in-95 duration-300',
                onClick: (e) => e.stopPropagation() 
            },
                // Background Glow
                el('div', { className: 'absolute -top-24 -left-24 w-48 h-48 bg-[#10b981] opacity-10 blur-[80px]' }),
                el('div', { className: 'absolute -bottom-24 -right-24 w-48 h-48 bg-[#10b981] opacity-10 blur-[80px]' }),

                // Close Btn
                el('button', {
                    onClick: onClose,
                    className: "absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10"
                }, "✕"),

                // Header
                el('div', { className: 'snl-sel-header relative z-10' },
                    el('div', { className: 'text-4xl mb-3 flex justify-center' }, '🎲'),
                    el('h2', { className: 'snl-sel-title text-2xl font-black text-[#10b981] text-center mb-1' }, t.title),
                    el('p', { className: 'snl-sel-subtitle text-xs text-white/50 text-center font-medium uppercase tracking-wider' }, t.subtitle)
                ),

                // Mode Selection
                el('div', { className: 'snl-sel-modes flex flex-col gap-3 relative z-10' },
                    // Online Mode
                    el('div', { 
                        className: `snl-mode-card group flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all duration-300 border ${mode === 'online' ? 'bg-[#10b981]/10 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`,
                        onClick: () => { setMode('online'); }
                    },
                        el('div', { className: `w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 ${mode === 'online' ? 'scale-110' : 'group-hover:scale-105'}` }, '🌐'),
                        el('div', { className: 'flex-1 min-w-0' },
                            el('div', { className: `text-sm font-black transition-colors ${mode === 'online' ? 'text-[#10b981]' : 'text-white'}` }, t.online),
                            el('div', { className: 'text-[10px] text-white/40 font-bold leading-tight mt-0.5' }, t.onlineDesc)
                        ),
                        mode === 'online' && el('div', { className: 'w-6 h-6 rounded-full bg-[#10b981] text-black flex items-center justify-center font-black text-xs animate-in zoom-in duration-300' }, '✓')
                    ),

                    // Private Mode
                    el('div', { 
                        className: `snl-mode-card group flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all duration-300 border ${mode === 'private' ? 'bg-[#10b981]/10 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`,
                        onClick: () => { setMode('private'); }
                    },
                        el('div', { className: `w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 ${mode === 'private' ? 'scale-110' : 'group-hover:scale-105'}` }, '🔒'),
                        el('div', { className: 'flex-1 min-w-0' },
                            el('div', { className: `text-sm font-black transition-colors ${mode === 'private' ? 'text-[#10b981]' : 'text-white'}` }, t.private),
                            el('div', { className: 'text-[10px] text-white/40 font-bold leading-tight mt-0.5' }, t.privateDesc)
                        ),
                        mode === 'private' && el('div', { className: 'w-6 h-6 rounded-full bg-[#10b981] text-black flex items-center justify-center font-black text-xs animate-in zoom-in duration-300' }, '✓')
                    )
                ),

                // Private Password Input
                mode === 'private' && el('div', { className: 'snl-password-area animate-in slide-in-from-top-4 duration-300 relative z-10' },
                    el('input', {
                        type: 'text',
                        className: 'w-full bg-black/40 border border-white/10 focus:border-[#10b981] px-5 py-4 rounded-2xl text-white text-sm outline-none transition-all placeholder:text-white/20 font-bold',
                        placeholder: lang === 'ar' ? 'كلمة السر الاختيارية' : 'Optional Password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value)
                    })
                ),

                // Footer / Actions
                el('div', { className: 'snl-sel-footer relative z-10' },
                    el('button', { 
                        className: `w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${
                            loading 
                                ? 'bg-white/10 text-white/30 cursor-wait' 
                                : 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.6)]'
                        }`,
                        onClick: handleConfirm,
                        disabled: loading
                    }, 
                        loading && el('div', { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
                        loading ? (lang === 'ar' ? 'جاري التحميل...' : 'LOADING...') : t.createBtn
                    )
                ),

                // Local CSS
                el('style', null, `
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .animate-in { animation-fill-mode: forwards; }
                    .fade-in { animation-name: fade-in; }
                    .zoom-in-95 { animation-name: zoom-in; }
                `)
            )
        );
    };

    window.SnakeLadderModeSelector = SnakeLadderModeSelector;
})();
