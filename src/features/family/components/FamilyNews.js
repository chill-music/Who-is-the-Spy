/**
 * FamilyNews.js — Renders the family news feed.
 * Reads from newsLogCollection (global) via the newsLog prop from 19-family.js.
 * Fields: type, text, amount, actorUID, actorName, actorPhoto, timestamp
 */
var FamilyNews = ({ family, newsLog: newsLogProp, currentUserData, lang, S }) => {
    var localS = S || {
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
    };

    var newsTypeConfig = {
        donation:       { icon:'💰', color:'#fbbf24',  label_ar:'تبرع',          label_en:'Donated' },
        level_up:       { icon:'⬆️', color:'#00f2ff',  label_ar:'ترقية',         label_en:'Level Up' },
        settings_change:{ icon:'⚙️', color:'#a78bfa',  label_ar:'إعدادات',       label_en:'Settings' },
        // Legacy types (hidden from feed — kept for old rows if any)
        join:           { icon:'🎉', color:'#4ade80',  label_ar:'انضم',         label_en:'Joined' },
        leave:          { icon:'👋', color:'#ef4444',  label_ar:'غادر',          label_en:'Left' },
        task_complete:  { icon:'✅', color:'#a78bfa',  label_ar:'مهمة',         label_en:'Task' },
        milestone:      { icon:'🎁', color:'#f97316',  label_ar:'إنجاز',         label_en:'Milestone' },
        checkin:        { icon:'📅', color:'#60a5fa',  label_ar:'حضور',         label_en:'Check-in' },
        gift_sent:      { icon:'🎁', color:'#f472b6',  label_ar:'هدية',         label_en:'Gift' },
        like:           { icon:'❤️', color:'#ef4444',  label_ar:'إعجاب',        label_en:'Like' },
        update:         { icon:'⚙️', color:'#a78bfa',  label_ar:'تحديث',        label_en:'Update' },
        announcement:   { icon:'📢', color:'#fbbf24',  label_ar:'إعلان',        label_en:'Announcement' },
    };

    var NEWS_FEED_TYPES = { donation: 1, level_up: 1, settings_change: 1, milestone: 1 };

    // Use prop newsLog (from parent), fallback to family.newsLog for backward compat
    var rawLog = newsLogProp || family?.newsLog || [];
    var newsLog = rawLog.filter(item => NEWS_FEED_TYPES[item.type]);

    // Helper: format timestamp — supports Firestore Timestamp, JS Date, or epoch ms
    var fmtTime = (ts) => {
        if (!ts) return '';
        try {
            var d = ts.toDate ? ts.toDate()
                  : ts.seconds ? new Date(ts.seconds * 1000)
                  : new Date(ts);
            var diff = Date.now() - d.getTime();
            if (isNaN(diff)) return '';
            if (diff < 60000)    return lang === 'ar' ? 'الآن' : 'now';
            if (diff < 3600000)  return Math.floor(diff / 60000)  + (lang === 'ar' ? 'د' : 'm');
            if (diff < 86400000) return Math.floor(diff / 3600000) + (lang === 'ar' ? 'س' : 'h');
            return Math.floor(diff / 86400000)                      + (lang === 'ar' ? 'ي' : 'd');
        } catch(e) { return ''; }
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={localS.sectionTitle}>📰 {lang === 'ar' ? 'أخبار العائلة' : 'Family News'}</div>

            {newsLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '6px' }}>
                        {lang === 'ar' ? 'لا أخبار بعد' : 'No news yet'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#4b5563', lineHeight: 1.5 }}>
                        {lang === 'ar'
                            ? 'يُعرض: التبرعات، ترقية المستوى، الصناديق المضافة للخزينة، وتعديلات المسؤولين على الإعدادات.'
                            : 'Shows: donations, level ups, treasury chest updates, and owner/admin settings changes.'}
                    </div>
                </div>
            ) : newsLog.map((item, idx) => {
                var tc = newsTypeConfig[item.type] || { icon: '📢', color: '#6b7280' };
                // Timestamp field: FamilyService.postNews writes `timestamp`; legacy used `createdAt`
                var ts = item.timestamp || item.createdAt;
                return (
                    <div key={item.id || idx} style={{
                        ...localS.card,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderLeft: `3px solid ${tc.color}44`,
                        background: `linear-gradient(90deg, ${tc.color}08, rgba(255,255,255,0.02))`,
                    }}>
                        {/* Actor avatar or type icon */}
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            overflow: 'hidden', flexShrink: 0,
                            background: `${tc.color}22`,
                            border: `1.5px solid ${tc.color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px',
                        }}>
                            {item.actorPhoto
                                ? <img src={item.actorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : tc.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Actor name */}
                            {item.actorName && (
                                <div style={{ fontSize: '11px', fontWeight: 800, color: tc.color, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.actorName}
                                </div>
                            )}
                            {/* News text */}
                            <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.text}
                            </div>
                            {/* Amount badge */}
                            {item.amount > 0 && (
                                <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800, marginTop: '3px' }}>
                                    +{item.amount >= 1000 ? (item.amount / 1000).toFixed(1) + 'K' : item.amount} 🧠
                                </div>
                            )}
                        </div>

                        {/* Time */}
                        <div style={{ fontSize: '9px', color: '#4b5563', flexShrink: 0 }}>
                            {fmtTime(ts)}
                        </div>
                    </div>
                );
            })}
            <div style={{ height: '12px' }} />
        </div>
    );
};

window.FamilyNews = FamilyNews;
