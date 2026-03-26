/**
 * ProfileHelpers.js
 * Centralized logic for profile-related components.
 * Part of the refactoring effort to modularize 15-profile.js.
 */

// Helper: get gift level (1,2,3) based on received count
var getGiftLevel = (count) => {
    if (count >= 50) return 3;
    if (count >= 25) return 2;
    if (count >= 5)  return 1;
    return 0;
};

// Helper: frame style per level
var getGiftLevelFrame = (level) => {
    if (level === 3) return { border:'2px solid rgba(255,215,0,0.95)',  shadow:'0 0 14px rgba(255,215,0,0.55), 0 0 28px rgba(255,215,0,0.18)', labelColor:'#ffd700' };
    if (level === 2) return { border:'2px solid rgba(200,200,220,0.9)', shadow:'0 0 10px rgba(200,200,220,0.35)', labelColor:'#C0C0C0' };
    if (level === 1) return { border:'2px solid rgba(184,115,51,0.85)', shadow:'0 0 8px rgba(184,115,51,0.3)',  labelColor:'#cd7f32' };
    return            { border:'1.5px solid rgba(60,60,80,0.35)',       shadow:'none', labelColor:'#4b5563' };
};

// Helper: get gift rarity based on cost
var getGiftRarity = (cost) => {
    if (cost >= 10000) return 'Mythic';
    if (cost >= 500)   return 'Legendary';
    if (cost >= 50)    return 'Epic';
    if (cost >= 15)    return 'Uncommon';
    return 'Common';
};

/**
 * Checks if a UID belongs to the Admin list.
 * @param {string} uid 
 * @returns {boolean}
 */
var isAdmin = (uid) => uid && window.ADMIN_UIDS && window.ADMIN_UIDS.includes(uid);

/**
 * Checks if a user is currently banned.
 * @param {object} userData 
 * @returns {boolean}
 */
var isBannedUser = (userData) => {
    var ban = userData?.ban;
    if (!ban?.isBanned) return false;
    if (!ban.expiresAt) return true; // permanent
    var expiry = ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
    return new Date() < expiry;
};

/**
 * Checks if a user has permission to manage roles (Owner or Admin).
 * @param {object} viewerData 
 * @param {string} viewerUID 
 * @returns {boolean}
 */
var canManageRoles = (viewerData, viewerUID) => {
    var role = window.getUserRole ? window.getUserRole(viewerData, viewerUID) : null;
    return role === 'owner' || role === 'admin';
};


/**
 * Returns the effective role of a user ('owner', 'admin', 'moderator', or null).
 * @param {object} userData 
 * @param {string} uid 
 * @returns {string|null}
 */
var getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    var checkUid = uid || userData?.uid || userData?.id;
    var ownerUid = window.OWNER_UID;
    if (checkUid && checkUid === ownerUid) return 'owner';
    var role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

/**
 * Returns a list of roles that the viewer is allowed to assign based on their role.
 * @param {object} viewerData 
 * @param {string} viewerUID 
 * @returns {string[]}
 */
var getAssignableRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    if (role === 'owner') return ['admin', 'moderator'];
    if (role === 'admin') return ['moderator'];
    return [];
};

/**
 * Returns the ban expiry date object.
 * @param {object} userData 
 * @returns {Date|null}
 */
var getBanExpiry = (userData) => {
    var ban = userData?.ban;
    if (!ban?.expiresAt) return null;
    return ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
};

/**
 * Formats the ban expiry date for display.
 * @param {object} userData 
 * @param {string} lang 
 * @returns {string}
 */
var formatBanExpiry = (userData, lang) => {
    var expiry = getBanExpiry(userData);
    if (!expiry) return lang === 'ar' ? 'حظر دائم' : 'Permanent';
    return expiry.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Global exports
window.isAdmin = isAdmin;
window.isBannedUser = isBannedUser;
window.canManageRoles = canManageRoles;
window.getUserRole = getUserRole;
window.getAssignableRoles = getAssignableRoles;
window.getBanExpiry = getBanExpiry;
window.formatBanExpiry = formatBanExpiry;
