class Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initialize stats
        this.stats = {
            healthyFoodEaten: 0,
            junkFoodAvoided: 0,
            highScore: 0,
            badItemsCollected: 0
        };
        
        // Initialize game state
        this.survivalTime = 0;
        this.lastTime = Date.now();
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        
        // Load game over sound
        this.gameOverSound = new Audio('assets/sounds/game_over.mp3');
        
        // Create more stars for better parallax effect
        this.stars = new Array(300).fill(null).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 3 + 2
        }));
        
        // Initialize asset manager
        this.assets = new AssetManager();
        
        // Load video asset
        this.assets.loadVideo('video', 'assets/rocketpup_animated.mp4');
        
        // Load random Blankie image
        this.blankieImage = new Image();
        const randomIndex = Math.floor(Math.random() * 176);
        const paddedIndex = randomIndex.toString().padStart(3, '0');
        this.blankieImage.src = `assets/Blankie/output_${paddedIndex}.png`;
        
        // Start game when assets are loaded
        this.assets.onComplete(() => {
            this.showStartScreen();
            
            // Add keyboard listener for starting/restarting the game
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (!this.gameStarted) {
                        this.startGame();
                    } else if (this.gameOver) {
                        this.restartGame();
                    }
                    e.preventDefault();
                }
            });
        });
    }
    
    async loadBlankieFrames() {
        try {
            const loadImage = (index) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    const paddedIndex = index.toString().padStart(3, '0');
                    img.src = `assets/Blankie/output_${paddedIndex}.png`;
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        console.error(`Failed to load Blankie frame ${index}`);
                        resolve(null);
                    };
                });
            };
            
            // Load first 50 frames for faster startup
            for (let i = 0; i < 50; i++) {
                const img = await loadImage(i);
                if (img) this.blankieFrames.push(img);
            }
            
            // Load the rest in the background
            for (let i = 50; i < 176; i++) {
                loadImage(i).then(img => {
                    if (img) this.blankieFrames.push(img);
                });
            }
        } catch (error) {
            console.error('Error loading Blankie frames:', error);
        }
    }
    
    handleGameOver() {
        this.gameOver = true;
        this.gameOverSound.play().catch(err => console.log('Error playing sound:', err));
        
        // Update high score
        if (this.stats.healthyFoodEaten > this.stats.highScore) {
            this.stats.highScore = this.stats.healthyFoodEaten;
        }
        
        // Load new random Blankie image
        this.blankieImage = new Image();
        const randomIndex = Math.floor(Math.random() * 176);
        const paddedIndex = randomIndex.toString().padStart(3, '0');
        this.blankieImage.src = `assets/Blankie/output_${paddedIndex}.png`;
        
        // Draw game over screen
        this.drawGameOver();
    }
    
    drawGameOver() {
        if (!this.gameOver) return;
        
        this.ctx.save();
        
        // Draw background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw Blankie image
        if (this.blankieImage.complete) {
            const imgWidth = 300;
            const imgHeight = (imgWidth / this.blankieImage.width) * this.blankieImage.height;
            this.ctx.drawImage(
                this.blankieImage,
                (this.canvas.width - imgWidth) / 2,
                100,
                imgWidth,
                imgHeight
            );
        }
        
        // Draw game over text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 + 100);
        
        // Draw score
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.stats.healthyFoodEaten}`, this.canvas.width/2, this.canvas.height/2 + 150);
        this.ctx.fillText(`High Score: ${this.stats.highScore}`, this.canvas.width/2, this.canvas.height/2 + 190);
        
        // Draw restart instruction
        this.ctx.fillText('Press SPACE to try again!', this.canvas.width/2, this.canvas.height/2 + 250);
        
        this.ctx.restore();
        
        // Keep animating game over screen
        if (this.gameOver) {
            requestAnimationFrame(() => this.drawGameOver());
        }
    }
    
    showStartScreen() {
        this.ctx.save();
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw video if loaded
        if (this.assets.video.readyState >= 3) {
            const videoWidth = 300;
            const videoHeight = (videoWidth / this.assets.video.videoWidth) * this.assets.video.videoHeight;
            const x = (this.canvas.width - videoWidth) / 2;
            const y = 100;
            
            // Start playing video if not already playing
            if (this.assets.video.paused) {
                this.assets.video.play().catch(console.error);
            }
            
            this.ctx.drawImage(this.assets.video, x, y, videoWidth, videoHeight);
        }
        
        // Draw title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Level Up Little Pup!', this.canvas.width/2, 50);
        
        // Draw instructions
        this.ctx.font = '24px Arial';
        const instructions = [
            '🎮 Use Arrow Keys to move left/right',
            '🚀 Hold SPACE to boost',
            '🍎 Collect healthy items for fuel',
            '❌ Avoid junk food and bad habits',
            '⭐ Complete all 5 levels to win!',
            '',
            'Press SPACE or click Start to begin!'
        ];
        
        const startY = 500;
        instructions.forEach((text, i) => {
            this.ctx.fillText(text, this.canvas.width/2, startY + i * 40);
        });
        
        // Draw start button
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth)/2;
        const buttonY = startY + instructions.length * 40 + 30;
        
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Start Game', this.canvas.width/2, buttonY + 35);
        
        // Add click handler for start button if not already added
        if (!this.startHandler) {
            this.startHandler = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    this.startGame();
                }
            };
            this.canvas.addEventListener('click', this.startHandler);
        }
        
        this.ctx.restore();
        
        // Keep showing start screen until game starts
        if (!this.gameStarted) {
            requestAnimationFrame(() => this.showStartScreen());
        }
    }
    
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.initializeGame();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    initializeGame() {
        try {
            this.rocket = new Rocket(this);
            this.powerUpManager = new PowerUpManager(this);
            this.background = new Background(this);
        } catch (error) {
            console.error('Error creating game components:', error);
            throw error;
        }
    }
    
    initializeStars() {
        this.stars = new Array(300).fill(null).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 3 + 2
        }));
    }
    
    reset() {
        // Reset game state
        this.gameOver = false;
        this.gameWon = false;
        this.gameStarted = false;
        this.survivalTime = 0;
        this.lastTimestamp = null;
        
        // Reset stats
        this.stats = {
            healthyFoodEaten: 0,
            badItemsCollected: 0,
            highScore: this.stats?.highScore || 0
        };
        
        // Create game objects
        this.rocket = new Rocket(this);
        this.powerUpManager = new PowerUpManager(this);
        this.background = new Background(this);
        
        // Reset stars
        this.initializeStars();
    }
    
    drawStars() {
        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        
        for (const star of this.stars) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    updateStars(delta) {
        for (const star of this.stars) {
            star.y += star.speed;
            
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    restartGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.survivalTime = 0;
        this.stats = {
            healthyFoodEaten: 0,
            junkFoodAvoided: 0,
            highScore: this.stats.highScore,
            badItemsCollected: 0
        };
        this.initializeGame();
        this.gameStarted = true;
        this.lastTime = Date.now();
        
        // Remove game over or victory text if present
        const textElements = document.querySelectorAll('.victory-text, .restart-text, .game-over');
        textElements.forEach(el => el.remove());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    updateUI() {
        try {
            // Update fuel gauge
            const fuelFill = document.getElementById('fuel-fill');
            if (fuelFill) {
                fuelFill.style.width = `${this.rocket.fuel}%`;
            }
            
            // Update shield indicator
            const shieldIndicator = document.querySelector('.shield-indicator');
            const shieldTime = document.getElementById('shield-time');
            if (shieldIndicator && shieldTime) {
                if (this.rocket.shield.active) {
                    shieldIndicator.classList.add('shield-active');
                    shieldTime.textContent = Math.ceil(this.rocket.shield.duration / 1000);
                } else {
                    shieldIndicator.classList.remove('shield-active');
                    shieldTime.textContent = '0';
                }
            }
            
            // Update survival time and level
            const survivalTimeElement = document.getElementById('survival-time');
            if (survivalTimeElement) {
                const currentTime = Date.now();
                if (currentTime - this.lastTimeUpdate >= 1000) {
                    this.survivalTime++;
                    const level = Math.min(6, Math.floor(this.survivalTime / 20) + 1);
                    const levelNames = {
                        1: "Level 1: Eat!",
                        2: "Level 2: Workout!",
                        3: "Level 3: Sleep!",
                        4: "Level 4: Be Clean!",
                        5: "Level 5: Be Happy!",
                        6: "Level 6: Celebration!"
                    };
                    //survivalTimeElement.textContent = `${levelNames[level]} (${this.healthyFoodEaten}s)`;
                    this.lastTimeUpdate = currentTime;
                    
                    // Check for victory
                    if (this.survivalTime >= 120) { // Win after 6 levels of 20 seconds
                        this.victory();
                    }
                }
            }
            
            // Update food stats
            const statsElement = document.getElementById('food-stats');
            if (statsElement) {
                statsElement.textContent = 
                    `Healthy Choices: ${this.stats.healthyFoodEaten} | ` +
                    `Bad Choices Avoided: ${this.stats.junkFoodAvoided}`;
            }
            
            // Update background darkness based on level
            const level = Math.min(6, Math.floor(this.survivalTime / 20) + 1);
            document.body.style.backgroundColor = `hsl(210, 30%, ${Math.max(5, 50 - level * 8)}%)`;
            
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }
    
    victory() {
        this.gameOver = true;
        
        // Create massive explosion
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const x = this.canvas.width/2 + Math.cos(angle) * distance;
            const y = this.canvas.height/2 + Math.sin(angle) * distance;
            
            this.particles.createExplosion(x, y, `hsl(${Math.random() * 360}, 100%, 50%)`);
        }
        
        // Show victory message
        const victoryText = document.createElement('div');
        victoryText.className = 'victory-text';
        victoryText.innerHTML = `
            <h1>YOU WIN!</h1>
            <p>Time: ${this.survivalTime}s</p>
            <p>Healthy Choices: ${this.stats.healthyFoodEaten}</p>
            <p>Bad Choices Avoided: ${this.stats.junkFoodAvoided}</p>
            <p>Press SPACE to Play Again</p>
        `;
        document.getElementById('game-container').appendChild(victoryText);
    }
    
    showGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            
            // Update high score
            if (this.survivalTime > this.stats.highScore) {
                this.stats.highScore = this.survivalTime;
            }
            
            // Show "Press SPACE to Restart" text
            const restartText = document.createElement('div');
            restartText.className = 'restart-text';
            restartText.textContent = 'Press SPACE to Restart';
            document.getElementById('game-container').appendChild(restartText);
            
            // Show random story image
            const validImages = this.storyImages.filter(img => img.complete && img.naturalWidth > 0);
            if (validImages.length > 0) {
                this.currentStoryImage = Math.floor(Math.random() * validImages.length);
            }
        }
    }
    
    update(delta) {
        if (this.gameOver || this.gameWon) {
            return;
        }

        if (!this.gameStarted) {
            return;
        }

        this.survivalTime += delta;
        
        // Check for final win condition (after celebration level)
        if (this.survivalTime >= 120) { // 6 levels * 20 seconds each
            if (this.survivalTime > this.stats.highScore) {
                this.stats.highScore = Math.floor(this.survivalTime);
            }
            this.gameWon = true;
            this.win();
            return;
        }

        this.background.update();
        this.rocket.update(delta);
        this.powerUps.update(this.rocket, this.particles);
        this.obstacles.update(this.rocket, this.particles);
        this.particles.update();
        
        // Apply stronger gravity near the top of the screen
        if (this.rocket.y < this.canvas.height * 0.2) {
            const strength = 1 - (this.rocket.y / (this.canvas.height * 0.2));
            this.rocket.velocity.y += strength * 0.5;
        }
        
        // Check for game over
        if (this.rocket.y > this.canvas.height - this.rocket.height) {
            this.gameOver = true;
            this.gameOverSound.play().catch(err => console.log('Error playing sound:', err));
            this.showGameOver();
        }
        
        this.updateUI();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameStarted) {
            this.showStartScreen();
            return;
        }
        
        // Draw game elements
        this.background.draw(this.ctx);
        this.powerUps.draw(this.ctx);
        this.obstacles.draw(this.ctx);
        this.rocket.draw(this.ctx);
        this.particles.draw(this.ctx);
        
        // Draw good items counter above rocket
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillText(this.stats.healthyFoodEaten.toString(), 
            this.rocket.x + this.rocket.width/2,
            this.rocket.y - 20);
        
        // Draw game over screen
        if (this.gameOver) {
            const validImages = this.storyImages.filter(img => img.complete && img.naturalWidth > 0);
            if (validImages.length > 0) {
                const img = validImages[this.currentStoryImage];
                
                // Draw story image
                const scale = Math.min(
                    this.canvas.width / img.width,
                    this.canvas.height / img.height
                ) * 0.8;
                
                const width = img.width * scale;
                const height = img.height * scale;
                const x = (this.canvas.width - width) / 2;
                const y = (this.canvas.height - height) / 2;
                
                this.ctx.drawImage(img, x, y, width, height);
                
                // Draw stats overlay
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(x, y + height - 120, width, 120);
                
                this.ctx.fillStyle = '#f1c40f';
                this.ctx.font = '24px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                
                const stats = [
                    `Survival Time: ${this.survivalTime}s`,
                    `Healthy Food: ${this.stats.healthyFoodEaten}`,
                    `High Score: ${this.stats.highScore}s`
                ];
                
                stats.forEach((text, i) => {
                    this.ctx.fillText(
                        text,
                        this.canvas.width/2,
                        y + height - 90 + i * 30
                    );
                });
            } else {
                // Fallback game over screen
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.font = '48px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 60);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px "Press Start 2P"';
                
                const stats = [
                    `Survival Time: ${this.survivalTime}s`,
                    `Healthy Food: ${this.stats.healthyFoodEaten}`,
                    `High Score: ${this.stats.highScore}s`
                ];
                
                stats.forEach((text, i) => {
                    this.ctx.fillText(
                        text,
                        this.canvas.width/2,
                        this.canvas.height/2 + i * 40
                    );
                });
            }
        }
    }
    
    win() {
        this.ctx.save();
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2196F3');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw congratulations text
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('Congratulations!', this.canvas.width/2, this.canvas.height/2 - 100);
        this.ctx.font = '32px Arial';
        this.ctx.fillText('You completed all levels!', this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText(`Final Score: ${Math.floor(this.survivalTime)}`, this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.fillText(`High Score: ${this.stats.highScore}`, this.canvas.width/2, this.canvas.height/2 + 90);
        
        // Draw restart button
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth)/2;
        const buttonY = this.canvas.height/2 + 150;
        
        this.ctx.fillStyle = '#FFC107';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Play Again', this.canvas.width/2, buttonY + buttonHeight/2 + 8);
        
        // Add click handler for restart button if not already added
        if (!this.restartHandler) {
            this.restartHandler = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= buttonX && x <= buttonX + buttonWidth &&
                    y >= buttonY && y <= buttonY + buttonHeight) {
                    this.reset();
                    this.gameStarted = true;
                }
            };
            this.canvas.addEventListener('click', this.restartHandler);
        }
        
        this.ctx.restore();
    }
    
    gameLoop(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        const delta = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        if (!this.gameOver && !this.gameWon) {
            this.survivalTime += delta;
            
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw stars
            this.drawStars();
            this.updateStars(delta);
            
            // Update and draw game objects
            this.rocket.update(delta);
            this.powerUpManager.update(delta);
            
            this.rocket.draw(this.ctx);
            this.powerUpManager.draw(this.ctx);
            
            // Draw HUD
            this.drawHUD();
            
            // Check for game over
            if (this.rocket.y > this.canvas.height - this.rocket.height) {
                this.handleGameOver();
            }
        } else {
            this.drawGameOver();
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    handleGameOver() {
        this.gameOver = true;
        this.gameOverSound.play().catch(err => console.log('Error playing sound:', err));
        
        // Update high score
        if (this.stats.healthyFoodEaten > this.stats.highScore) {
            this.stats.highScore = this.stats.healthyFoodEaten;
        }
        
        // Load new random Blankie image
        this.blankieImage = new Image();
        const randomIndex = Math.floor(Math.random() * 176);
        const paddedIndex = randomIndex.toString().padStart(3, '0');
        this.blankieImage.src = `assets/Blankie/output_${paddedIndex}.png`;
        
        // Draw game over screen
        this.drawGameOver();
    }
    
    drawHUD() {
        this.ctx.save();
        
        // Draw level countdown
        const level = Math.min(6, Math.floor(this.survivalTime / 20) + 1);
        const timeInLevel = this.survivalTime % 20;
        const timeToNextLevel = level < 6 ? (20 - timeInLevel) : 0;
        
        // Draw timer and level info in top right
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'right';
        if (level < 6) {
            this.ctx.fillText(`Next Level: ${Math.ceil(timeToNextLevel)}s`, this.canvas.width - 20, 70);
        }
        
        // Draw good items counter above rocket
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillText(this.stats.healthyFoodEaten.toString(), 
            this.rocket.x + this.rocket.width/2,
            this.rocket.y - 20);
        
        // Draw fuel bar full width at top
        const fuelHeight = 20;
        const fuelX = 0;
        const fuelY = 0;
        const fuelWidth = this.canvas.width;
        
        // Draw fuel bar background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(fuelX, fuelY, fuelWidth, fuelHeight);
        
        // Draw fuel level
        const fuelLevel = this.rocket.fuel / 100;
        this.ctx.fillStyle = fuelLevel > 0.2 ? '#2ecc71' : '#e74c3c';
        this.ctx.fillRect(fuelX, fuelY, fuelWidth * fuelLevel, fuelHeight);
        
        // Draw fuel text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('FUEL', fuelWidth/2, fuelY + fuelHeight/2 + 5);
        
        // Draw level title
        const titles = [
            'Level 1: Eat!',
            'Level 2: Workout!',
            'Level 3: Sleep!',
            'Level 4: Be Clean!',
            'Level 5: Be Happy!',
            'Level 6: Celebration!',
            'You Won! 🎉'
        ];
        
        this.ctx.font = level === 7 ? 'bold 48px Arial' : 'bold 32px Arial';
        this.ctx.fillStyle = level === 7 ? '#FFD700' : '#fff';  // Gold color for celebration
        this.ctx.fillText(titles[level - 1], this.canvas.width/2, 80);
        
        this.ctx.restore();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
