// ════════════════════════════════════════════════════════════
// 🏗️ PROFILE STATS COMPONENT
// ════════════════════════════════════════════════════════════
var ProfileStats = ({
    wins,
    losses,
    charismaRank,
    level,
    lang
}) => {
    return (
        <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-evenly',
            width:'100%', padding:'10px 8px', boxSizing:'border-box',
            background:'rgba(0,0,0,0.15)', borderTop:'1px solid rgba(255,255,255,0.05)',
            borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0'
        }}>
            {/* Wins */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#4ade80',lineHeight:1}}>{wins}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🏆 {lang==='ar'?'فوز':'Wins'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Losses */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#f87171',lineHeight:1}}>{losses}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>💀 {lang==='ar'?'خسارة':'Losses'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Win Rate */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1.2',minWidth:0}}>
                <WinRateCircleV11 wins={wins} losses={losses} lang={lang} />
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Rank */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#fbbf24',lineHeight:1}}>#{charismaRank||'--'}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🎖️ {lang==='ar'?'رتبة':'Rank'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Level */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#a78bfa',lineHeight:1}}>{level}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>⚡ {lang==='ar'?'مستوى':'Level'}</span>
            </div>
        </div>
    );
};

window.ProfileStats = ProfileStats;
