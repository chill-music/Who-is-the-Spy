var { renderMsgText } = {
    renderMsgText: (text, familyMembers, currentUserData, currentUID, openMiniProfile) => {
        if (!text) return '';
        
        // Simple mention regex: @Name
        var parts = text.split(/(@\w[\w\s]*?)(?=\s|$)/g);
        
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                var mentionName = part.slice(1).trim().toLowerCase();
                return React.createElement('span', {
                    key: i,
                    style: { 
                        color: '#00f2ff', 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        textDecoration: 'underline dotted rgba(0,242,255,0.4)' 
                    },
                    onClick: (e) => {
                        e.stopPropagation();
                        var allMbrs = [...(familyMembers || [])];
                        if (currentUserData) {
                            allMbrs.push({ 
                                id: currentUID, 
                                displayName: currentUserData.displayName, 
                                photoURL: currentUserData.photoURL 
                            });
                        }
                        var found = allMbrs.find(m => (m.displayName || '').toLowerCase() === mentionName);
                        if (found) {
                            openMiniProfile(found.id, { name: found.displayName, photo: found.photoURL });
                        }
                    }
                }, part);
            }
            return part;
        });
    }
};

window.FamilyUtils = { renderMsgText };
// No default export - access via window.FamilyUtils
