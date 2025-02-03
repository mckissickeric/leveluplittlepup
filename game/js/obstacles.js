class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.patterns = {
            zigzag: {
                create: (x) => ({
                    x,
                    y: Math.sin(x * 0.02) * 100 + window.innerHeight/2,
                    type: 'junkFood',
                    radius: 20,
                    damage: 15
                })
            },
            wall: {
                create: (x) => {
                    const obstacles = [];
                    const gap = 150;
                    const gapY = Math.random() * (window.innerHeight - gap);
                    
                    for(let y = 0; y < window.innerHeight; y += 50) {
                        if(y < gapY || y > gapY + gap) {
                            obstacles.push({
                                x,
                                y,
                                type: 'wall',
                                radius: 25,
                                damage: 20
                            });
                        }
                    }
                    return obstacles;
                }
            },
            asteroid: {
                create: (x) => ({
                    x,
                    y: Math.random() * window.innerHeight,
                    type: 'asteroid',
                    radius: 35,
                    damage: 25,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1
                })
            }
        };
        this.spawnTimer = 0;
        this.minSpawnTime = 2000; // Minimum time between spawns in ms
        this.maxSpawnTime = 4000; // Maximum time between spawns in ms
        this.nextSpawnTime = this.minSpawnTime;
    }

    spawn(difficulty) {
        // Update spawn timer
        this.spawnTimer += 16; // Assuming 60fps
        if (this.spawnTimer >= this.nextSpawnTime) {
            if(Math.random() < 0.02 * difficulty) {
                const patterns = Object.keys(this.patterns);
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                const result = this.patterns[pattern].create(window.innerWidth + 100);
                
                if(Array.isArray(result)) {
                    this.obstacles.push(...result);
                } else {
                    this.obstacles.push(result);
                }
            }
            this.spawnTimer = 0;
            this.nextSpawnTime = this.minSpawnTime + Math.random() * (this.maxSpawnTime - this.minSpawnTime);
        }
    }

    update(rocket, particles) {
        this.obstacles = this.obstacles.filter(obstacle => {
            // Move obstacle
            obstacle.x -= 5;
            if(obstacle.rotation !== undefined) {
                obstacle.rotation += obstacle.rotationSpeed;
            }
            
            // Check collision with rocket
            const dx = obstacle.x - rocket.x;
            const dy = obstacle.y - rocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance < rocket.radius + obstacle.radius) {
                if(!rocket.effects.shield.active) {
                    rocket.damage(obstacle.damage);
                    particles.emit(obstacle.x, obstacle.y, '#e74c3c', 30);
                }
                return false;
            }
            
            return obstacle.x > -50;
        });
    }

    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            ctx.save();
            
            switch(obstacle.type) {
                case 'junkFood':
                    ctx.fillStyle = '#e67e22';
                    ctx.beginPath();
                    ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'wall':
                    ctx.fillStyle = '#95a5a6';
                    ctx.fillRect(obstacle.x - obstacle.radius, 
                               obstacle.y - obstacle.radius,
                               obstacle.radius * 2,
                               obstacle.radius * 2);
                    break;
                    
                case 'asteroid':
                    ctx.translate(obstacle.x, obstacle.y);
                    ctx.rotate(obstacle.rotation);
                    ctx.fillStyle = '#7f8c8d';
                    
                    // Draw irregular asteroid shape
                    ctx.beginPath();
                    for(let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const radius = obstacle.radius * (0.8 + Math.sin(i * 1.5) * 0.2);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        });
    }
}
