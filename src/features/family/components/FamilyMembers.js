/**
 * FamilyMembers.js - Component for displaying and managing family members.
 */
const { 
    FAMILY_ROLE_CONFIG, 
    getFamilyRole, 
    getFamilyLevelConfig,
    getFamilySignLevelData
} = window.FamilyConstants;
const { fmtFamilyNum } = window;
const { FamilyRoleBadge, FamilySignBadge } = window.FamilyShared;

const FamilyMembers = ({ 
    family, 
    members, 
    currentUID, 
    lang, 
    onNotification,
    onKick,
    onSetRole
}) => {
    const [memberSearch, setMemberSearch] = React.useState('');
    const [donationSort, setDonationSort] = React.useState('intel'); // 'intel' or 'activity'
    const [gearMenuUid, setGearMenuUid] = React.useState(null);

    if (!family || !members) return null;

    const myRole = getFamilyRole(family, currentUID);
    const canManage = myRole === 'owner' || myRole === 'admin';

    // Sorting & Filtering
    const sorted = [...members].sort((a, b) => {
        let aV, bV;
        const donData = family.memberDonations || {};
        if (donationSort === 'intel') {
            const aD = donData[a.id] || {};
            const bD = donData[b.id] || {};
            aV = aD.totalIntel || aD.total || 0;
            bV = bD.totalIntel || bD.total || 0;
        } else {
            const aD = donData[a.id] || {};
            const bD = donData[b.id] || {};
            aV = aD.weekly || 0;
            bV = bD.weekly || 0;
        }
        const aOwner = getFamilyRole(family, a.id) === 'owner' ? 1 : 0;
        const bOwner = getFamilyRole(family, b.id) === 'owner' ? 1 : 0;
        if (aOwner !== bOwner) return bOwner - aOwner;
        return bV - aV;
    }).filter(m => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

    const handleKick = async (uid) => {
        try {
            if (onKick) await onKick(uid);
            setGearMenuUid(null);
        } catch (e) {
            onNotification(e.message || 'Error kicking member');
        }
    };

    const handleSetRole = async (uid, role) => {
        try {
            if (onSetRole) await onSetRole(uid, role);
            setGearMenuUid(null);
        } catch (e) {
            onNotification(e.message || 'Error setting role');
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {/* Search + member count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '5px 10px' }}>
                        <span style={{ fontSize: '13px' }}>🔍</span>
                        <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '11px' }}
                            placeholder={lang === 'ar' ? 'بحث...' : 'Search...'} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, flexShrink: 0 }}>
                        {family.members?.length || 0}/{getFamilyLevelConfig(family.level || 1).maxMembers}
                    </span>
                </div>
                {/* Tab buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setDonationSort('intel')} style={{ flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'intel' ? 'rgba(0,242,255,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'intel' ? 'rgba(0,242,255,0.1)' : 'transparent', color: donationSort === 'intel' ? '#00f2ff' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'intel' ? 800 : 500, cursor: 'pointer' }}>
                        🧠 {lang === 'ar' ? 'التبرعات' : 'Donations'}
                    </button>
                    <button onClick={() => setDonationSort('activity')} style={{ flex: 1, padding: '5px', borderRadius: '8px', border: `1px solid ${donationSort === 'activity' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`, background: donationSort === 'activity' ? 'rgba(251,191,36,0.1)' : 'transparent', color: donationSort === 'activity' ? '#fbbf24' : '#6b7280', fontSize: '10px', fontWeight: donationSort === 'activity' ? 800 : 500, cursor: 'pointer' }}>
                        ⚡ {lang === 'ar' ? 'الاكتيفيتي' : 'Activity'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }} onClick={() => gearMenuUid && setGearMenuUid(null)}>
                {sorted.map((m, i) => {
                    const role = getFamilyRole(family, m.id);
                    const rCfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
                    const donData = family.memberDonations || {};
                    const don = donData[m.id] || {};
                    
                    const weeklyDon = don.weeklyIntel || don.weekly || 0;
                    const totalDon = don.totalIntel || don.total || 0;
                    const weeklyAct = don.weekly || 0;
                    const totalAct = don.total || 0;

                    const isTop3 = i < 3;
                    const topColors = ['rgba(255,215,0,0.06)', 'rgba(192,192,192,0.04)', 'rgba(205,127,50,0.04)'];
                    const isGearOpen = gearMenuUid === m.id;

                    const targetRole = getFamilyRole(family, m.id);
                    const canKick = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
                    const canSetAdmin = myRole === 'owner' && m.id !== currentUID && targetRole !== 'owner';
                    const canSetMod = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
                    const showGear = canKick || canSetAdmin || canSetMod;

                    const signData = getFamilySignLevelData(family.lastWeekActiveness || 0) || { level: 0 };

                    return (
                        <div key={m.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isTop3 ? topColors[i] : 'transparent' }}>
                            {/* Rank */}
                            <div style={{ width: '20px', textAlign: 'center', fontSize: '11px', color: i === 0 ? '#ffd700' : i === 1 ? '#9ca3af' : i === 2 ? '#fb923c' : '#4b5563', fontWeight: 800, marginRight: '8px', flexShrink: 0 }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                            </div>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0, marginRight: '10px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${rCfg.color}66`, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                                    {m.photoURL ? <img src={m.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>😎</div>}
                                </div>
                                {role === 'owner' && <div style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '10px' }}>👑</div>}
                            </div>
                            {/* Name + role */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{m.displayName}</span>
                                    {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                </div>
                                <FamilyRoleBadge role={role} lang={lang} small />
                            </div>
                            {/* Stats */}
                            <div style={{ textAlign: 'right', flexShrink: 0, marginRight: showGear ? '6px' : '0' }}>
                                {donationSort === 'intel' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>W</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00f2ff' }}>{fmtFamilyNum(weeklyDon)}🧠</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>T</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>{fmtFamilyNum(totalDon)}🧠</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>W</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>⚡{fmtFamilyNum(weeklyAct)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '8px', color: '#6b7280' }}>T</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa' }}>∑{fmtFamilyNum(totalAct)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Gear button */}
                            {showGear && (
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); setGearMenuUid(isGearOpen ? null : m.id); }}
                                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                    >⚙️</button>
                                    {/* Gear dropdown */}
                                    {isGearOpen && (
                                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '32px', right: 0, zIndex: 50, background: '#0f1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '6px', minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                                            {/* Role options */}
                                            {canSetAdmin && targetRole !== 'admin' && (
                                                <button onClick={() => handleSetRole(m.id, 'admin')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🛡️ {lang === 'ar' ? 'ترقية لأدمن' : 'Set Admin'}
                                                </button>
                                            )}
                                            {canSetMod && targetRole !== 'moderator' && (
                                                <button onClick={() => handleSetRole(m.id, 'moderator')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🔰 {lang === 'ar' ? 'ترقية لمشرف' : 'Set Mod'}
                                                </button>
                                            )}
                                            {(targetRole === 'admin' || targetRole === 'moderator') && canSetAdmin && (
                                                <button onClick={() => handleSetRole(m.id, 'member')} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,114,128,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    👤 {lang === 'ar' ? 'تخفيض لعضو' : 'Set Member'}
                                                </button>
                                            )}
                                            {/* Divider */}
                                            {canKick && <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                                            {canKick && (
                                                <button onClick={() => handleKick(m.id)} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    🚫 {lang === 'ar' ? 'طرد من القبيلة' : 'Kick'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {sorted.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#4b5563', fontSize: '12px' }}>{lang === 'ar' ? 'لا أعضاء' : 'No members found'}</div>}
            </div>
        </div>
    );
};

window.FamilyMembers = FamilyMembers;

