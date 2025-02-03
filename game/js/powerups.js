class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
        this.spawnTimer = 0;
        this.spawnInterval = 300;
        this.particles = new ParticleSystem();
        
        // Define level-specific symbols
        this.levelSymbols = {
            1: { // Eat!
                good: ['🥩', '🥚', '🐟', '🥦', '🥑', '🍎', '🫐', '🥝','🍔'],
                bad: ['🍟', '🍕', '🌭', '🍪', '🍩']
            },
            2: { // Workout!
                good: ['💪', '🏋️', '🚴', '🧘', '⚽'],
                bad: [ '🏃','📱', '🎮', '📺']
            },
            3: { // Sleep!
                good: ['🛏️', '😴', '🌙', '🎧', '🌟'],
                bad: ['📱', '💻', '🎮', '📺', '🔊']
            },
            4: { // Be Clean!
                good: ['🚿', '🧼', '🧴', '🪥'],
                bad: ['🦠', '🗑️', '🧦', '💩']
            },
            5: { // Be Happy!
                good: ['😊', '❤️', '🤗'],
                bad: ['😠', '😢', '😫', '⛈️']
            }
        };
    }
    
    getCurrentSymbols() {
        const level = Math.min(6, Math.floor(this.game.survivalTime / 20) + 1);
        
        // Special celebration level with all symbols
        if (level === 6) {
            // Combine all symbols from all levels
            const allGood = Object.values(this.levelSymbols)
                .map(level => level.good)
                .flat();
            const allBad = Object.values(this.levelSymbols)
                .map(level => level.bad)
                .flat();
                
            // Set spawn interval to super fast
            this.spawnInterval = 1;
            
            return {
                good: [...new Set(allGood)], // Remove duplicates
                bad: [...new Set(allBad)]    // Remove duplicates
            };
        }
        
        return this.levelSymbols[level];
    }
    
    spawn() {
        const baseSize = 60;  // Base size for good items
        const level = Math.min(6, Math.floor(this.game.survivalTime / 20) + 1);
        
        // In celebration level, spawn more items
        const spawnCount = level === 6 ? 
            Math.floor(Math.random() * 5) + 3 : // 3-8 items in celebration
            Math.floor(Math.random() * 3) + 1;  // 1-3 items normally
        
        for (let i = 0; i < spawnCount; i++) {
            const isGood = Math.random() > 0.1;
            const currentSymbols = this.getCurrentSymbols();
            const symbols = isGood ? currentSymbols.good : currentSymbols.bad;
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            
            // Make bad items 2x bigger
            const size = isGood ? baseSize : baseSize * 2;
            
            // In celebration level, spread items across the whole width
            const margin = level === 6 ? 0 : 100;
            const x = margin + Math.random() * (window.innerWidth - size - 2 * margin);
            const y = -size - (Math.random() * 100);
            
            // Make bad items 2x slower, but faster in celebration
            const baseSpeed = level === 6 ? 5 + Math.random() * 2 : 3 + Math.random();
            const speed = isGood ? baseSpeed : baseSpeed / 2;
            
            this.powerUps.push({
                x,
                y,
                width: size,
                height: size,
                velocity: {
                    x: (Math.random() - 0.5) * (level === 6 ? 4 : 2), // More horizontal movement in celebration
                    y: speed
                },
                good: isGood,
                symbol
            });
        }
    }
    
    update(delta) {
        this.spawnTimer += delta * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawn();
            this.spawnTimer = 0;
        }
        
        this.particles.update(delta);
        
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            powerUp.x += powerUp.velocity.x;
            powerUp.y += powerUp.velocity.y;
            
            if (powerUp.x < 0 || powerUp.x > window.innerWidth - powerUp.width) {
                powerUp.velocity.x *= -1;
            }
            
            if (this.checkCollision(powerUp, this.game.rocket)) {
                if (powerUp.good) {
                    this.game.rocket.addFuel(20);
                    this.game.stats.healthyFoodEaten++;
                    this.showMessage('Good choice! +20 Fuel');
                    this.game.rocket.playHappyBark();
                    this.game.rocket.addDeceleration('good');
                    
                    // Create green sparkle effect for good items
                    for (let j = 0; j < 15; j++) {
                        this.particles.createParticle(
                            powerUp.x + powerUp.width/2,
                            powerUp.y + powerUp.height/2,
                            '#2ecc71',
                            2 + Math.random() * 3,
                            Math.random() * Math.PI * 2,
                            3 + Math.random() * 2
                        );
                    }
                } else {
                    this.game.stats.badItemsCollected++;
                    this.game.rocket.attachBadItem(powerUp);
                    this.game.rocket.playYelp();
                    this.game.rocket.addDeceleration('bad');
                    
                    // Create red puff effect for bad items
                    for (let j = 0; j < 10; j++) {
                        this.particles.createParticle(
                            powerUp.x + powerUp.width/2,
                            powerUp.y + powerUp.height/2,
                            '#e74c3c',
                            3 + Math.random() * 40,
                            Math.random() * Math.PI * 1000,
                            2 + Math.random() * 20
                        );
                    }
                }
                
                this.powerUps.splice(i, 1);
                continue;
            }
            
            if (powerUp.y > window.innerHeight + 100) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    checkCollision(powerUp, rocket) {
        // Get center points
        const powerUpCenterX = powerUp.x + powerUp.width/2;
        const powerUpCenterY = powerUp.y + powerUp.height/2;
        const rocketCenterX = rocket.x + rocket.width/2;
        const rocketCenterY = rocket.y + rocket.height/2;
        
        // Calculate distance between centers
        const dx = powerUpCenterX - rocketCenterX;
        const dy = powerUpCenterY - rocketCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Collision occurs if distance is less than sum of radii
        // Using smaller collision radius for more precise detection
        return distance < (rocket.width/2 + powerUp.width/2);
    }
    
    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'floating-message';
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    
    draw(ctx) {
        this.powerUps.forEach(powerUp => {
            ctx.save();
            ctx.font = `${powerUp.height}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                powerUp.symbol,
                powerUp.x + powerUp.width/2,
                powerUp.y + powerUp.height/2
            );
            ctx.restore();
        });
        
        this.particles.draw(ctx);
    }
}
