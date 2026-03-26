// --- Firebase Configuration & Initialization ---
// This file initializes Firebase once and exports the db, auth, and collections.

var firebaseConfig = {
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

export var auth = firebase.auth();
export var db = firebase.firestore();
export var appId = 'pro_spy_v25_final_fix_complete';

// Helper for references
var getPublicDoc = (coll) => db.collection('artifacts').doc(appId).collection('public').doc('data').collection(coll);

// COLLECTIONS
export var usersCollection = getPublicDoc('users');
export var guestsCollection = getPublicDoc('guests');
export var reportsCollection = getPublicDoc('reports');
export var chatsCollection = getPublicDoc('private_chats');
export var roomsCollection = getPublicDoc('rooms');
export var historyCollection = getPublicDoc('game_history');
export var notificationsCollection = getPublicDoc('notifications');
export var giftsLogCollection = getPublicDoc('gifts_log');
export var guardLogCollection = getPublicDoc('guard_log');
export var momentsCollection = getPublicDoc('moments');
export var vip10RequestsCollection = getPublicDoc('vip10_requests');
export var vip10IdRequestsCollection = getPublicDoc('vip10_id_requests');
export var bffCollection = getPublicDoc('bff_relationships');
export var botChatsCollection = getPublicDoc('bot_chats');
export var redPacketsCollection = getPublicDoc('red_packets');
export var publicChatCollection = getPublicDoc('public_chat');
export var helpFaqCollection = getPublicDoc('help_faq');
export var feedbackCollection = getPublicDoc('feedback');
export var familiesCollection = getPublicDoc('families');
export var newsLogCollection = getPublicDoc('family_news_log');
export var couplesCollection = getPublicDoc('couples');
export var groupsCollection = getPublicDoc('group_chats');
export var staffLogCollection = getPublicDoc('staff_activity_log');
export var ticketsCollection = getPublicDoc('support_tickets');

export default firebase;
