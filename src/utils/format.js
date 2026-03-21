import firebase from '../core/firebase.js';

/**
 * Formats a number into a readable string (K/M suffix).
 * @param {number} n 
 * @returns {string}
 */
export const fmtNum = (n) => {
    if (n === undefined || n === null) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

/**
 * Returns a Firestore server timestamp.
 * @returns {firebase.firestore.FieldValue}
 */
export const TS = () => firebase.firestore.FieldValue.serverTimestamp();

/**
 * Formats a timestamp into a relative time string (now, 5m, 1h, 2d).
 */
export const fmtTime = (ts, lang) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
};

/**
 * Extracts the ban expiry date from user data.
 * @param {object} userData 
 * @returns {Date|null}
 */
export const getBanExpiry = (userData) => {
    const ban = userData?.ban;
    if (!ban?.expiresAt) return null;
    return ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
};

/**
 * Formats the ban expiry into a locale-specific string.
 * @param {object} userData 
 * @param {string} lang 
 * @returns {string}
 */
export const formatBanExpiry = (userData, lang) => {
    const expiry = getBanExpiry(userData);
    if (!expiry) return lang === 'ar' ? 'حظر دائم' : 'Permanent';
    return expiry.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Global exports for legacy scripts
export const fmtFamilyNum = fmtNum;
export const fmtFamilyTime = fmtTime;
window.fmtNum = fmtNum;
window.fmtFamilyNum = fmtNum;
window.TS = TS;
window.fmtTime = fmtTime;
window.fmtFamilyTime = fmtTime;

