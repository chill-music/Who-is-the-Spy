// ��������������������������������������������������������
// � FRIENDS MOMENTS MODAL
// ��� FAMILY SYSTEM � Complete Clan/Family System V2
// File: 19-family.js
// ��������������������������������������������������������
// familiesCollection � defined in 01-config.js

// ��������������������������������������������������������
// �️  FAMILY CONFIG � Levels, Sign Levels, Tasks
// ��������������������������������������������������������
// Configuration is now loaded from window.FamilyConstants


// Get sign image URL from config (FAMILY_SIGN_IMAGES defined in 01-config.js)
var FamilyTreasury = window.FamilyTreasury;
var FamilyGacha = window.FamilyGacha;
var FamilyChatModal = window.FamilyChatModal;
var FamilyService = window.FamilyService;
var FamilyUtils = window.FamilyUtils;
var FamilyMembers = window.FamilyMembers;
var { 
    FAMILY_CREATE_COST, 
    FAMILY_LEVEL_CONFIG, 
    FAMILY_SIGN_LEVELS, 
    FAMILY_ROLE_CONFIG, 
    FAMILY_TASKS_CONFIG,
    FAMILY_EMBLEMS 
} = window.FamilyConstants;
var { FamilyRoleBadge, FamilySignBadge, S } = window.FamilyShared;

// Helpers and redundant definitions removed.


// [Components are now loaded from window]



// ��������������������������������������������������������
// ��� FAMILY MODAL � Main Component V2
// ��������������������������������������������������������
var FamilyModal = ({ isOpen, onClose, lang, ...props }) => {
    // ���������������������������������������������
    // �️ DATA & STATE
    // ���������������������������������������������
    const { 
        currentUID, currentUserData, 
        family, familyMembers, 
        loadingFamily, error 
        // @ts-ignore
    } = window.FamilyService.useFamilyData();

    const [activeTab, setActiveTab] = React.useState('profile');
    const [view, setView] = React.useState('home'); // home, create, join

    // Handle viewFamilyId from props (legacy support)
    const viewFamilyId = props.viewFamilyId;

    if (!isOpen) return null;

    // ���������������������������������������������
    // � RENDER LOGIC
    // ���������������������������������������������
    const renderContent = () => {
        if (loadingFamily) return <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>⏳ {lang==='ar'?'جارٍ ا�تح���...':'Loading...'}</div>;
        
        // If not in a family, or viewing an external family
        if (!family || (viewFamilyId && family.id !== viewFamilyId)) {
            return (
                <window.FamilySearch 
                    view={view} 
                    setView={setView} 
                    lang={lang} 
                    currentUID={currentUID} 
                    currentUserData={currentUserData} 
                    S={S}
                />
            );
        }

        switch (activeTab) {
            case 'profile': return <window.FamilyProfile family={family} familyMembers={familyMembers} lang={lang} currentUID={currentUID} currentUserData={currentUserData} onTabChange={setActiveTab} S={S} />;
            case 'members': return <window.FamilyMembers family={family} familyMembers={familyMembers} lang={lang} currentUID={currentUID} S={S} />;
            case 'tasks':   return <window.FamilyTasks family={family} lang={lang} currentUID={currentUID} onNotification={props.onNotification} S={S} />;
            case 'shop':    return <window.FamilyShop family={family} lang={lang} currentUID={currentUID} currentUserData={currentUserData} S={S} />;
            case 'ranking': return <window.FamilyRanking lang={lang} currentFamilyId={family.id} S={S} />;
            case 'news':    return <window.FamilyNews familyId={family.id} lang={lang} S={S} />;
            case 'manage':  return <window.FamilyManagement family={family} familyMembers={familyMembers} lang={lang} currentUID={currentUID} S={S} Z={Z} onNotification={props.onNotification} />;
            default:        return <window.FamilyProfile family={family} familyMembers={familyMembers} lang={lang} currentUID={currentUID} currentUserData={currentUserData} onTabChange={setActiveTab} S={S} />;
        }
    };

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{zIndex: Z.OVERLAY}}>
                <div style={{
                    background:'linear-gradient(180deg,#0d0d1f,#08080f)', 
                    border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', 
                    width:'100%', maxWidth:'460px', height:'92vh', maxHeight:'800px', 
                    display:'flex', flexDirection:'column', overflow:'hidden', 
                    boxShadow:'0 24px 80px rgba(0,0,0,0.95)'
                }} onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between', 
                        padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', 
                        flexShrink:0, background:'rgba(0,0,0,0.3)', position:'relative'
                    }}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', flex:1, minWidth:0}}>
                            <div style={{fontSize:'18px', fontWeight:900, color:'white', fontStyle:'italic'}}>
                                {family ? family.name : (lang==='ar'?'عا�� ا�عائ�ات':'Family World')}
                            </div>
                        </div>
                        <button onClick={onClose} style={{width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>�</button>
                    </div>

                    {/* Body */}
                    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
                        {error && (
                            <div style={{padding:'10px', background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:'11px', textAlign:'center', borderBottom:'1px solid rgba(239,68,68,0.2)'}}>
                                �️ {error}
                            </div>
                        )}
                        {renderContent()}
                    </div>

                    {/* Bottom Nav */}
                    {family && (
                        <div style={{
                            display:'flex', background:'rgba(0,0,0,0.35)', borderTop:'1px solid rgba(255,255,255,0.07)',
                            padding:'8px 4px', gap:'2px'
                        }}>
                            {[
                                {id:'profile', label:lang==='ar'?'ا�رئ�س�ة':'Home', icon:'���'},
                                {id:'members', label:lang==='ar'?'ا�أعضاء':'Members', icon:'�'},
                                {id:'tasks',   label:lang==='ar'?'ا���ا�':'Tasks', icon:'�'},
                                {id:'shop',    label:lang==='ar'?'ا��تجر':'Shop', icon:'�'},
                                {id:'ranking', label:lang==='ar'?'ا�ترت�ب':'Rank', icon:'��'},
                                {id:'news',    label:lang==='ar'?'ا�أخبار':'News', icon:'�'},
                                {id:'manage',  label:lang==='ar'?'ا�إدارة':'Manage', icon:'�️'},
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                    background:activeTab===tab.id?'rgba(0,242,255,0.1)':'none', border:'none', borderRadius:'12px',
                                    gap:'3px', padding:'8px 0', cursor:'pointer', transition:'all 0.2s',
                                    color:activeTab===tab.id?'#00f2ff':'#9ca3af',
                                }}>
                                    <span style={{fontSize:'18px'}}>{tab.icon}</span>
                                    <span style={{fontSize:'9px', fontWeight:activeTab===tab.id?800:500}}>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalModal>
    );
};

window.FamilyModal = FamilyModal;
