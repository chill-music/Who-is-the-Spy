/**
 * TurnTimer.js
 * Manages a 30-second countdown for game turns.
 * Triggers a callback on expiry for auto-roll/skip.
 */

(function() {
    class TurnTimer {
        constructor(durationSeconds = 30) {
            this.duration = durationSeconds;
            this.timeLeft = durationSeconds;
            this.timerId = null;
            this.onTick = null;
            this.onExpire = null;
        }

        start(onTick, onExpire) {
            this.stop();
            this.onTick = onTick;
            this.onExpire = onExpire;
            this.timeLeft = this.duration;

            this.timerId = setInterval(() => {
                this.timeLeft--;
                if (this.onTick) this.onTick(this.timeLeft);

                if (this.timeLeft <= 0) {
                    this.stop();
                    if (this.onExpire) this.onExpire();
                }
            }, 1000);
        }

        stop() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        }

        reset() {
            this.timeLeft = this.duration;
        }

        getRemaining() {
            return this.timeLeft;
        }
    }

    // Global Injection
    window.TurnTimer = TurnTimer;
})();
