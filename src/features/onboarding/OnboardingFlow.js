(function() {
    var { useState, useRef } = React;

    // 🌍 COUNTRIES LIST
    var COUNTRIES = [
        { code:'SA', flag:'🇸🇦', name_ar:'السعودية',      name_en:'Saudi Arabia' },
        { code:'EG', flag:'🇪🇬', name_ar:'مصر',            name_en:'Egypt' },
        { code:'AE', flag:'🇦🇪', name_ar:'الإمارات',      name_en:'UAE' },
        { code:'KW', flag:'🇰🇼', name_ar:'الكويت',        name_en:'Kuwait' },
        { code:'QA', flag:'🇶🇦', name_ar:'قطر',           name_en:'Qatar' },
        { code:'BH', flag:'🇧🇭', name_ar:'البحرين',       name_en:'Bahrain' },
        { code:'OM', flag:'🇴🇲', name_ar:'عُمان',         name_en:'Oman' },
        { code:'IQ', flag:'🇮🇶', name_ar:'العراق',        name_en:'Iraq' },
        { code:'SY', flag:'🇸🇾', name_ar:'سوريا',         name_en:'Syria' },
        { code:'JO', flag:'🇯🇴', name_ar:'الأردن',        name_en:'Jordan' },
        { code:'LB', flag:'🇱🇧', name_ar:'لبنان',         name_en:'Lebanon' },
        { code:'PS', flag:'🇵🇸', name_ar:'فلسطين',        name_en:'Palestine' },
        { code:'YE', flag:'🇾🇪', name_ar:'اليمن',         name_en:'Yemen' },
        { code:'LY', flag:'🇱🇾', name_ar:'ليبيا',         name_en:'Libya' },
        { code:'TN', flag:'🇹🇳', name_ar:'تونس',          name_en:'Tunisia' },
        { code:'DZ', flag:'🇩🇿', name_ar:'الجزائر',       name_en:'Algeria' },
        { code:'MA', flag:'🇲🇦', name_ar:'المغرب',        name_en:'Morocco' },
        { code:'SD', flag:'🇸🇩', name_ar:'السودان',       name_en:'Sudan' },
        { code:'SO', flag:'🇸🇴', name_ar:'الصومال',       name_en:'Somalia' },
        { code:'MR', flag:'🇲🇷', name_ar:'موريتانيا',     name_en:'Mauritania' },
        { code:'US', flag:'🇺🇸', name_ar:'أمريكا',        name_en:'USA' },
        { code:'GB', flag:'🇬🇧', name_ar:'بريطانيا',      name_en:'UK' },
        { code:'FR', flag:'🇫🇷', name_ar:'فرنسا',         name_en:'France' },
        { code:'DE', flag:'🇩🇪', name_ar:'ألمانيا',       name_en:'Germany' },
        { code:'IT', flag:'🇮🇹', name_ar:'إيطاليا',       name_en:'Italy' },
        { code:'ES', flag:'🇪🇸', name_ar:'إسبانيا',       name_en:'Spain' },
        { code:'CA', flag:'🇨🇦', name_ar:'كندا',          name_en:'Canada' },
        { code:'AU', flag:'🇦🇺', name_ar:'أستراليا',      name_en:'Australia' },
        { code:'TR', flag:'🇹🇷', name_ar:'تركيا',         name_en:'Turkey' },
        { code:'IR', flag:'🇮🇷', name_ar:'إيران',         name_en:'Iran' },
        { code:'PK', flag:'🇵🇰', name_ar:'باكستان',       name_en:'Pakistan' },
        { code:'IN', flag:'🇮🇳', name_ar:'الهند',         name_en:'India' },
        { code:'CN', flag:'🇨🇳', name_ar:'الصين',         name_en:'China' },
        { code:'JP', flag:'🇯🇵', name_ar:'اليابان',       name_en:'Japan' },
        { code:'KR', flag:'🇰🇷', name_ar:'كوريا',         name_en:'South Korea' },
        { code:'BR', flag:'🇧🇷', name_ar:'البرازيل',      name_en:'Brazil' },
        { code:'MX', flag:'🇲🇽', name_ar:'المكسيك',       name_en:'Mexico' },
        { code:'RU', flag:'🇷🇺', name_ar:'روسيا',         name_en:'Russia' },
        { code:'NL', flag:'🇳🇱', name_ar:'هولندا',        name_en:'Netherlands' },
        { code:'SE', flag:'🇸🇪', name_ar:'السويد',        name_en:'Sweden' },
        { code:'NO', flag:'🇳🇴', name_ar:'النرويج',       name_en:'Norway' },
        { code:'CH', flag:'🇨🇭', name_ar:'سويسرا',        name_en:'Switzerland' },
        { code:'NG', flag:'🇳🇬', name_ar:'نيجيريا',       name_en:'Nigeria' },
        { code:'ET', flag:'🇪🇹', name_ar:'إثيوبيا',       name_en:'Ethiopia' },
        { code:'ZA', flag:'🇿🇦', name_ar:'جنوب أفريقيا',  name_en:'South Africa' },
        { code:'ID', flag:'🇮🇩', name_ar:'إندونيسيا',     name_en:'Indonesia' },
        { code:'MY', flag:'🇲🇾', name_ar:'ماليزيا',       name_en:'Malaysia' },
        { code:'PH', flag:'🇵🇭', name_ar:'الفلبين',       name_en:'Philippines' },
    ];

    // 🌍 Country Picker Component — Flag Grid
    var CountryPicker = ({ selected, onSelect, lang }) => {
        var [search, setSearch] = useState('');
        var filtered = COUNTRIES.filter(c => {
            var q = search.toLowerCase();
            return c.name_ar.includes(q) || c.name_en.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
        });
        return (
            <div>
                <input
                    style={{
                        width:'100%', padding:'7px 12px', borderRadius:'10px', fontSize:'11px',
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                        color:'white', outline:'none', marginBottom:'10px'
                    }}
                    placeholder={lang === 'ar' ? '🔍 ابحث...' : '🔍 Search...'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div style={{
                    display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'6px',
                    maxHeight:'180px', overflowY:'auto',
                    scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.1) transparent'
                }}>
                    {filtered.map(c => (
                        <button
                            key={c.code}
                            onClick={() => onSelect(c)}
                            title={lang==='ar'?c.name_ar:c.name_en}
                            style={{
                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                gap:'3px', padding:'7px 4px', borderRadius:'10px', cursor:'pointer', border:'none',
                                background: selected===c.code ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.04)',
                                outline: selected===c.code ? '1.5px solid rgba(0,242,255,0.6)' : '1.5px solid transparent',
                                transition:'all 0.15s',
                                boxShadow: selected===c.code ? '0 0 8px rgba(0,242,255,0.2)' : 'none'
                            }}
                        >
                            <span style={{ fontSize:'22px', lineHeight:1 }}>{c.flag}</span>
                            <span style={{ fontSize:'8px', color: selected===c.code?'#00f2ff':'#6b7280', fontWeight:600, letterSpacing:'0.3px' }}>{c.code}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // 🎉 ONBOARDING MODAL - New User Setup
    var OnboardingModal = ({ show, googleUser, onComplete, lang }) => {
        var [displayName, setDisplayName] = useState(googleUser?.displayName || '');
        var [gender, setGender] = useState('');
        var [country, setCountry] = useState(null);
        var [showCountryPicker, setShowCountryPicker] = useState(false);
        var [photoURL, setPhotoURL] = useState(googleUser?.photoURL || null);
        var fileRef = useRef(null);

        if (!show) return null;

        var handlePhotoChange = (e) => {
            var file = e.target.files?.[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = (ev) => {
                var img = new Image();
                img.onload = () => {
                    var canvas = document.createElement('canvas');
                    var MAX = 300;
                    var w = img.width, h = img.height;
                    if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                    else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    setPhotoURL(canvas.toDataURL('image/jpeg', 0.75));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        };

        var handleComplete = () => {
            if (!displayName.trim() || !gender) return;
            onComplete({ displayName: displayName.trim(), gender, country, photoURL });
        };

        return (
            <div className="onboarding-overlay" style={{ zIndex:window.Z.MODAL }}>
                <div className="onboarding-card animate-pop">
                    <div className="onboarding-header">
                        <div className="onboarding-spy-icon">🕵️</div>
                        <h2 className="onboarding-title">{lang === 'ar' ? 'مرحباً في PRO SPY!' : 'Welcome to PRO SPY!'}</h2>
                        <p className="onboarding-subtitle">{lang === 'ar' ? 'أكمل ملفك الشخصي للبدء' : 'Complete your profile to start'}</p>
                    </div>

                    <div className="onboarding-body">
                        {/* Photo Upload */}
                        <div className="onboarding-photo-section">
                            <div className="onboarding-photo-wrapper" onClick={() => fileRef.current?.click()}>
                                <img
                                    src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=7000ff&color=fff&size=300`}
                                    alt="avatar"
                                    className="onboarding-photo"
                                />
                                <div className="onboarding-photo-overlay">
                                    <span className="onboarding-camera-icon">📷</span>
                                </div>
                            </div>
                            <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                            <p className="onboarding-photo-hint">{lang === 'ar' ? 'اضغط لتغيير الصورة' : 'Tap to change photo'}</p>
                        </div>

                        {/* Name Input */}
                        <div className="onboarding-field">
                            <label className="onboarding-label">
                                {lang === 'ar' ? '✏️ اسمك في اللعبة' : '✏️ Your display name'}
                            </label>
                            <input
                                className="onboarding-input"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder={lang === 'ar' ? 'أدخل اسمك...' : 'Enter your name...'}
                                maxLength={10}
                            />
                        </div>

                        {/* Gender Selection */}
                        <div className="onboarding-field">
                            <label className="onboarding-label">
                                {lang === 'ar' ? '👤 الجنس' : '👤 Gender'}
                            </label>
                            <div className="onboarding-gender-row">
                                <button
                                    className={`onboarding-gender-btn ${gender === 'male' ? 'active' : ''}`}
                                    onClick={() => setGender('male')}
                                >
                                    <span style={{fontSize:'28px'}}>👨</span>
                                    <span>{lang === 'ar' ? 'ذكر' : 'Male'}</span>
                                </button>
                                <button
                                    className={`onboarding-gender-btn ${gender === 'female' ? 'active' : ''}`}
                                    onClick={() => setGender('female')}
                                >
                                    <span style={{fontSize:'28px'}}>👩</span>
                                    <span>{lang === 'ar' ? 'أنثى' : 'Female'}</span>
                                </button>
                            </div>
                        </div>
                        {/* Country Selection */}
                        <div className="onboarding-field">
                            <label className="onboarding-label">
                                {lang === 'ar' ? '🌍 دولتك' : '🌍 Your Country'}
                                <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '11px', marginRight: '4px', marginLeft: '4px' }}>
                                    ({lang === 'ar' ? 'اختياري' : 'optional'})
                                </span>
                            </label>
                            {!showCountryPicker ? (
                                <button
                                    className="onboarding-gender-btn"
                                    style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
                                    onClick={() => setShowCountryPicker(true)}
                                >
                                    {country ? (
                                        <>
                                            <span style={{ fontSize: '24px' }}>{country.flag}</span>
                                            <span>{lang === 'ar' ? country.name_ar : country.name_en}</span>
                                        </>
                                    ) : (
                                        <span style={{ color: '#6b7280' }}>{lang === 'ar' ? '— اختر دولتك —' : '— Select your country —'}</span>
                                    )}
                                </button>
                            ) : (
                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <CountryPicker
                                        selected={country?.code}
                                        onSelect={(c) => { setCountry(c); setShowCountryPicker(false); }}
                                        lang={lang}
                                    />
                                    <button
                                        onClick={() => setShowCountryPicker(false)}
                                        style={{ marginTop: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '11px', width: '100%' }}
                                    >
                                        {lang === 'ar' ? '✕ إغلاق' : '✕ Close'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="onboarding-footer">
                        <button
                            onClick={handleComplete}
                            disabled={!displayName.trim() || !gender}
                            className={`onboarding-submit-btn ${(!displayName.trim() || !gender) ? 'disabled' : ''}`}
                        >
                            {lang === 'ar' ? '🚀 ابدأ اللعب!' : '🚀 Start Playing!'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Exports
    window.COUNTRIES = COUNTRIES;
    window.CountryPicker = CountryPicker;
    window.OnboardingModal = OnboardingModal;

})();
