class Rocket {
    constructor(game) {
        this.game = game;
        this.width = 64;
        this.height = 64;
        
        // Start in middle of screen
        this.x = window.innerWidth / 2 - this.width / 2;
        this.y = window.innerHeight / 2 - this.height / 2;
        
        this.velocity = { x: 0, y: 0 };
        this.fuel = 100;
        this.boostEfficiency = 1;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.attachedBadItems = [];
        this.shield = {
            active: false,
            duration: 0,
            strength: 0
        };
        
        // Use game's asset manager
        this.assets = this.game.assets;
        
        // Create audio context and load sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSounds();
        } catch (error) {
            console.error('Audio not supported:', error);
        }
        
        // Set up keyboard controls
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });
        
        // Start video playback
        if (this.assets.video) {
            this.assets.video.play().catch(console.error);
        }
    }
    
    async loadSounds() {
        try {
            // Load rocket sound
            const rocketResponse = await fetch('assets/sounds/rocket.mp3');
            const rocketBuffer = await rocketResponse.arrayBuffer();
            this.rocketSound = await this.audioContext.decodeAudioData(rocketBuffer);
            
            // Load happy bark sound
            const barkResponse = await fetch('assets/sounds/happy_bark.mp3');
            const barkBuffer = await barkResponse.arrayBuffer();
            this.barkSound = await this.audioContext.decodeAudioData(barkBuffer);
            
            // Load yelp sound
            const yelpResponse = await fetch('assets/sounds/dog_yelp.mp3');
            const yelpBuffer = await yelpResponse.arrayBuffer();
            this.yelpSound = await this.audioContext.decodeAudioData(yelpBuffer);
            
        } catch (error) {
            console.error('Error loading sounds:', error);
            // Fallback to synthesized sounds if loading fails
            this.createSynthesizedSounds();
        }
    }
    
    createSynthesizedSounds() {
        // Create rocket sound
        this.rocketOscillator = this.audioContext.createOscillator();
        this.rocketGain = this.audioContext.createGain();
        this.rocketOscillator.type = 'sine';
        this.rocketOscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        this.rocketGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.rocketOscillator.connect(this.rocketGain);
        this.rocketGain.connect(this.audioContext.destination);
        this.rocketOscillator.start();
        
        // Create bark sound oscillator
        const barkOsc = this.audioContext.createOscillator();
        const barkGain = this.audioContext.createGain();
        barkOsc.type = 'square';
        barkOsc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        barkGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        barkOsc.connect(barkGain);
        barkGain.connect(this.audioContext.destination);
        barkOsc.start();
        this.synthBarkSound = { oscillator: barkOsc, gain: barkGain };
        
        // Create yelp sound oscillator
        const yelpOsc = this.audioContext.createOscillator();
        const yelpGain = this.audioContext.createGain();
        yelpOsc.type = 'sawtooth';
        yelpOsc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        yelpGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        yelpOsc.connect(yelpGain);
        yelpGain.connect(this.audioContext.destination);
        yelpOsc.start();
        this.synthYelpSound = { oscillator: yelpOsc, gain: yelpGain };
    }
    
    playSound(buffer) {
        if (!this.audioContext || !buffer) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
        return source;
    }
    
    playHappyBark() {
        if (this.barkSound) {
            // Play recorded sound
            this.playSound(this.barkSound);
        } else if (this.synthBarkSound) {
            // Play synthesized sound
            const now = this.audioContext.currentTime;
            this.synthBarkSound.gain.gain.setValueAtTime(0, now);
            this.synthBarkSound.gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
            this.synthBarkSound.gain.gain.linearRampToValueAtTime(0, now + 0.3);
            this.synthBarkSound.oscillator.frequency.setValueAtTime(200, now);
            this.synthBarkSound.oscillator.frequency.linearRampToValueAtTime(300, now + 0.2);
        }
    }
    
    playYelp() {
        if (this.yelpSound) {
            // Play recorded sound
            this.playSound(this.yelpSound);
        } else if (this.synthYelpSound) {
            // Play synthesized sound
            const now = this.audioContext.currentTime;
            this.synthYelpSound.gain.gain.setValueAtTime(0, now);
            this.synthYelpSound.gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
            this.synthYelpSound.gain.gain.linearRampToValueAtTime(0, now + 0.2);
            this.synthYelpSound.oscillator.frequency.setValueAtTime(400, now);
            this.synthYelpSound.oscillator.frequency.linearRampToValueAtTime(200, now + 0.2);
        }
    }
    
    addDeceleration(type) {
        if (type === 'good') {
            this.velocity.x *= 0.6; // Slight slowdown
            this.velocity.y *= 0.4;
        } else {
            this.velocity.x *= -1; // Major slowdown
            this.velocity.y *= -3;
        }
    }
    
    update(delta) {
        // Handle input
        if (this.keys.ArrowLeft) {
            this.velocity.x -= 0.5;
        }
        if (this.keys.ArrowRight) {
            this.velocity.x += 0.5;
        }
        if (this.keys.Space && this.fuel > 0) {
            this.boost();
        } else {
            this.stopBoost();
        }
        
        // Apply gravity based on number of attached items
        const baseGravity = 0.2;
        const additionalGravity = this.attachedBadItems.length * 0.05;
        this.velocity.y += baseGravity + additionalGravity;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Boundary checks
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        } else if (this.x > window.innerWidth - this.width) {
            this.x = window.innerWidth - this.width;
            this.velocity.x = 0;
        }
        
        // Apply drag
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.99;
        
        // Update shield
        if (this.shield.active) {
            this.shield.duration -= delta;
            if (this.shield.duration <= 0) {
                this.shield.active = false;
            }
        }
    }
    
    attachBadItem(item) {
        // Simply attach items directly below the rocket
        this.attachedBadItems.push({
            x: 0,  // Center aligned
            y: this.height + this.attachedBadItems.length * 30,
            symbol: item.symbol
        });
    }
    
    draw(ctx) {
        // Draw rocket (circular video)
        if (this.assets.video) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width/2,
                0,
                Math.PI * 2
            );
            ctx.clip();
            
            ctx.drawImage(
                this.assets.video,
                this.x,
                this.y,
                this.width,
                this.height
            );
            
            ctx.restore();
        } else {
            // Fallback shape if video isn't loaded
            ctx.beginPath();
            ctx.fillStyle = '#e74c3c';
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.arc(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
        }
        
        // Draw attached bad items
        this.attachedBadItems.forEach(item => {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(
                item.symbol,
                this.x + this.width/2 + item.x,
                this.y + item.y
            );
        });
        
        // Draw rocket flame (5x bigger)
        if (this.keys.Space && this.fuel > 0) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y + this.height);
            
            // Larger flame
            const flameHeight = 150; // 5x bigger
            const flameWidth = 40;
            
            ctx.lineTo(this.x + this.width/2 - flameWidth, this.y + this.height + flameHeight);
            ctx.lineTo(this.x + this.width/2 + flameWidth, this.y + this.height + flameHeight);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(
                this.x + this.width/2, this.y + this.height,
                this.x + this.width/2, this.y + this.height + flameHeight
            );
            gradient.addColorStop(0, '#ff4757');
            gradient.addColorStop(0.6, '#ffa502');
            gradient.addColorStop(1, 'rgba(255, 165, 2, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // Draw shield if active
        if (this.shield.active) {
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width/2 + 10,
                0,
                Math.PI * 2
            );
            ctx.strokeStyle = `rgba(46, 204, 113, ${this.shield.duration / 5000})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
    
    boost() {
        if (this.fuel > 0) {
            this.velocity.y -= 0.8 * this.boostEfficiency;
            this.fuel = Math.max(0, this.fuel - 1);
            
            // Play rocket sound
            if (!this.rocketSoundPlaying) {
                this.rocketSoundPlaying = this.playSound(this.rocketSound);
            }
        }
    }
    
    stopBoost() {
        if (this.rocketSoundPlaying) {
            this.rocketSoundPlaying.stop();
            this.rocketSoundPlaying = null;
        }
    }
    
    addFuel(amount) {
        this.fuel = Math.min(100, this.fuel + amount);
    }
    
    upgradeBoost() {
        this.boostEfficiency *= 1.2;
    }
    
    activateShield(duration, strength) {
        this.shield.active = true;
        this.shield.duration = duration;
        this.shield.strength = strength;
    }
}
