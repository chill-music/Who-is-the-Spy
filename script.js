// =====================================================
// PRO SPY - Complete React Game Script
// Version: 2.5 Final
// =====================================================

// =====================================================
// FIREBASE CONFIGURATION
// =====================================================
const firebaseConfig = {
    apiKey: "AIzaSyApAJaNfF0YHupunLRlK3jRYvttxczWShY",
    authDomain: "who-is-the-spy-919b9.firebaseapp.com",
    projectId: "who-is-the-spy-919b9",
    storageBucket: "who-is-the-spy-919b9.firebasestorage.app",
    messagingSenderId: "607075438373",
    appId: "1:607075438373:web:a03e9fb8b243cd993e14cc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =====================================================
// COLLECTION PATHS
// =====================================================
const COLLECTIONS = {
    users: 'artifacts/pro_spy_v25_final_fix_complete/public/data/users',
    guests: 'artifacts/pro_spy_v25_final_fix_complete/public/data/guests',
    rooms: 'artifacts/pro_spy_v25_final_fix_complete/public/data/rooms',
    shopItems: 'artifacts/pro_spy_v25_final_fix_complete/public/data/shopItems',
    friendRequests: 'artifacts/pro_spy_v25_final_fix_complete/public/data/friendRequests',
    messages: 'artifacts/pro_spy_v25_final_fix_complete/public/data/messages',
    gifts: 'artifacts/pro_spy_v25_final_fix_complete/public/data/gifts'
};

// =====================================================
// SHOP ITEMS DATA
// =====================================================
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name: 'Gold Frame', price: 500, icon: '🥇', imageUrl: null },
        { id: 'frame_diamond', name: 'Diamond Frame', price: 1000, icon: '💎', imageUrl: null },
        { id: 'frame_fire', name: 'Fire Frame', price: 750, icon: '🔥', imageUrl: null },
        { id: 'frame_crown', name: 'Crown Frame', price: 1500, icon: '👑', imageUrl: null },
        { id: 'frame_rainbow', name: 'Rainbow Frame', price: 800, icon: '🌈', imageUrl: null },
        { id: 'frame_star', name: 'Star Frame', price: 600, icon: '⭐', imageUrl: null },
        { id: 'frame_galaxy', name: 'Galaxy Frame', price: 2000, icon: '🌌', imageUrl: null },
        { id: 'frame_neon', name: 'Neon Frame', price: 900, icon: '💫', imageUrl: null }
    ],
    titles: [
        { id: 'title_spy_master', name: 'Spy Master', price: 300, icon: '🕵️' },
        { id: 'title_detective', name: 'Detective', price: 400, icon: '🔍' },
        { id: 'title_champion', name: 'Champion', price: 600, icon: '🏆' },
        { id: 'title_legend', name: 'Legend', price: 1000, icon: '⭐' },
        { id: 'title_ghost', name: 'Ghost', price: 500, icon: '👻' },
        { id: 'title_wizard', name: 'Wizard', price: 700, icon: '🧙' }
    ],
    badges: [
        { id: 'badge_winner', name: 'Winner Badge', price: 200, iconType: 'emoji', icon: '🏅', imageUrl: null },
        { id: 'badge_pro', name: 'Pro Badge', price: 350, iconType: 'emoji', icon: '💪', imageUrl: null },
        { id: 'badge_vip', name: 'VIP Badge', price: 800, iconType: 'emoji', icon: '⭐', imageUrl: null },
        { id: 'badge_spy', name: 'Spy Badge', price: 250, iconType: 'emoji', icon: '🕵️', imageUrl: null },
        { id: 'badge_love', name: 'Love Badge', price: 150, iconType: 'emoji', icon: '❤️', imageUrl: null },
        { id: 'badge_fire', name: 'Fire Badge', price: 400, iconType: 'emoji', icon: '🔥', imageUrl: null }
    ],
    gifts: [
        { id: 'gift_rose', name: 'Rose', price: 100, icon: '🌹' },
        { id: 'gift_heart', name: 'Heart', price: 150, icon: '💖' },
        { id: 'gift_star', name: 'Star', price: 200, icon: '⭐' },
        { id: 'gift_cake', name: 'Cake', price: 250, icon: '🎂' },
        { id: 'gift_box', name: 'Gift Box', price: 300, icon: '🎁' },
        { id: 'gift_crown', name: 'Crown', price: 500, icon: '👑' },
        { id: 'gift_diamond', name: 'Diamond', price: 1000, icon: '💎' },
        { id: 'gift_rocket', name: 'Rocket', price: 400, icon: '🚀' }
    ]
};

// =====================================================
// WORD LISTS FOR GAME
// =====================================================
const WORD_PAIRS = [
    { civilian: 'apple', spy: 'orange' },
    { civilian: 'car', spy: 'bus' },
    { civilian: 'house', spy: 'apartment' },
    { civilian: 'dog', spy: 'wolf' },
    { civilian: 'pizza', spy: 'burger' },
    { civilian: 'phone', spy: 'tablet' },
    { civilian: 'book', spy: 'magazine' },
    { civilian: 'chair', spy: 'sofa' },
    { civilian: 'tree', spy: 'bush' },
    { civilian: 'coffee', spy: 'tea' },
    { civilian: 'sun', spy: 'moon' },
    { civilian: 'cat', spy: 'tiger' },
    { civilian: 'boat', spy: 'ship' },
    { civilian: 'pen', spy: 'pencil' },
    { civilian: 'shoe', spy: 'boot' },
    { civilian: 'hat', spy: 'cap' },
    { civilian: 'shirt', spy: 'jacket' },
    { civilian: 'clock', spy: 'watch' },
    { civilian: 'lamp', spy: 'candle' },
    { civilian: 'window', spy: 'door' }
];

// =====================================================
// GAME CONSTANTS
// =====================================================
const GAME_PHASES = {
    LOBBY: 'lobby',
    ROLE_REVEAL: 'role_reveal',
    DISCUSSION: 'discussion',
    VOTING: 'voting',
    RESULTS: 'results'
};

const PLAYER_ROLES = {
    CIVILIAN: 'civilian',
    SPY: 'spy'
};

// =====================================================
// ERROR BOUNDARY COMPONENT
// =====================================================
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return React.createElement('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: 'white',
                    padding: '20px',
                    textAlign: 'center'
                }
            }, [
                React.createElement('h1', { key: 'title', style: { fontSize: '48px', marginBottom: '20px' } }, '😵'),
                React.createElement('h2', { key: 'subtitle', style: { marginBottom: '10px' } }, 'Something went wrong'),
                React.createElement('p', { key: 'message', style: { opacity: 0.7, marginBottom: '20px' } }, 
                    this.state.error?.message || 'An unexpected error occurred'
                ),
                React.createElement('button', {
                    key: 'retry',
                    onClick: () => window.location.reload(),
                    style: {
                        padding: '12px 24px',
                        fontSize: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer'
                    }
                }, 'Refresh Page')
            ]);
        }

        return this.props.children;
    }
}

// =====================================================
// MAIN APP CONTEXT
// =====================================================
const AppContext = React.createContext(null);

const useApp = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const generateGuestId = () => {
    return 'guest_' + Math.random().toString(36).substring(2, 15);
};

const generateGuestName = () => {
    const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Lucky', 'Cool', 'Smart', 'Fast'];
    const nouns = ['Player', 'Gamer', 'Spy', 'Agent', 'Hero', 'Star', 'Pro', 'Master'];
    return adjectives[Math.floor(Math.random() * adjectives.length)] + 
           nouns[Math.floor(Math.random() * nouns.length)] + 
           Math.floor(Math.random() * 100);
};

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// =====================================================
// AVATAR FRAME COMPONENT
// =====================================================
const AvatarFrame = ({ photoURL, frame, size = 80, onClick }) => {
    const sizeStyle = {
        width: `${size}px`,
        height: `${size}px`
    };

    const getFrameStyle = () => {
        if (!frame) return {};

        const frameStyles = {
            'frame_gold': {
                border: '4px solid #FFD700',
                boxShadow: '0 0 15px #FFD700, inset 0 0 10px rgba(255, 215, 0, 0.3)',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)'
            },
            'frame_diamond': {
                border: '4px solid #00CED1',
                boxShadow: '0 0 20px #00CED1, 0 0 30px #87CEEB',
                background: 'linear-gradient(45deg, #00CED1, #87CEEB)'
            },
            'frame_fire': {
                border: '4px solid transparent',
                borderImage: 'linear-gradient(45deg, #ff6b6b, #ffa500, #ffcc00) 1',
                boxShadow: '0 0 15px #ff6b6b',
                animation: 'fireGlow 1s ease-in-out infinite alternate'
            },
            'frame_crown': {
                border: '4px solid #FFD700',
                boxShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
            },
            'frame_rainbow': {
                border: '4px solid transparent',
                borderImage: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff) 1',
                boxShadow: '0 0 15px rgba(255, 100, 255, 0.5)'
            },
            'frame_star': {
                border: '4px solid #FFD700',
                boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700',
                background: 'linear-gradient(45deg, #FFD700, #FFF)'
            },
            'frame_galaxy': {
                border: '4px solid #8B5CF6',
                boxShadow: '0 0 20px #8B5CF6, 0 0 40px #6366F1',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)'
            },
            'frame_neon': {
                border: '4px solid #00FF00',
                boxShadow: '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00',
                animation: 'neonPulse 1.5s ease-in-out infinite'
            }
        };

        return frameStyles[frame] || {};
    };

    const frameStyle = getFrameStyle();

    return React.createElement('div', {
        className: 'avatar-frame-container',
        style: {
            ...sizeStyle,
            position: 'relative',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: '50%',
            padding: frame ? '4px' : '0',
            ...frameStyle
        },
        onClick
    }, [
        React.createElement('img', {
            key: 'avatar',
            src: photoURL || `https://ui-avatars.com/api/?name=Player&background=random&size=${size}`,
            alt: 'Avatar',
            style: {
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block'
            }
        })
    ]);
};

// =====================================================
// BADGE DISPLAY COMPONENT
// =====================================================
const BadgeDisplay = ({ badges, size = 24 }) => {
    if (!badges || badges.length === 0) return null;

    const getBadgeIcon = (badge) => {
        if (badge.iconType === 'image' && badge.imageUrl) {
            return React.createElement('img', {
                src: badge.imageUrl,
                alt: badge.name,
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '4px'
                }
            });
        }
        return React.createElement('span', {
            style: { fontSize: `${size * 0.8}px` }
        }, badge.icon || '🏅');
    };

    return React.createElement('div', {
        className: 'badge-container',
        style: {
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap'
        }
    }, badges.map((badge, index) => 
        React.createElement('div', {
            key: index,
            className: 'badge-item',
            title: badge.name,
            style: {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '2px'
            }
        }, getBadgeIcon(badge))
    ));
};

// =====================================================
// PLAYER CARD COMPONENT
// =====================================================
const PlayerCard = ({ player, isCurrentUser, showRole, voteCount, onVote, hasVoted }) => {
    const equipped = player.equipped || {};
    const badges = equipped.badges || [];

    return React.createElement('div', {
        className: `player-card ${isCurrentUser ? 'current-user' : ''}`,
        style: {
            background: isCurrentUser ? 
                'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' : 
                'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            border: isCurrentUser ? '2px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
        }
    }, [
        // Avatar with Frame
        React.createElement(AvatarFrame, {
            key: 'avatar',
            photoURL: player.photoURL,
            frame: equipped.frame,
            size: 70
        }),

        // Badges
        badges.length > 0 && React.createElement(BadgeDisplay, {
            key: 'badges',
            badges: badges,
            size: 20
        }),

        // Title
        equipped.title && React.createElement('div', {
            key: 'title',
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        }, equipped.title.icon + ' ' + equipped.title.name),

        // Name
        React.createElement('div', {
            key: 'name',
            style: {
                fontWeight: 'bold',
                fontSize: '16px',
                textAlign: 'center'
            }
        }, player.name || player.displayName),

        // Role (if revealed)
        showRole && React.createElement('div', {
            key: 'role',
            style: {
                background: player.role === PLAYER_ROLES.SPY ? 
                    'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)' : 
                    'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        }, player.role === PLAYER_ROLES.SPY ? '🕵️ SPY' : '👤 Civilian'),

        // Vote Count
        voteCount > 0 && React.createElement('div', {
            key: 'votes',
            style: {
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255, 107, 107, 0.9)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        }, `${voteCount} 🗳️`),

        // Vote Button
        onVote && !hasVoted && !isCurrentUser && React.createElement('button', {
            key: 'vote-btn',
            onClick: () => onVote(player.id),
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '4px'
            }
        }, 'Vote')
    ].filter(Boolean));
};

// =====================================================
// CURRENCY DISPLAY COMPONENT
// =====================================================
const CurrencyDisplay = ({ coins, isGuest }) => {
    if (isGuest) return null;

    return React.createElement('div', {
        className: 'currency-display',
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
        }
    }, [
        React.createElement('span', { key: 'icon', style: { fontSize: '20px' } }, '🪙'),
        React.createElement('span', { key: 'amount', style: { fontWeight: 'bold', fontSize: '18px' } }, coins?.toLocaleString() || '0')
    ]);
};

// =====================================================
// LOADING SPINNER COMPONENT
// =====================================================
const LoadingSpinner = ({ message = 'Loading...' }) => {
    return React.createElement('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            gap: '16px'
        }
    }, [
        React.createElement('div', {
            key: 'spinner',
            className: 'spinner',
            style: {
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }),
        React.createElement('p', { key: 'message', style: { opacity: 0.7 } }, message)
    ]);
};

// =====================================================
// MODAL COMPONENT
// =====================================================
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return React.createElement('div', {
        className: 'modal-overlay',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        onClick: (e) => e.target === e.currentTarget && onClose()
    }, React.createElement('div', {
        className: 'modal-content',
        style: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }
    }, [
        React.createElement('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }
        }, [
            React.createElement('h2', { 
                key: 'title',
                style: { fontSize: '24px', fontWeight: 'bold' } 
            }, title),
            React.createElement('button', {
                key: 'close',
                onClick: onClose,
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white'
                }
            }, '✕')
        ]),
        React.createElement('div', { key: 'body' }, children)
    ]));
};

// =====================================================
// SHOP COMPONENT
// =====================================================
const Shop = ({ user, userData, onUpdateUser }) => {
    const [activeTab, setActiveTab] = React.useState('frames');
    const [selectedGift, setSelectedGift] = React.useState(null);
    const [friendSearch, setFriendSearch] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [sending, setSending] = React.useState(false);

    const tabs = [
        { id: 'frames', name: 'Frames', icon: '🖼️' },
        { id: 'titles', name: 'Titles', icon: '🏷️' },
        { id: 'badges', name: 'Badges', icon: '🏅' },
        { id: 'gifts', name: 'Gifts', icon: '🎁' }
    ];

    const ownedItems = userData?.inventory || { frames: [], titles: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || { frame: null, title: null, badges: [] };
    const coins = userData?.coins || 0;

    const handleBuy = async (item, category) => {
        if (coins < item.price) {
            alert('Not enough coins!');
            return;
        }

        try {
            const newCoins = coins - item.price;
            const newInventory = { ...ownedItems };
            newInventory[category] = [...(newInventory[category] || []), item.id];

            await db.collection(COLLECTIONS.users).doc(user.uid).update({
                coins: newCoins,
                inventory: newInventory
            });

            onUpdateUser({ coins: newCoins, inventory: newInventory });
            alert(`Successfully purchased ${item.name}!`);
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Failed to purchase item');
        }
    };

    const handleEquip = async (item, category) => {
        try {
            const newEquipped = { ...equipped };
            
            if (category === 'badges') {
                // Allow multiple badges (up to 3)
                const currentBadges = newEquipped.badges || [];
                const badgeExists = currentBadges.find(b => b.id === item.id);
                
                if (badgeExists) {
                    // Unequip
                    newEquipped.badges = currentBadges.filter(b => b.id !== item.id);
                } else {
                    // Equip (max 3)
                    if (currentBadges.length >= 3) {
                        alert('You can only equip up to 3 badges!');
                        return;
                    }
                    newEquipped.badges = [...currentBadges, item];
                }
            } else {
                // Single item (frame, title)
                if (newEquipped[category]?.id === item.id) {
                    newEquipped[category] = null;
                } else {
                    newEquipped[category] = item;
                }
            }

            await db.collection(COLLECTIONS.users).doc(user.uid).update({
                equipped: newEquipped
            });

            onUpdateUser({ equipped: newEquipped });
        } catch (error) {
            console.error('Equip error:', error);
        }
    };

    const searchFriends = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const snapshot = await db.collection(COLLECTIONS.users)
                .where('displayName', '>=', query)
                .where('displayName', '<=', query + '\uf8ff')
                .limit(5)
                .get();

            const results = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(u => u.id !== user.uid);

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const sendGift = async (friend) => {
        if (!selectedGift) return;
        if (coins < selectedGift.price) {
            alert('Not enough coins!');
            return;
        }

        setSending(true);
        try {
            // Deduct coins from sender
            await db.collection(COLLECTIONS.users).doc(user.uid).update({
                coins: coins - selectedGift.price
            });

            // Add gift to recipient's received gifts
            await db.collection(COLLECTIONS.gifts).add({
                giftId: selectedGift.id,
                giftName: selectedGift.name,
                giftIcon: selectedGift.icon,
                fromId: user.uid,
                fromName: userData.displayName,
                toId: friend.id,
                toName: friend.displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            // Notify recipient
            await db.collection(COLLECTIONS.users).doc(friend.id).update({
                notifications: firebase.firestore.FieldValue.arrayUnion({
                    type: 'gift',
                    from: userData.displayName,
                    gift: selectedGift.name,
                    timestamp: Date.now()
                })
            });

            onUpdateUser({ coins: coins - selectedGift.price });
            setSelectedGift(null);
            setFriendSearch('');
            setSearchResults([]);
            alert(`Gift sent to ${friend.displayName}!`);
        } catch (error) {
            console.error('Send gift error:', error);
            alert('Failed to send gift');
        }
        setSending(false);
    };

    const renderItem = (item, category) => {
        const isOwned = ownedItems[category]?.includes(item.id);
        const isEquipped = category === 'badges' ? 
            equipped.badges?.some(b => b.id === item.id) : 
            equipped[category]?.id === item.id;

        return React.createElement('div', {
            key: item.id,
            className: 'shop-item',
            style: {
                background: isEquipped ? 
                    'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' :
                    isOwned ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                border: isEquipped ? '2px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
            }
        }, [
            React.createElement('span', { 
                key: 'icon', 
                style: { fontSize: '36px' } 
            }, item.icon),

            React.createElement('span', { 
                key: 'name', 
                style: { fontWeight: 'bold', textAlign: 'center' } 
            }, item.name),

            React.createElement('div', {
                key: 'price',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }
            }, [
                React.createElement('span', { key: 'coin' }, '🪙'),
                React.createElement('span', { key: 'amount' }, item.price)
            ]),

            React.createElement('button', {
                key: 'action',
                onClick: () => isOwned ? handleEquip(item, category) : handleBuy(item, category),
                disabled: !isOwned && coins < item.price,
                style: {
                    background: isEquipped ? 
                        'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)' :
                        isOwned ? 
                        'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' : 
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: (!isOwned && coins < item.price) ? 0.5 : 1
                }
            }, isEquipped ? 'Unequip' : isOwned ? 'Equip' : 'Buy')
        ]);
    };

    return React.createElement('div', {
        className: 'shop-container',
        style: { padding: '16px' }
    }, [
        // Currency Display
        React.createElement('div', {
            key: 'currency',
            style: {
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
            }
        }, React.createElement(CurrencyDisplay, { coins })),

        // Tabs
        React.createElement('div', {
            key: 'tabs',
            style: {
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                padding: '4px'
            }
        }, tabs.map(tab => 
            React.createElement('button', {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                style: {
                    background: activeTab === tab.id ? 
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                        'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '16px'
                }
            }, `${tab.icon} ${tab.name}`)
        )),

        // Gifts Tab - Gift Selection + Friend Search
        activeTab === 'gifts' && React.createElement('div', {
            key: 'gift-section',
            style: { marginBottom: '20px' }
        }, [
            selectedGift && React.createElement('div', {
                key: 'selected',
                style: {
                    background: 'rgba(102, 126, 234, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                React.createElement('span', { key: 'info' }, 
                    `Selected: ${selectedGift.icon} ${selectedGift.name} (${selectedGift.price} 🪙)`
                ),
                React.createElement('button', {
                    key: 'clear',
                    onClick: () => setSelectedGift(null),
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: 'white',
                        cursor: 'pointer'
                    }
                }, '✕')
            ]),

            selectedGift && React.createElement('div', {
                key: 'friend-search',
                style: { marginBottom: '16px' }
            }, [
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Search friend by name...',
                    value: friendSearch,
                    onChange: (e) => {
                        setFriendSearch(e.target.value);
                        searchFriends(e.target.value);
                    },
                    style: {
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                    }
                }),

                searchResults.length > 0 && React.createElement('div', {
                    key: 'results',
                    style: {
                        marginTop: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }, searchResults.map(friend =>
                    React.createElement('div', {
                        key: friend.id,
                        onClick: () => sendGift(friend),
                        style: {
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                    }, [
                        React.createElement('img', {
                            key: 'avatar',
                            src: friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName}`,
                            style: { width: '32px', height: '32px', borderRadius: '50%' }
                        }),
                        React.createElement('span', { key: 'name' }, friend.displayName),
                        sending && React.createElement('span', { key: 'sending' }, 'Sending...')
                    ])
                ))
            ])
        ]),

        // Items Grid
        React.createElement('div', {
            key: 'items',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px'
            }
        }, SHOP_ITEMS[activeTab].map(item => {
            if (activeTab === 'gifts') {
                const isSelected = selectedGift?.id === item.id;
                return React.createElement('div', {
                    key: item.id,
                    onClick: () => setSelectedGift(isSelected ? null : item),
                    style: {
                        background: isSelected ? 
                            'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' :
                            'rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }, [
                    React.createElement('span', { 
                        key: 'icon', 
                        style: { fontSize: '36px' } 
                    }, item.icon),
                    React.createElement('span', { 
                        key: 'name', 
                        style: { fontWeight: 'bold', textAlign: 'center' } 
                    }, item.name),
                    React.createElement('div', {
                        key: 'price',
                        style: { display: 'flex', alignItems: 'center', gap: '4px' }
                    }, [
                        React.createElement('span', { key: 'coin' }, '🪙'),
                        React.createElement('span', { key: 'amount' }, item.price)
                    ])
                ]);
            }
            return renderItem(item, activeTab);
        }))
    ].filter(Boolean));
};

// =====================================================
// FRIENDS COMPONENT
// =====================================================
const Friends = ({ user, userData }) => {
    const [activeTab, setActiveTab] = React.useState('friends');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [friends, setFriends] = React.useState([]);
    const [incomingRequests, setIncomingRequests] = React.useState([]);
    const [outgoingRequests, setOutgoingRequests] = React.useState([]);
    const [selectedFriend, setSelectedFriend] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Load friends and requests
    React.useEffect(() => {
        if (!user) return;

        const unsubscribeFriends = db.collection(COLLECTIONS.users)
            .doc(user.uid)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setFriends(data.friends || []);
                }
            });

        const unsubscribeRequests = db.collection(COLLECTIONS.friendRequests)
            .where('toId', '==', user.uid)
            .onSnapshot(snapshot => {
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setIncomingRequests(requests);
            });

        const unsubscribeOutgoing = db.collection(COLLECTIONS.friendRequests)
            .where('fromId', '==', user.uid)
            .onSnapshot(snapshot => {
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOutgoingRequests(requests);
            });

        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
            unsubscribeOutgoing();
        };
    }, [user]);

    // Load messages for selected friend
    React.useEffect(() => {
        if (!selectedFriend || !user) return;

        const chatId = [user.uid, selectedFriend.id].sort().join('_');
        
        const unsubscribe = db.collection(COLLECTIONS.messages)
            .where('chatId', '==', chatId)
            .orderBy('timestamp', 'asc')
            .limitToLast(50)
            .onSnapshot(snapshot => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(msgs);
            });

        return () => unsubscribe();
    }, [selectedFriend, user]);

    const searchUsers = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            // Search by display name
            const nameSnapshot = await db.collection(COLLECTIONS.users)
                .where('displayName', '>=', query)
                .where('displayName', '<=', query + '\uf8ff')
                .limit(10)
                .get();

            // Search by ID (if query looks like an ID)
            let idResult = null;
            if (query.length > 5) {
                const idDoc = await db.collection(COLLECTIONS.users).doc(query).get();
                if (idDoc.exists && idDoc.id !== user.uid) {
                    idResult = { id: idDoc.id, ...idDoc.data() };
                }
            }

            let results = nameSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(u => u.id !== user.uid);

            if (idResult && !results.find(r => r.id === idResult.id)) {
                results.unshift(idResult);
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
        setLoading(false);
    };

    const sendFriendRequest = async (targetUser) => {
        const existingRequest = outgoingRequests.find(r => r.toId === targetUser.id);
        const alreadyFriend = friends.some(f => f.id === targetUser.id);

        if (existingRequest || alreadyFriend) {
            alert(alreadyFriend ? 'Already friends!' : 'Request already sent!');
            return;
        }

        try {
            await db.collection(COLLECTIONS.friendRequests).add({
                fromId: user.uid,
                fromName: userData.displayName,
                fromPhoto: userData.photoURL,
                toId: targetUser.id,
                toName: targetUser.displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            alert('Friend request sent!');
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Send request error:', error);
        }
    };

    const acceptRequest = async (request) => {
        try {
            // Add to both users' friends list
            await db.collection(COLLECTIONS.users).doc(user.uid).update({
                friends: firebase.firestore.FieldValue.arrayUnion({
                    id: request.fromId,
                    name: request.fromName,
                    photoURL: request.fromPhoto
                })
            });

            await db.collection(COLLECTIONS.users).doc(request.fromId).update({
                friends: firebase.firestore.FieldValue.arrayUnion({
                    id: user.uid,
                    name: userData.displayName,
                    photoURL: userData.photoURL
                })
            });

            // Delete request
            await db.collection(COLLECTIONS.friendRequests).doc(request.id).delete();
        } catch (error) {
            console.error('Accept request error:', error);
        }
    };

    const rejectRequest = async (request) => {
        try {
            await db.collection(COLLECTIONS.friendRequests).doc(request.id).delete();
        } catch (error) {
            console.error('Reject request error:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedFriend) return;

        try {
            const chatId = [user.uid, selectedFriend.id].sort().join('_');
            
            await db.collection(COLLECTIONS.messages).add({
                chatId,
                fromId: user.uid,
                fromName: userData.displayName,
                toId: selectedFriend.id,
                text: newMessage.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    const tabs = [
        { id: 'friends', name: 'Friends', icon: '👥', count: friends.length },
        { id: 'requests', name: 'Requests', icon: '📨', count: incomingRequests.length },
        { id: 'search', name: 'Search', icon: '🔍' },
        { id: 'chat', name: 'Chat', icon: '💬' }
    ];

    return React.createElement('div', {
        className: 'friends-container',
        style: { padding: '16px' }
    }, [
        // Tabs
        React.createElement('div', {
            key: 'tabs',
            style: {
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                padding: '4px'
            }
        }, tabs.map(tab => 
            React.createElement('button', {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                style: {
                    background: activeTab === tab.id ? 
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                        'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    position: 'relative'
                }
            }, [
                `${tab.icon} ${tab.name}`,
                tab.count > 0 && React.createElement('span', {
                    key: 'badge',
                    style: {
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ff6b6b',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '12px'
                    }
                }, tab.count)
            ])
        )),

        // Search Tab
        activeTab === 'search' && React.createElement('div', { key: 'search' }, [
            React.createElement('input', {
                key: 'input',
                type: 'text',
                placeholder: 'Search by name or ID...',
                value: searchQuery,
                onChange: (e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                },
                style: {
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    marginBottom: '16px'
                }
            }),

            loading && React.createElement(LoadingSpinner, { key: 'loading', message: 'Searching...' }),

            searchResults.map(result =>
                React.createElement('div', {
                    key: result.id,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '8px'
                    }
                }, [
                    React.createElement(AvatarFrame, {
                        key: 'avatar',
                        photoURL: result.photoURL,
                        frame: result.equipped?.frame,
                        size: 48
                    }),
                    React.createElement('div', { 
                        key: 'info', 
                        style: { flex: 1 } 
                    }, [
                        React.createElement('div', { 
                            key: 'name', 
                            style: { fontWeight: 'bold' } 
                        }, result.displayName),
                        React.createElement('div', { 
                            key: 'id', 
                            style: { fontSize: '12px', opacity: 0.7 } 
                        }, `ID: ${result.id}`)
                    ]),
                    React.createElement('button', {
                        key: 'add',
                        onClick: () => sendFriendRequest(result),
                        style: {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }
                    }, friends.some(f => f.id === result.id) ? '✓ Friends' : 
                       outgoingRequests.some(r => r.toId === result.id) ? 'Sent' : 'Add')
                ])
            )
        ]),

        // Friends Tab
        activeTab === 'friends' && React.createElement('div', { key: 'friends' }, 
            friends.length === 0 ? 
                React.createElement('p', { 
                    style: { textAlign: 'center', opacity: 0.7 } 
                }, 'No friends yet. Search to add friends!') :
                friends.map(friend =>
                    React.createElement('div', {
                        key: friend.id,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '8px',
                            cursor: 'pointer'
                        },
                        onClick: () => {
                            setSelectedFriend(friend);
                            setActiveTab('chat');
                        }
                    }, [
                        React.createElement(AvatarFrame, {
                            key: 'avatar',
                            photoURL: friend.photoURL,
                            size: 48
                        }),
                        React.createElement('div', { 
                            key: 'name', 
                            style: { flex: 1, fontWeight: 'bold' } 
                        }, friend.name),
                        React.createElement('span', { key: 'chat' }, '💬')
                    ])
                )
        ),

        // Requests Tab
        activeTab === 'requests' && React.createElement('div', { key: 'requests' },
            incomingRequests.length === 0 ?
                React.createElement('p', { 
                    style: { textAlign: 'center', opacity: 0.7 } 
                }, 'No pending requests') :
                incomingRequests.map(request =>
                    React.createElement('div', {
                        key: request.id,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '8px'
                        }
                    }, [
                        React.createElement('img', {
                            key: 'avatar',
                            src: request.fromPhoto || `https://ui-avatars.com/api/?name=${request.fromName}`,
                            style: { width: '48px', height: '48px', borderRadius: '50%' }
                        }),
                        React.createElement('div', { 
                            key: 'name', 
                            style: { flex: 1, fontWeight: 'bold' } 
                        }, request.fromName),
                        React.createElement('button', {
                            key: 'accept',
                            onClick: () => acceptRequest(request),
                            style: {
                                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginRight: '8px'
                            }
                        }, '✓'),
                        React.createElement('button', {
                            key: 'reject',
                            onClick: () => rejectRequest(request),
                            style: {
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }
                        }, '✕')
                    ])
                )
        ),

        // Chat Tab
        activeTab === 'chat' && React.createElement('div', { key: 'chat' },
            !selectedFriend ?
                React.createElement('p', { 
                    style: { textAlign: 'center', opacity: 0.7 } 
                }, 'Select a friend to chat') :
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        height: '400px'
                    }
                }, [
                    // Chat Header
                    React.createElement('div', {
                        key: 'header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '12px'
                        }
                    }, [
                        React.createElement('img', {
                            key: 'avatar',
                            src: selectedFriend.photoURL || `https://ui-avatars.com/api/?name=${selectedFriend.name}`,
                            style: { width: '40px', height: '40px', borderRadius: '50%' }
                        }),
                        React.createElement('span', { 
                            key: 'name', 
                            style: { fontWeight: 'bold' } 
                        }, selectedFriend.name)
                    ]),

                    // Messages
                    React.createElement('div', {
                        key: 'messages',
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            marginBottom: '12px'
                        }
                    }, messages.map(msg =>
                        React.createElement('div', {
                            key: msg.id,
                            style: {
                                display: 'flex',
                                justifyContent: msg.fromId === user.uid ? 'flex-end' : 'flex-start',
                                marginBottom: '8px'
                            }
                        }, React.createElement('div', {
                            style: {
                                background: msg.fromId === user.uid ? 
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                    'rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                borderRadius: '16px',
                                maxWidth: '70%'
                            }
                        }, msg.text))
                    )),

                    // Input
                    React.createElement('div', {
                        key: 'input',
                        style: { display: 'flex', gap: '8px' }
                    }, [
                        React.createElement('input', {
                            key: 'text',
                            type: 'text',
                            placeholder: 'Type a message...',
                            value: newMessage,
                            onChange: (e) => setNewMessage(e.target.value),
                            onKeyPress: (e) => e.key === 'Enter' && sendMessage(),
                            style: {
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                fontSize: '16px'
                            }
                        }),
                        React.createElement('button', {
                            key: 'send',
                            onClick: sendMessage,
                            style: {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }
                        }, '📤')
                    ])
                ])
        )
    ]);
};

// =====================================================
// GAME ROOM COMPONENT
// =====================================================
const GameRoom = ({ user, userData, isGuest, guestData, onLeaveRoom }) => {
    const [room, setRoom] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [word, setWord] = React.useState(null);
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [votes, setVotes] = React.useState({});
    const [hasVoted, setHasVoted] = React.useState(false);
    const [gameResult, setGameResult] = React.useState(null);

    const currentData = isGuest ? guestData : userData;
    const playerId = isGuest ? guestData?.id : user?.uid;

    // Subscribe to room updates
    React.useEffect(() => {
        if (!currentData?.currentRoom) return;

        const unsubscribe = db.collection(COLLECTIONS.rooms)
            .doc(currentData.currentRoom)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const roomData = { id: doc.id, ...doc.data() };
                    setRoom(roomData);
                    
                    // Check if game ended
                    if (roomData.phase === GAME_PHASES.RESULTS) {
                        determineResult(roomData);
                    }
                } else {
                    onLeaveRoom();
                }
                setLoading(false);
            });

        return () => unsubscribe();
    }, [currentData?.currentRoom]);

    // Timer for discussion phase
    React.useEffect(() => {
        if (room?.phase === GAME_PHASES.DISCUSSION && room.discussionEndTime) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.floor((room.discussionEndTime.toDate() - Date.now()) / 1000));
                setTimeLeft(remaining);

                if (remaining === 0) {
                    // Auto transition to voting
                    handlePhaseTransition(GAME_PHASES.VOTING);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [room?.phase, room?.discussionEndTime]);

    const determineResult = (roomData) => {
        const players = roomData.players || [];
        const spy = players.find(p => p.role === PLAYER_ROLES.SPY);
        const voteCounts = {};

        // Count votes
        Object.entries(roomData.votes || {}).forEach(([voterId, votedForId]) => {
            voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
        });

        // Find most voted
        let maxVotes = 0;
        let mostVotedId = null;
        Object.entries(voteCounts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                mostVotedId = playerId;
            }
        });

        const mostVotedPlayer = players.find(p => p.id === mostVotedId);

        setGameResult({
            spy,
            mostVoted: mostVotedPlayer,
            civiliansWin: mostVotedPlayer?.id === spy?.id,
            voteCounts
        });
    };

    const handlePhaseTransition = async (newPhase) => {
        if (!room) return;

        try {
            const updates = { phase: newPhase };

            if (newPhase === GAME_PHASES.DISCUSSION) {
                // Set discussion end time (2 minutes from now)
                updates.discussionEndTime = firebase.firestore.Timestamp.fromDate(
                    new Date(Date.now() + 120 * 1000)
                );
            }

            await db.collection(COLLECTIONS.rooms).doc(room.id).update(updates);
        } catch (error) {
            console.error('Phase transition error:', error);
        }
    };

    const startGame = async () => {
        if (!room || room.players.length < 3) {
            alert('Need at least 3 players to start!');
            return;
        }

        try {
            // Assign roles
            const shuffledPlayers = shuffleArray(room.players);
            const spyIndex = Math.floor(Math.random() * shuffledPlayers.length);

            // Pick word pair
            const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];

            const updatedPlayers = shuffledPlayers.map((player, index) => ({
                ...player,
                role: index === spyIndex ? PLAYER_ROLES.SPY : PLAYER_ROLES.CIVILIAN,
                word: index === spyIndex ? wordPair.spy : wordPair.civilian
            }));

            await db.collection(COLLECTIONS.rooms).doc(room.id).update({
                phase: GAME_PHASES.ROLE_REVEAL,
                players: updatedPlayers,
                wordPair,
                votes: {}
            });
        } catch (error) {
            console.error('Start game error:', error);
        }
    };

    const handleVote = async (targetId) => {
        if (hasVoted || !room) return;

        try {
            const newVotes = { ...room.votes, [playerId]: targetId };
            
            await db.collection(COLLECTIONS.rooms).doc(room.id).update({
                votes: newVotes
            });

            setHasVoted(true);

            // Check if all players voted
            if (Object.keys(newVotes).length === room.players.length) {
                await handlePhaseTransition(GAME_PHASES.RESULTS);
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    };

    const revealRole = async () => {
        if (!room) return;

        // Find current player and show their word
        const currentPlayer = room.players.find(p => p.id === playerId);
        if (currentPlayer) {
            setWord(currentPlayer.word);
        }

        // After short delay, start discussion
        setTimeout(() => {
            handlePhaseTransition(GAME_PHASES.DISCUSSION);
        }, 3000);
    };

    const leaveRoom = async () => {
        if (!room || !playerId) return;

        try {
            const updatedPlayers = room.players.filter(p => p.id !== playerId);

            if (updatedPlayers.length === 0) {
                // Delete room if empty
                await db.collection(COLLECTIONS.rooms).doc(room.id).delete();
            } else {
                await db.collection(COLLECTIONS.rooms).doc(room.id).update({
                    players: updatedPlayers
                });
            }

            // Update user/guest currentRoom
            const collection = isGuest ? COLLECTIONS.guests : COLLECTIONS.users;
            await db.collection(collection).doc(playerId).update({
                currentRoom: null
            });

            onLeaveRoom();
        } catch (error) {
            console.error('Leave room error:', error);
        }
    };

    const playAgain = async () => {
        if (!room) return;

        try {
            await db.collection(COLLECTIONS.rooms).doc(room.id).update({
                phase: GAME_PHASES.LOBBY,
                players: room.players.map(p => ({ ...p, role: null, word: null })),
                votes: {},
                wordPair: null,
                discussionEndTime: null
            });

            setWord(null);
            setHasVoted(false);
            setGameResult(null);
        } catch (error) {
            console.error('Play again error:', error);
        }
    };

    if (loading) {
        return React.createElement(LoadingSpinner, { message: 'Loading room...' });
    }

    if (!room) {
        return React.createElement('div', {
            style: { textAlign: 'center', padding: '40px' }
        }, [
            React.createElement('h2', { key: 'title' }, 'Room not found'),
            React.createElement('button', {
                key: 'back',
                onClick: onLeaveRoom,
                style: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '16px'
                }
            }, 'Back to Menu')
        ]);
    }

    const isHost = room.hostId === playerId;
    const currentPlayer = room.players.find(p => p.id === playerId);

    // Render based on game phase
    const renderPhase = () => {
        switch (room.phase) {
            case GAME_PHASES.LOBBY:
                return React.createElement('div', {
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('h2', { 
                        key: 'title',
                        style: { marginBottom: '20px' } 
                    }, 'Waiting for Players'),

                    React.createElement('div', {
                        key: 'code',
                        style: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            display: 'inline-block'
                        }
                    }, [
                        React.createElement('span', { 
                            key: 'label',
                            style: { opacity: 0.7, marginRight: '8px' } 
                        }, 'Room Code:'),
                        React.createElement('span', { 
                            key: 'code',
                            style: { fontWeight: 'bold', fontSize: '24px' } 
                        }, room.id)
                    ]),

                    React.createElement('div', {
                        key: 'players',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '24px'
                        }
                    }, room.players.map(player =>
                        React.createElement(PlayerCard, {
                            key: player.id,
                            player: player,
                            isCurrentUser: player.id === playerId
                        })
                    )),

                    React.createElement('p', { 
                        key: 'count',
                        style: { marginBottom: '20px' } 
                    }, `${room.players.length}/10 Players`),

                    isHost && room.players.length >= 3 && React.createElement('button', {
                        key: 'start',
                        onClick: startGame,
                        style: {
                            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                            border: 'none',
                            padding: '16px 48px',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }
                    }, '🎮 Start Game'),

                    React.createElement('button', {
                        key: 'leave',
                        onClick: leaveRoom,
                        style: {
                            background: 'rgba(255, 107, 107, 0.2)',
                            border: '1px solid rgba(255, 107, 107, 0.5)',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            color: '#ff6b6b',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '16px',
                            marginLeft: '12px'
                        }
                    }, 'Leave Room')
                ]);

            case GAME_PHASES.ROLE_REVEAL:
                return React.createElement('div', {
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('h2', { 
                        key: 'title',
                        style: { marginBottom: '30px' } 
                    }, '🎭 Your Role'),

                    word ? React.createElement('div', {
                        key: 'reveal',
                        style: {
                            background: currentPlayer?.role === PLAYER_ROLES.SPY ?
                                'linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(238, 90, 90, 0.3) 100%)' :
                                'linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(68, 160, 141, 0.3) 100%)',
                            padding: '32px',
                            borderRadius: '20px',
                            marginBottom: '20px'
                        }
                    }, [
                        React.createElement('h3', { 
                            key: 'role',
                            style: { fontSize: '28px', marginBottom: '16px' } 
                        }, currentPlayer?.role === PLAYER_ROLES.SPY ? '🕵️ You are the SPY!' : '👤 You are a Civilian'),

                        React.createElement('p', { 
                            key: 'word',
                            style: { fontSize: '24px', fontWeight: 'bold' } 
                        }, `Word: ${word}`),

                        currentPlayer?.role === PLAYER_ROLES.SPY && React.createElement('p', {
                            key: 'hint',
                            style: { marginTop: '12px', opacity: 0.7 }
                        }, "Try to blend in and guess the civilian word!")
                    ]) : React.createElement('button', {
                        key: 'reveal',
                        onClick: revealRole,
                        style: {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            padding: '20px 40px',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }
                    }, '👁️ Reveal My Role')
                ]);

            case GAME_PHASES.DISCUSSION:
                return React.createElement('div', {
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('h2', { 
                        key: 'title',
                        style: { marginBottom: '20px' } 
                    }, '💬 Discussion Time'),

                    React.createElement('div', {
                        key: 'timer',
                        style: {
                            background: timeLeft < 30 ? 
                                'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)' :
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            display: 'inline-block',
                            fontSize: '24px',
                            fontWeight: 'bold'
                        }
                    }, `⏱️ ${formatTime(timeLeft)}`),

                    React.createElement('p', { 
                        key: 'word',
                        style: { marginBottom: '20px' } 
                    }, `Your word: ${word}`),

                    React.createElement('div', {
                        key: 'players',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '12px'
                        }
                    }, room.players.map(player =>
                        React.createElement(PlayerCard, {
                            key: player.id,
                            player: player,
                            isCurrentUser: player.id === playerId
                        })
                    ))
                ]);

            case GAME_PHASES.VOTING:
                return React.createElement('div', {
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('h2', { 
                        key: 'title',
                        style: { marginBottom: '20px' } 
                    }, '🗳️ Vote for the Spy!'),

                    hasVoted && React.createElement('p', {
                        key: 'voted',
                        style: { marginBottom: '20px', color: '#4ecdc4' }
                    }, '✓ You have voted! Waiting for others...'),

                    React.createElement('div', {
                        key: 'players',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '12px'
                        }
                    }, room.players.map(player => {
                        const voteCount = Object.values(room.votes || {}).filter(v => v === player.id).length;
                        return React.createElement(PlayerCard, {
                            key: player.id,
                            player: player,
                            isCurrentUser: player.id === playerId,
                            voteCount,
                            onVote: handleVote,
                            hasVoted
                        });
                    }))
                ]);

            case GAME_PHASES.RESULTS:
                return React.createElement('div', {
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('h2', { 
                        key: 'title',
                        style: { 
                            fontSize: '32px',
                            marginBottom: '20px',
                            color: gameResult?.civiliansWin ? '#4ecdc4' : '#ff6b6b'
                        } 
                    }, gameResult?.civiliansWin ? '🎉 Civilians Win!' : '🕵️ Spy Wins!'),

                    React.createElement('div', {
                        key: 'spy',
                        style: {
                            background: 'rgba(255, 107, 107, 0.2)',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }
                    }, [
                        React.createElement('p', { key: 'label', style: { opacity: 0.7 } }, 'The Spy was:'),
                        React.createElement('p', { 
                            key: 'name',
                            style: { fontSize: '24px', fontWeight: 'bold' } 
                        }, `${gameResult?.spy?.name || 'Unknown'}`)
                    ]),

                    React.createElement('p', { 
                        key: 'words',
                        style: { marginBottom: '24px' } 
                    }, [
                        `Civilian word: ${room.wordPair?.civilian}`,
                        React.createElement('br', { key: 'br' }),
                        `Spy word: ${room.wordPair?.spy}`
                    ]),

                    isHost && React.createElement('button', {
                        key: 'again',
                        onClick: playAgain,
                        style: {
                            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }
                    }, '🔄 Play Again'),

                    React.createElement('button', {
                        key: 'leave',
                        onClick: leaveRoom,
                        style: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '16px',
                            marginLeft: '12px'
                        }
                    }, 'Leave Room')
                ]);

            default:
                return null;
        }
    };

    return React.createElement('div', {
        className: 'game-room',
        style: { padding: '20px' }
    }, renderPhase());
};

// =====================================================
// MAIN MENU COMPONENT
// =====================================================
const MainMenu = ({ user, userData, isGuest, guestData, onCreateGuest, onJoinRoom, onCreateRoom, onLogout }) => {
    const [joinCode, setJoinCode] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const currentData = isGuest ? guestData : userData;

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        
        setLoading(true);
        
        // Create guest if needed
        let playerId = isGuest ? guestData?.id : user?.uid;
        let playerName = isGuest ? guestData?.name : userData?.displayName;
        let playerPhoto = isGuest ? null : userData?.photoURL;
        
        if (!playerId && isGuest) {
            const guest = await onCreateGuest();
            playerId = guest.id;
            playerName = guest.name;
        }

        await onJoinRoom(joinCode.toUpperCase(), {
            id: playerId,
            name: playerName,
            photoURL: playerPhoto,
            equipped: currentData?.equipped
        });
        
        setLoading(false);
    };

    const handleCreate = async () => {
        setLoading(true);
        
        // Create guest if needed
        let playerId = isGuest ? guestData?.id : user?.uid;
        let playerName = isGuest ? guestData?.name : userData?.displayName;
        let playerPhoto = isGuest ? null : userData?.photoURL;
        
        if (!playerId && isGuest) {
            const guest = await onCreateGuest();
            playerId = guest.id;
            playerName = guest.name;
        }

        await onCreateRoom({
            id: playerId,
            name: playerName,
            photoURL: playerPhoto,
            equipped: currentData?.equipped
        });
        
        setLoading(false);
    };

    return React.createElement('div', {
        className: 'main-menu',
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '20px'
        }
    }, [
        // Logo & Title
        React.createElement('div', {
            key: 'header',
            style: { textAlign: 'center' }
        }, [
            React.createElement('h1', {
                key: 'title',
                style: {
                    fontSize: '48px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                }
            }, '🕵️ PRO SPY'),
            React.createElement('p', {
                key: 'subtitle',
                style: { opacity: 0.7, fontSize: '18px' }
            }, 'Find the spy among us!')
        ]),

        // User Info Card
        React.createElement('div', {
            key: 'user-card',
            style: {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                width: '100%',
                maxWidth: '400px'
            }
        }, [
            React.createElement('div', {
                key: 'user-info',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }
            }, [
                React.createElement(AvatarFrame, {
                    key: 'avatar',
                    photoURL: currentData?.photoURL,
                    frame: currentData?.equipped?.frame,
                    size: 64
                }),
                React.createElement('div', { key: 'details', style: { flex: 1 } }, [
                    React.createElement('div', { 
                        key: 'name',
                        style: { fontWeight: 'bold', fontSize: '20px' } 
                    }, currentData?.displayName || currentData?.name || 'Player'),
                    React.createElement('div', { 
                        key: 'status',
                        style: { opacity: 0.7, fontSize: '14px' } 
                    }, isGuest ? '🎭 Guest Account' : '✨ Registered'),
                    
                    // Badges for registered users
                    !isGuest && currentData?.equipped?.badges?.length > 0 && 
                    React.createElement(BadgeDisplay, {
                        key: 'badges',
                        badges: currentData.equipped.badges,
                        size: 20
                    })
                ])
            ]),

            // Currency for registered users
            !isGuest && React.createElement('div', {
                key: 'currency',
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '16px'
                }
            }, React.createElement(CurrencyDisplay, { coins: userData?.coins }))
        ]),

        // Action Buttons
        React.createElement('div', {
            key: 'actions',
            style: {
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }
        }, [
            React.createElement('button', {
                key: 'create',
                onClick: handleCreate,
                disabled: loading,
                style: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    padding: '18px 32px',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                }
            }, loading ? 'Creating...' : '🎮 Create Room'),

            React.createElement('div', {
                key: 'join',
                style: {
                    display: 'flex',
                    gap: '8px'
                }
            }, [
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Enter Room Code',
                    value: joinCode,
                    onChange: (e) => setJoinCode(e.target.value.toUpperCase()),
                    maxLength: 6,
                    style: {
                        flex: 1,
                        padding: '18px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '18px',
                        textAlign: 'center',
                        letterSpacing: '4px'
                    }
                }),
                React.createElement('button', {
                    key: 'btn',
                    onClick: handleJoin,
                    disabled: loading || joinCode.length < 4,
                    style: {
                        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                        border: 'none',
                        padding: '18px 24px',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        cursor: 'pointer',
                        opacity: (loading || joinCode.length < 4) ? 0.5 : 1
                    }
                }, 'Join')
            ])
        ]),

        // Sign In Button (only for guests)
        isGuest && React.createElement('button', {
            key: 'signin',
            onClick: onLogout,
            style: {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
            }
        }, '🔑 Sign In with Google')
    ]);
};

// =====================================================
// MAIN APP COMPONENT
// =====================================================
const App = () => {
    // Auth State
    const [user, setUser] = React.useState(null);
    const [userData, setUserData] = React.useState(null);
    const [guestData, setGuestData] = React.useState(null);
    const [isGuest, setIsGuest] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    // UI State
    const [currentView, setCurrentView] = React.useState('menu');
    const [showShop, setShowShop] = React.useState(false);
    const [showFriends, setShowFriends] = React.useState(false);

    // Auth Listener
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                
                // Get or create user document
                const userDoc = await db.collection(COLLECTIONS.users).doc(firebaseUser.uid).get();
                
                if (userDoc.exists) {
                    setUserData({ id: userDoc.id, ...userDoc.data() });
                } else {
                    // Create new user
                    const newUserData = {
                        displayName: firebaseUser.displayName || 'Player',
                        photoURL: firebaseUser.photoURL,
                        email: firebaseUser.email,
                        coins: 500, // Starting coins
                        inventory: { frames: [], titles: [], badges: [], gifts: [] },
                        equipped: { frame: null, title: null, badges: [] },
                        friends: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    await db.collection(COLLECTIONS.users).doc(firebaseUser.uid).set(newUserData);
                    setUserData({ id: firebaseUser.uid, ...newUserData });
                }

                setIsGuest(false);
            } else {
                // Check for existing guest
                const storedGuestId = localStorage.getItem('prospy_guest_id');
                
                if (storedGuestId) {
                    const guestDoc = await db.collection(COLLECTIONS.guests).doc(storedGuestId).get();
                    
                    if (guestDoc.exists) {
                        setGuestData({ id: guestDoc.id, ...guestDoc.data() });
                        setIsGuest(true);
                    } else {
                        localStorage.removeItem('prospy_guest_id');
                    }
                }
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Subscribe to user/guest updates
    React.useEffect(() => {
        if (!user && !guestData) return;

        const collection = isGuest ? COLLECTIONS.guests : COLLECTIONS.users;
        const docId = isGuest ? guestData.id : user.uid;

        const unsubscribe = db.collection(collection).doc(docId)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = { id: doc.id, ...doc.data() };
                    if (isGuest) {
                        setGuestData(data);
                    } else {
                        setUserData(data);
                    }
                }
            });

        return () => unsubscribe();
    }, [user, guestData, isGuest]);

    // Create Guest Account
    const createGuest = async () => {
        const guestId = generateGuestId();
        const guestName = generateGuestName();

        const newGuest = {
            id: guestId,
            name: guestName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            equipped: { frame: null, title: null, badges: [] }
        };

        await db.collection(COLLECTIONS.guests).doc(guestId).set(newGuest);
        localStorage.setItem('prospy_guest_id', guestId);
        
        setGuestData({ id: guestId, ...newGuest });
        setIsGuest(true);

        return { id: guestId, name: guestName };
    };

    // Sign In with Google
    const signInWithGoogle = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    // Sign Out
    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserData(null);
            setIsGuest(false);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // Create Room
    const createRoom = async (playerInfo) => {
        const roomCode = generateRoomCode();

        const newRoom = {
            id: roomCode,
            hostId: playerInfo.id,
            players: [playerInfo],
            phase: GAME_PHASES.LOBBY,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(COLLECTIONS.rooms).doc(roomCode).set(newRoom);

        // Update current user's currentRoom
        const collection = isGuest ? COLLECTIONS.guests : COLLECTIONS.users;
        await db.collection(collection).doc(playerInfo.id).update({
            currentRoom: roomCode
        });

        if (isGuest) {
            setGuestData(prev => ({ ...prev, currentRoom: roomCode }));
        } else {
            setUserData(prev => ({ ...prev, currentRoom: roomCode }));
        }

        setCurrentView('room');
    };

    // Join Room
    const joinRoom = async (roomCode, playerInfo) => {
        const roomDoc = await db.collection(COLLECTIONS.rooms).doc(roomCode).get();

        if (!roomDoc.exists) {
            alert('Room not found!');
            return;
        }

        const roomData = roomDoc.data();

        if (roomData.players.length >= 10) {
            alert('Room is full!');
            return;
        }

        if (roomData.phase !== GAME_PHASES.LOBBY) {
            alert('Game already in progress!');
            return;
        }

        // Add player to room
        await db.collection(COLLECTIONS.rooms).doc(roomCode).update({
            players: firebase.firestore.FieldValue.arrayUnion(playerInfo)
        });

        // Update current user's currentRoom
        const collection = isGuest ? COLLECTIONS.guests : COLLECTIONS.users;
        await db.collection(collection).doc(playerInfo.id).update({
            currentRoom: roomCode
        });

        if (isGuest) {
            setGuestData(prev => ({ ...prev, currentRoom: roomCode }));
        } else {
            setUserData(prev => ({ ...prev, currentRoom: roomCode }));
        }

        setCurrentView('room');
    };

    // Leave Room
    const leaveRoom = () => {
        if (isGuest) {
            setGuestData(prev => ({ ...prev, currentRoom: null }));
        } else {
            setUserData(prev => ({ ...prev, currentRoom: null }));
        }
        setCurrentView('menu');
    };

    // Update User Data
    const updateUserData = (updates) => {
        setUserData(prev => ({ ...prev, ...updates }));
    };

    // Check if in room
    const currentData = isGuest ? guestData : userData;
    if (currentData?.currentRoom && currentView !== 'room') {
        setCurrentView('room');
    }

    if (loading) {
        return React.createElement(LoadingSpinner, { message: 'Loading PRO SPY...' });
    }

    // Determine which view to show
    const renderContent = () => {
        switch (currentView) {
            case 'room':
                return React.createElement(GameRoom, {
                    user,
                    userData,
                    isGuest,
                    guestData,
                    onLeaveRoom: leaveRoom
                });

            default:
                return React.createElement(MainMenu, {
                    user,
                    userData,
                    isGuest,
                    guestData,
                    onCreateGuest: createGuest,
                    onJoinRoom: joinRoom,
                    onCreateRoom: createRoom,
                    onLogout: isGuest ? signInWithGoogle : signOut
                });
        }
    };

    return React.createElement(AppContext.Provider, {
        value: {
            user,
            userData,
            guestData,
            isGuest,
            updateUserData
        }
    }, React.createElement('div', {
        style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: 'white',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }
    }, [
        // Header (only when not in game)
        currentView === 'menu' && React.createElement('header', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                background: 'rgba(0, 0, 0, 0.2)'
            }
        }, [
            // Left: Logo
            React.createElement('div', {
                key: 'logo',
                style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }
            }, '🕵️ PRO SPY'),

            // Right: Action buttons
            React.createElement('div', {
                key: 'actions',
                style: { display: 'flex', gap: '12px' }
            }, [
                // Shop (only for registered users)
                !isGuest && React.createElement('button', {
                    key: 'shop',
                    onClick: () => setShowShop(true),
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }
                }, '🛒 Shop'),

                // Friends (only for registered users)
                !isGuest && React.createElement('button', {
                    key: 'friends',
                    onClick: () => setShowFriends(true),
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }
                }, '👥 Friends'),

                // Sign Out (for registered users)
                !isGuest && React.createElement('button', {
                    key: 'logout',
                    onClick: signOut,
                    style: {
                        background: 'rgba(255, 107, 107, 0.2)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        color: '#ff6b6b',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }
                }, 'Sign Out')
            ])
        ]),

        // Main Content
        React.createElement('main', {
            key: 'main',
            style: {
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px'
            }
        }, renderContent()),

        // Shop Modal
        React.createElement(Modal, {
            key: 'shop-modal',
            isOpen: showShop,
            onClose: () => setShowShop(false),
            title: '🛒 Shop'
        }, React.createElement(Shop, {
            user,
            userData,
            onUpdateUser: updateUserData
        })),

        // Friends Modal
        React.createElement(Modal, {
            key: 'friends-modal',
            isOpen: showFriends,
            onClose: () => setShowFriends(false),
            title: '👥 Friends'
        }, React.createElement(Friends, {
            user,
            userData
        }))
    ]));
};

// =====================================================
// RENDER APPLICATION
// =====================================================
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        React.createElement(ErrorBoundary, null,
            React.createElement(App)
        )
    );
} else {
    console.error('Root element not found!');
}

// =====================================================
// CSS STYLES (Injected)
// =====================================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        min-height: 100vh;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes fireGlow {
        0% { box-shadow: 0 0 15px #ff6b6b; }
        100% { box-shadow: 0 0 25px #ffa500, 0 0 35px #ffcc00; }
    }

    @keyframes neonPulse {
        0% { box-shadow: 0 0 10px #00FF00, 0 0 20px #00FF00; }
        100% { box-shadow: 0 0 20px #00FF00, 0 0 40px #00FF00, 0 0 60px #00FF00; }
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    /* Scrollbar Styling */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
    }

    /* Input placeholder */
    input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    /* Button hover effects */
    button:not(:disabled):hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }

    button:disabled {
        cursor: not-allowed;
    }

    /* Modal animation */
    .modal-overlay {
        animation: fadeIn 0.2s ease;
    }

    .modal-content {
        animation: slideUp 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styleSheet);

console.log('🎮 PRO SPY v2.5 Loaded Successfully!');
