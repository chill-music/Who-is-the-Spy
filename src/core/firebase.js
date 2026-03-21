// --- Firebase Configuration & Initialization ---
// This file initializes Firebase once and exports the db, auth, and collections.

const firebaseConfig = {
    apiKey: "AIzaSyApAJaNfF0YHupunLRlK3jRYvttxczWShY",
    authDomain: "who-is-the-spy-919b9.firebaseapp.com",
    projectId: "who-is-the-spy-919b9",
    storageBucket: "who-is-the-spy-919b9.firebasestorage.app",
    messagingSenderId: "607075438373",
    appId: "1:607075438373:web:a03e9fb8b243cd993e14cc"
};

// Assuming firebase is loaded via script tag OR npm
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const appId = 'pro_spy_v25_final_fix_complete';

// Helper for references
const getPublicDoc = (coll) => db.collection('artifacts').doc(appId).collection('public').doc('data').collection(coll);

// COLLECTIONS
export const usersCollection = getPublicDoc('users');
export const guestsCollection = getPublicDoc('guests');
export const reportsCollection = getPublicDoc('reports');
export const chatsCollection = getPublicDoc('private_chats');
export const roomsCollection = getPublicDoc('rooms');
export const historyCollection = getPublicDoc('game_history');
export const notificationsCollection = getPublicDoc('notifications');
export const giftsLogCollection = getPublicDoc('gifts_log');
export const guardLogCollection = getPublicDoc('guard_log');
export const momentsCollection = getPublicDoc('moments');
export const vip10RequestsCollection = getPublicDoc('vip10_requests');
export const vip10IdRequestsCollection = getPublicDoc('vip10_id_requests');
export const bffCollection = getPublicDoc('bff_relationships');
export const botChatsCollection = getPublicDoc('bot_chats');
export const redPacketsCollection = getPublicDoc('red_packets');
export const publicChatCollection = getPublicDoc('public_chat');
export const helpFaqCollection = getPublicDoc('help_faq');
export const feedbackCollection = getPublicDoc('feedback');
export const familiesCollection = getPublicDoc('families');
export const newsLogCollection = getPublicDoc('family_news_log');
export const couplesCollection = getPublicDoc('couples');
export const groupsCollection = getPublicDoc('group_chats');
export const staffLogCollection = getPublicDoc('staff_activity_log');
export const ticketsCollection = getPublicDoc('support_tickets');

export default firebase;
