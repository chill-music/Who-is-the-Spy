/**
 * FamilyNews.js - Renders the family news feed.
 */
var { fmtFamilyTime, fmtFamilyNum } = window;

var FamilyNews = ({ family, currentUserData, lang, S }) => {
    // Fallback styles if S is not passed as prop
    var localS = S || {
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
    };

    var newsTypeIcon = { 
        join: '🎉', 
        leave: '👋', 
        donation: '💰', 
        level_up: '⬆️', 
        task_complete: '✅', 
        milestone: '🎁' 
    };
    var newsLog = family?.newsLog || [];

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={localS.sectionTitle}>📰 {lang === 'ar' ? 'أخبار العائلة' : 'Family News'}</div>
            {newsLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                    <div style={{ fontSize: '12px' }}>{lang === 'ar' ? 'لا أخبار بعد' : 'No news yet'}</div>
                </div>
            ) : newsLog.map(item => (
                <div key={item.id} style={{ ...localS.card, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
                        {item.actorPhoto ? (
                            <img src={item.actorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                {newsTypeIcon[item.type] || '📢'}
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>{item.text}</div>
                        {item.amount > 0 && (
                            <div style={{ fontSize: '10px', color: '#ffd700', fontWeight: 700, marginTop: '2px' }}>
                                +{fmtFamilyNum(item.amount)} 🧠
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#4b5563', flexShrink: 0 }}>
                        {fmtFamilyTime(item.createdAt, lang)}
                    </div>
                </div>
            ))}
            <div style={{ height: '12px' }} />
        </div>
    );
};

window.FamilyNews = FamilyNews;
