(function() {
    /**
     * RankingView — Leaderboards and rankings.
     */
    window.RankingView = function({
        leaderboardTab, setLeaderboardTab,
        leaderboardData, charismaLeaderboard, familyLeaderboard,
        lang, t, openProfile, setViewFamilyId, setShowFamilyModal
    }) {
        return (
            <div className="ranking-view-container" style={{paddingBottom:'8px'}}>
                {/* Tabs */}
                <div className="lb-tabs-new" style={{margin:'12px 16px 0'}}>
                    <button className={`lb-tab-new ${leaderboardTab==='wins'?'active':''}`} onClick={() => setLeaderboardTab('wins')}>🏆 {t.wins}</button>
                    <button className={`lb-tab-new ${leaderboardTab==='charisma'?'active':''}`} onClick={() => setLeaderboardTab('charisma')}>⭐ {t.charismaRank}</button>
                    <button className={`lb-tab-new ${leaderboardTab==='family'?'active':''}`} onClick={() => setLeaderboardTab('family')}>🏠 {lang==='ar'?'عائلة':'Family'}</button>
                </div>

                {/* Leaderboard Lists */}
                <div className="lb-list-new" style={{margin:'0 16px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.05)', overflow:'hidden'}}>
                    {/* Family Rank */}
                    {leaderboardTab === 'family' && familyLeaderboard.map((fam, i) => (
                        <div key={fam.id} className="lb-row-new" 
                            onClick={() => { if(setViewFamilyId) setViewFamilyId(fam.id); if(setShowFamilyModal) setShowFamilyModal(true); }}
                            style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'pointer'}}>
                            <div className="lb-rank-new" style={{width:'24px',fontSize:'12px',fontWeight:900,color:i<3?'#ffd700':'#6b7280'}}>{i+1}</div>
                            <div className="lb-avatar-new" style={{width:'32px',height:'32px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                                {fam.photoURL ? <img src={fam.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:'18px'}}>{fam.emblem || '🏠'}</span>}
                            </div>
                            <div className="lb-name-info-new" style={{flex:1}}>
                                <div className="lb-name-new" style={{fontSize:'13px',fontWeight:700}}>{fam.name || fam.tag}</div>
                                <div className="lb-sub-new" style={{fontSize:'10px',color:'#6b7280'}}>{fam.members?.length || 0} {lang==='ar'?'عضو':'Members'}</div>
                            </div>
                            <div className="lb-score-new" style={{textAlign:'right'}}>
                                <div style={{fontSize:'12px',fontWeight:900,color:'#00f2ff'}}>{(fam.activeness || 0).toLocaleString()}</div>
                                <div style={{fontSize:'9px',color:'#6b7280'}}>{lang==='ar'?'نشاط':'Activity'}</div>
                            </div>
                        </div>
                    ))}

                    {/* Wins Rank */}
                    {leaderboardTab === 'wins' && leaderboardData.map((p, i) => (
                        <div key={p.uid} className="lb-row-new" onClick={() => openProfile(p.uid)}
                            style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'pointer'}}>
                            <div className="lb-rank-new" style={{width:'24px',fontSize:'12px',fontWeight:900,color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#6b7280'}}>{i+1}</div>
                            <div className="lb-avatar-new" style={{width:'32px',height:'32px',borderRadius:'50%',overflow:'hidden'}}>
                                <window.AvatarComponent userData={p} size={32} />
                            </div>
                            <div className="lb-name-info-new" style={{flex:1}}>
                                <div className="lb-name-new" style={{fontSize:'13px',fontWeight:700}}>{p.displayName || p.name}</div>
                            </div>
                            <div className="lb-score-new" style={{textAlign:'right'}}>
                                <div style={{fontSize:'12px',fontWeight:900,color:'#00f2ff'}}>{(p.stats?.wins || 0).toLocaleString()}</div>
                                <div style={{fontSize:'9px',color:'#6b7280'}}>{lang==='ar'?'فوز':t.wins}</div>
                            </div>
                        </div>
                    ))}

                    {/* Charisma Rank */}
                    {leaderboardTab === 'charisma' && charismaLeaderboard.map((p, i) => (
                        <div key={p.uid} className="lb-row-new" onClick={() => openProfile(p.uid)}
                            style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'pointer'}}>
                            <div className="lb-rank-new" style={{width:'24px',fontSize:'12px',fontWeight:900,color:i<3?'#ffd700':'#6b7280'}}>{i+1}</div>
                            <div className="lb-avatar-new" style={{width:'32px',height:'32px',borderRadius:'50%',overflow:'hidden'}}>
                                <window.AvatarComponent userData={p} size={32} />
                            </div>
                            <div className="lb-name-info-new" style={{flex:1}}>
                                <div className="lb-name-new" style={{fontSize:'13px',fontWeight:700}}>{p.displayName || p.name}</div>
                            </div>
                            <div className="lb-score-new" style={{textAlign:'right'}}>
                                <div style={{fontSize:'12px',fontWeight:900,color:'#ffd700'}}>{(p.charisma || 0).toLocaleString()}</div>
                                <div style={{fontSize:'9px',color:'#6b7280'}}>{lang==='ar'?'كاريزما':'Charisma'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
})();
