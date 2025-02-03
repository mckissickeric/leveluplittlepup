class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createParticle(x, y, color) {
        return {
            x: x,
            y: y,
            color: color,
            velocity: {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            },
            size: Math.random() * 4 + 2,
            life: 1.0
        };
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(this.createParticle(x, y, color));
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}
