var audioContext = null;
var isAudioInitialized = false;

var initAudioContext = () => {
    if (audioContext) return audioContext;
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
        isAudioInitialized = true;
        return audioContext;
    } catch (e) {
        return null;
    }
};

var playSound = (type) => {
    try {
        if (typeof window !== 'undefined' && window.proSpySoundMuted) return;
        if (localStorage.getItem('pro_spy_sound_muted') === 'true') return;

        if (!audioContext) audioContext = initAudioContext();
        if (!audioContext) return;
        if (audioContext.state === 'suspended') audioContext.resume();

        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        var now = audioContext.currentTime;

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
    } catch (e) {}
};

var playNotificationSound = () => playSound('notification');
var playRewardSound       = () => playSound('reward');
var playMessageSound      = () => playSound('message');
var playSuccessSound      = () => playSound('success');
var playClickSound        = () => playSound('click');

// Expose to window for global access
window.playSound = playSound;
window.playNotificationSound = playNotificationSound;
window.playRewardSound = playRewardSound;
window.playMessageSound = playMessageSound;
window.playSuccessSound = playSuccessSound;
window.playClickSound = playClickSound;
