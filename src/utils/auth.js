// --- Utility Functions: Authentication & Roles ---
// This file contains shared helper functions for checking user roles and permissions.

import { OWNER_UID, ADMIN_UIDS, ROLE_CONFIG } from '../core/config.js';

/**
 * Checks if a UID belongs to the Admin list.
 * @param {string} uid 
 * @returns {boolean}
 */
export const isAdmin = (uid) => uid && ADMIN_UIDS.includes(uid);

/**
 * Returns the effective role of a user ('owner', 'admin', 'moderator', or null).
 * @param {object} userData 
 * @param {string} uid 
 * @returns {string|null}
 */
export const getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    const checkUid = uid || userData?.uid || userData?.id;
    if (checkUid && checkUid === OWNER_UID) return 'owner';
    const role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

/**
 * Checks if a user has permission to manage roles (Owner or Admin).
 * @param {object} viewerData 
 * @param {string} viewerUID 
 * @returns {boolean}
 */
export const canManageRoles = (viewerData, viewerUID) => {
    const role = getUserRole(viewerData, viewerUID);
    return role === 'owner' || role === 'admin';
};

/**
 * Returns a list of roles that the viewer is allowed to assign based on their role.
 * @param {object} viewerData 
 * @param {string} viewerUID 
 * @returns {string[]}
 */
export const getAssignableRoles = (viewerData, viewerUID) => {
    const role = getUserRole(viewerData, viewerUID);
    if (role === 'owner') return ['admin', 'moderator'];
    if (role === 'admin') return ['moderator'];
    return [];
};

/**
 * Checks if a user is currently banned.
 * @param {object} userData 
 * @returns {boolean}
 */
export const isBannedUser = (userData) => {
    const ban = userData?.ban;
    if (!ban?.isBanned) return false;
    if (!ban.expiresAt) return true; // permanent
    const expiry = ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
    return new Date() < expiry;
};
