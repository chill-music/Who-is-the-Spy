(function() {
    const { useState, useEffect } = React;
    const el = React.createElement;

    /**
     * SnakeLadderModeSelector
     * Premium modal for selecting Snake & Ladder game modes.
     */
    window.SnakeLadderModeSelector = ({ user, nickname, lang, onClose, onSelectMode }) => {
        const [showCreateRoom, setShowCreateRoom] = useState(false);
        const [requirePassword, setRequirePassword] = useState(true);
        const [showParty, setShowParty] = useState(false);
        const [showBots, setShowBots] = useState(false);
        const [partyCount, setPartyCount] = useState(2);
        const [botCount, setBotCount] = useState(1);
        const [partyNames, setPartyNames] = useState([
            lang === 'ar' ? 'لاعب 2' : 'Player 2',
            lang === 'ar' ? 'لاعب 3' : 'Player 3',
            lang === 'ar' ? 'لاعب 4' : 'Player 4'
        ]);
        const [password, setPassword] = useState('');
        const logoUrl = 'icos/snake-ladder/SnakeLadderloge.png';

        const t = {
            ar: {
                title: 'السلم والثعبان برو',
                subtitle: 'اختر وضع اللعبة المفضل لديك',
                online: 'لعب أونلاين',
                onlineDesc: 'العب مع لاعبين من كل مكان',
                private: 'غرفة خاصة',
                privateDesc: 'العب مع أصحابك بكود سري',
                offline: 'وضع القهوة (أوفلاين)',
                offlineDesc: 'العب مع أصحابك على نفس الجهاز',
                bots: 'ضد الكمبيوتر',
                botsDesc: 'تدرب مع البوتات بأي وقت',
                createPrivate: 'إنشاء غرفة خاصة',
                back: 'رجوع',
                passPlaceholder: 'كلمة السر'
            },
            en: {
                title: 'Snake & Ladder Pro',
                subtitle: 'Choose your preferred game mode',
                online: 'Quick Match',
                onlineDesc: 'Play with players worldwide',
                private: 'Private Room',
                privateDesc: 'Play with friends via code',
                offline: 'Party Mode (Offline)',
                offlineDesc: 'Play with friends on same device',
                bots: 'Vs Computer',
                botsDesc: 'Practice with AI bots',
                createPrivate: 'Create Private Room',
                back: 'Back',
                passPlaceholder: 'Enter Password'
            }
        }[lang || 'ar'];

        const modalStyle = {
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(5, 5, 15, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
        };

        const contentStyle = {
            width: '100%',
            maxWidth: '400px',
            background: 'linear-gradient(180deg, rgba(20, 20, 45, 0.95), rgba(10, 10, 25, 1))',
            borderRadius: '32px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.1)',
            overflow: 'hidden',
            position: 'relative'
        };

        const bgLogoStyle = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '120%',
            height: '120%',
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url("${logoUrl}")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.08,
            pointerEvents: 'none',
            filter: 'blur(5px)'
        };

        const OptionButton = ({ icon, label, desc, color, onClick }) => el('button', {
            onClick,
            className: 'snl-mode-btn',
            style: {
                width: '100%',
                padding: '16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }
        },
            el('div', {
                style: {
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    border: `1px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px'
                }
            }, icon),
            el('div', { style: { flex: 1 } },
                el('div', { style: { color: '#fff', fontWeight: '900', fontSize: '15px' } }, label),
                el('div', { style: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px' } }, desc)
            ),
            el('div', { style: { color: color, fontSize: '18px' } }, '→')
        );

        return el('div', { className: 'modal-overlay animate-fadeIn', style: modalStyle, onClick: (e) => e.target === e.currentTarget && onClose() },
            el('div', { className: 'modal-content animate-pop', style: contentStyle, onClick: (e) => e.stopPropagation() },
                el('div', { style: bgLogoStyle }),
                
                // Header
                el('div', { className: 'p-6 pb-2 relative z-10' },
                    el('div', { className: 'flex justify-between items-start' },
                        el('div', null,
                            el('h2', { style: { color: '#10b981', fontWeight: '900', fontSize: '22px', letterSpacing: '-0.5px' } }, t.title),
                            el('p', { style: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', marginTop: '2px' } }, t.subtitle)
                        ),
                        el('button', { 
                            onClick: onClose,
                            className: 'w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white'
                        }, '✕')
                    )
                ),

                // Body
                el('div', { className: 'p-6 pt-4 relative z-10' },
                    !(showCreateRoom || showParty || showBots) ? el('div', { className: 'animate-in slide-in-from-right duration-300' },
                        OptionButton({
                            icon: '🌐', label: t.online, desc: t.onlineDesc, color: '#10b981',
                            onClick: () => onSelectMode('online', { isPrivate: false })
                        }),
                        OptionButton({
                            icon: '➕', label: lang === 'ar' ? 'إنشاء غرفة' : 'Create Room', desc: lang === 'ar' ? 'أنشئ غرفتك الخاصة' : 'Host your own room', color: '#a78bfa',
                            onClick: () => setShowCreateRoom(true)
                        }),
                        el('div', { className: 'my-4 flex items-center gap-3' },
                            el('div', { className: 'flex-1 h-px bg-white/5' }),
                            el('span', { className: 'text-[9px] font-black text-white/20 uppercase tracking-[0.2em]' }, 'local play'),
                            el('div', { className: 'flex-1 h-px bg-white/5' })
                        ),
                        OptionButton({
                            icon: '🎭', label: t.offline, desc: t.offlineDesc, color: '#f59e0b',
                            onClick: () => setShowParty(true)
                        }),
                        OptionButton({
                            icon: '🤖', label: t.bots, desc: t.botsDesc, color: '#3b82f6',
                            onClick: () => setShowBots(true)
                        })
                    ) : showCreateRoom ? (
                        el('div', { className: 'animate-in slide-in-from-left duration-300 space-y-4' },
                            el('div', { className: 'bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl' },
                                el('div', { style: { fontSize: '10px', fontWeight: '900', color: '#a78bfa', uppercase: true, letterSpacing: '1px', marginBottom: '12px' } }, lang === 'ar' ? '⚙️ إعدادات الغرفة' : '⚙️ ROOM SETTINGS'),
                                el('label', { className: 'flex items-center gap-3 mb-4 cursor-pointer p-3 bg-black/40 rounded-xl border border-purple-500/30' },
                                    el('input', {
                                        type: 'checkbox',
                                        checked: requirePassword,
                                        onChange: (e) => setRequirePassword(e.target.checked),
                                        className: 'w-5 h-5 accent-purple-500'
                                    }),
                                    el('span', { className: 'text-white font-bold text-sm' }, lang === 'ar' ? 'تتطلب كلمة مرور (غرفة خاصة)' : 'Require Password (Private)')
                                ),
                                requirePassword ? el('input', {
                                    type: 'text', placeholder: t.passPlaceholder, value: password,
                                    onChange: (e) => setPassword(e.target.value.toUpperCase()),
                                    className: 'w-full mb-2 bg-black/40 border border-purple-500/30 rounded-xl p-4 text-center text-white font-black text-lg focus:border-purple-500 outline-none transition-all'
                                }) : null,
                                el('button', {
                                    disabled: requirePassword && !password.trim(),
                                    onClick: () => onSelectMode('online', { isPrivate: requirePassword, isCustomRoom: true, password: requirePassword ? password : null }),
                                    className: 'w-full mt-4 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'
                                }, lang === 'ar' ? 'تأكيد' : 'Confirm')
                            ),
                            el('button', {
                                onClick: () => setShowCreateRoom(false),
                                className: 'w-full text-[var(--spy-muted)] text-xs font-bold hover:text-white transition-colors'
                            }, '← ' + t.back)
                        )
                    ) : showParty ? (
                        el('div', { className: 'animate-in slide-in-from-left duration-300 space-y-4' },
                            el('div', { className: 'bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl' },
                                el('div', { style: { fontSize: '10px', fontWeight: '900', color: '#f59e0b', uppercase: true, letterSpacing: '1px', marginBottom: '12px' } }, lang === 'ar' ? '🎭 إعدادات اللعب المحلي' : '🎭 PARTY SETUP'),
                                el('div', { className: 'flex justify-between items-center bg-black/40 rounded-xl p-2 mb-4 border border-orange-500/30' },
                                    [2, 3, 4].map(num => el('button', {
                                        key: num,
                                        onClick: () => setPartyCount(num),
                                        className: `flex-1 py-2 font-black rounded-lg transition-all ${partyCount === num ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`
                                    }, num + (lang === 'ar' ? ' لاعبين' : ' Players')))
                                ),
                                Array.from({ length: partyCount - 1 }).map((_, idx) => el('div', { key: idx, className: 'mb-3' },
                                    el('input', {
                                        type: 'text',
                                        placeholder: lang === 'ar' ? `اسم لاعب ${idx + 2}` : `Player ${idx + 2} Name`,
                                        value: partyNames[idx],
                                        onChange: (e) => {
                                            const newNames = [...partyNames];
                                            newNames[idx] = e.target.value;
                                            setPartyNames(newNames);
                                        },
                                        className: 'w-full bg-black/40 border border-orange-500/30 rounded-xl p-3 text-white font-bold text-sm focus:border-orange-500 outline-none transition-all'
                                    })
                                )),
                                el('button', {
                                    onClick: () => onSelectMode('offline', { isParty: true, partyNames: partyNames.slice(0, partyCount - 1) }),
                                    className: 'w-full mt-2 py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_20px_rgba(245,158,11,0.3)]'
                                }, t.offline)
                            ),
                            el('button', {
                                onClick: () => setShowParty(false),
                                className: 'w-full text-[var(--spy-muted)] text-xs font-bold hover:text-white transition-colors'
                            }, '← ' + t.back)
                        )
                    ) : showBots ? (
                         el('div', { className: 'animate-in slide-in-from-left duration-300 space-y-4' },
                            el('div', { className: 'bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl' },
                                el('div', { style: { fontSize: '10px', fontWeight: '900', color: '#3b82f6', uppercase: true, letterSpacing: '1px', marginBottom: '12px' } }, lang === 'ar' ? '🤖 إعدادات البوتات' : '🤖 BOTS SETUP'),
                                el('div', { className: 'flex justify-between items-center bg-black/40 rounded-xl p-2 mb-4 border border-blue-500/30' },
                                    [1, 2, 3].map(num => el('button', {
                                        key: num,
                                        onClick: () => setBotCount(num),
                                        className: `flex-1 py-2 font-black rounded-lg transition-all ${botCount === num ? 'bg-blue-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`
                                    }, num + (lang === 'ar' ? ' بوت' : ' Bot(s)')))
                                ),
                                el('button', {
                                    onClick: () => onSelectMode('offline', { vsBots: true, botCount: botCount }),
                                    className: 'w-full mt-2 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_20px_rgba(59,130,246,0.3)]'
                                }, t.bots)
                            ),
                            el('button', {
                                onClick: () => setShowBots(false),
                                className: 'w-full text-[var(--spy-muted)] text-xs font-bold hover:text-white transition-colors'
                            }, '← ' + t.back)
                        )
                    ) : null
                ),

                // Footer
                el('div', { className: 'p-6 pt-0 opacity-20 text-[9px] text-center font-bold text-white uppercase tracking-widest relative z-10' },
                    'Professional Gaming Infrastructure'
                )
            )
        );
    };

})();
