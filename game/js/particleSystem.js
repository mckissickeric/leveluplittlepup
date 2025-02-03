class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createParticle(x, y, color, size, angle, speed) {
        this.particles.push({
            x,
            y,
            color,
            size,
            life: 1.0,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            }
        });
    }
    
    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.life -= delta * 2;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
