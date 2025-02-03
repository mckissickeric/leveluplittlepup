class Background {
    constructor() {
        this.stars = [];
        this.generateStars();
    }
    
    generateStars() {
        // Create 100 stars with random positions
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }
    
    update() {
        // Move stars downward
        this.stars.forEach(star => {
            star.y += star.speed;
            
            // Reset star position when it goes off screen
            if (star.y > window.innerHeight) {
                star.y = -10;
                star.x = Math.random() * window.innerWidth;
            }
        });
    }
    
    draw(ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Draw stars
        ctx.fillStyle = '#fff';
        this.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
