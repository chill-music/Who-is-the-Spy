let audioContext = null;
let isAudioInitialized = false;

const initAudioContext = () => {
    if (audioContext) return audioContext;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        isAudioInitialized = true;
        return audioContext;
    } catch (e) {
        return null;
    }
};

const playSound = (type) => {
    try {
        // Check if sound is muted
        if (typeof window !== 'undefined' && window.proSpySoundMuted) return;
        if (localStorage.getItem('pro_spy_sound_muted') === 'true') return;

        if (!audioContext) audioContext = initAudioContext();
        if (!audioContext) return;
        if (audioContext.state === 'suspended') audioContext.resume();

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        const now = audioContext.currentTime;

        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(1200, now + 0.15);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
            case 'gift':
                oscillator.frequency.setValueAtTime(523, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(784, now + 0.15);
                oscillator.frequency.linearRampToValueAtTime(1047, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;
            case 'notification':
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(1100, now + 0.1);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.2);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
            case 'reward':
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(554, now + 0.1);
                oscillator.frequency.linearRampToValueAtTime(659, now + 0.2);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
            case 'message':
                oscillator.frequency.setValueAtTime(660, now);
                oscillator.type = 'triangle';
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.08);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
        }
    } catch (e) {
    }
};

const initAudioOnFirstInteraction = () => {
    if (!isAudioInitialized) {
        initAudioContext();
        playSound('click');
    }
};

// Initialize sound mute state from localStorage
if (typeof window !== 'undefined') {
    window.proSpySoundMuted = localStorage.getItem('pro_spy_sound_muted') === 'true';
}

if (typeof window !== 'undefined') {
    const initEvents = ['click', 'touchstart', 'keydown'];
    const initHandler = () => {
        initAudioOnFirstInteraction();
        initEvents.forEach(event => document.removeEventListener(event, initHandler));
    };
    initEvents.forEach(event => document.addEventListener(event, initHandler, { once: true }));
}

const playNotificationSound = () => playSound('notification');
const playRewardSound = () => playSound('reward');
// playGiftSound removed — was never called anywhere in the project

// LOGIN REWARDS - 30 DAYS

// 🎫 FUN PASS SYSTEM - 50 levels, daily/weekly missions

// 🔧 FUN PASS SEASON CONFIG - بتتجدد كل 3 شهور
//    عشان تجدد السيزون:
//    1. غير FUN_PASS_SEASON_ID لرقم جديد (مثلاً: '2', '3', '4')
//    2. كل المستخدمين هيتصفر تقدمهم تلقائياً في السيزون الجديد
