// --- Utility Functions: Authentication & Roles ---
// This file contains shared helper functions for checking user roles and permissions.

// Constants are expected to be in global scope from core/config.js
// var { OWNER_UID, ADMIN_UIDS, ROLE_CONFIG } = window.FamilyConstants || {};

/**
 * Checks if a UID belongs to the Admin list.
 * @param {string} uid 
 * @returns {boolean}
 */
var isAdmin = (uid) => {
    var adminUids = window.FamilyConstants?.ADMIN_UIDS || [];
    return uid && adminUids.includes(uid);
};

/**
 * Returns the effective role of a user ('owner', 'admin', 'moderator', or null).
 * @param {object} userData 
 * @param {string} uid 
 * @returns {string|null}
 */
var getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    var ownerUid = window.FamilyConstants?.OWNER_UID;
    var checkUid = uid || userData?.uid || userData?.id;
    if (checkUid && checkUid === ownerUid) return 'owner';
    var role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

/**
 * Checks if a user has permission to manage roles (Owner or Admin).
 * @param {object} viewerData 
 * @param {string} viewerUID 
 * @returns {boolean}
 */
var canManageRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    return role === 'owner' || role === 'admin';
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

// Global exports
window.isAdmin = isAdmin;
window.getUserRole = getUserRole;
window.canManageRoles = canManageRoles;
window.getAssignableRoles = getAssignableRoles;
window.isBannedUser = isBannedUser;
