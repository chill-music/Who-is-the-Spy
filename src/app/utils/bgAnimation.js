(function() {
    window.initBackgroundAnimation = function(canvasId) {
        var isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
        var particleCount = isMobile ? 0 : 40;
        var canvas = document.getElementById(canvasId);
        if (!canvas) return function() {};
        
        var ctx = canvas.getContext('2d');
        var width, height, particles = [];
        var mouse = { x: null, y: null };

        var resize = function() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        var handleMouseMove = function(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        var Particle = function() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
        };

        Particle.prototype.update = function() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            if (mouse.x != null) {
                var dx = mouse.x - this.x;
                var dy = mouse.y - this.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    var force = (150 - dist) / 150;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }
            }
        };

        Particle.prototype.draw = function() {
            ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        };

        for (var i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        var animId;
        var animate = function() {
            if (particleCount === 0) return;
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(112, 0, 255, 0.1)';
            ctx.lineWidth = 1;
            for (var i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (var j = i; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animId = requestAnimationFrame(animate);
        };

        if (particleCount > 0) animate();

        return function cleanup() {
            if (animId) cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    };
})();
