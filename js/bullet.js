// Bullet class
class Bullet {
    constructor(x, y, velX, velY, owner, game) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.owner = owner; // 'player' or 'enemy'
        this.game = game;
        
        this.size = 3;
        this.active = true;
        this.damage = 1;
        this.maxDistance = 400;
        this.travelDistance = 0;
        
        // Visual effects
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const moveDistance = Math.sqrt(this.velX * this.velX + this.velY * this.velY) * (deltaTime / 1000);
        
        // Update position
        this.x += this.velX * (deltaTime / 1000);
        this.y += this.velY * (deltaTime / 1000);
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Track travel distance
        this.travelDistance += moveDistance;
        
        // Check bounds
        if (this.x < 0 || this.x > this.game.width || 
            this.y < 0 || this.y > this.game.height) {
            this.active = false;
            return;
        }
        
        // Check max distance
        if (this.travelDistance > this.maxDistance) {
            this.active = false;
            return;
        }
        
        // Check collision with trees
        this.checkTreeCollision();
        
        // Check collision with targets
        if (this.owner === 'player') {
            this.checkEnemyCollision();
        } else {
            this.checkPlayerCollision();
        }
    }
    
    checkTreeCollision() {
        for (let tree of this.game.trees) {
            const dx = this.x - tree.x;
            const dy = this.y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < tree.size) {
                this.active = false;
                this.createImpactEffect();
                return;
            }
        }
    }
    
    checkEnemyCollision() {
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemy.size + this.size) {
                enemy.takeDamage(this.damage);
                this.active = false;
                this.createHitEffect();
                
                if (enemy.health <= 0) {
                    this.game.enemies.splice(i, 1);
                }
                return;
            }
        }
    }
    
    checkPlayerCollision() {
        if (!this.game.player) return;
        
        const player = this.game.player;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.size + this.size) {
            // This collision is handled in the player class
            // to avoid double damage
            this.active = false;
            return;
        }
    }
    
    createImpactEffect() {
        // Create small particles for tree impact
        for (let i = 0; i < 3; i++) {
            const particle = {
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                velX: (Math.random() - 0.5) * 50,
                velY: (Math.random() - 0.5) * 50,
                life: 300,
                maxLife: 300,
                color: '#8b4513'
            };
            // In a more complex system, we'd add this to a particle system
        }
    }
    
    createHitEffect() {
        // Create small particles for enemy hit
        for (let i = 0; i < 5; i++) {
            const particle = {
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                velX: (Math.random() - 0.5) * 100,
                velY: (Math.random() - 0.5) * 100,
                life: 200,
                maxLife: 200,
                color: '#ff0000'
            };
            // In a more complex system, we'd add this to a particle system
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw trail with higher contrast
        if (this.trail.length > 1) {
            const trailColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
            ctx.strokeStyle = trailColor;
            ctx.lineWidth = 2; // Thicker trail
            ctx.globalAlpha = 0.7; // More visible
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.7;
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw bullet with high contrast
        ctx.globalAlpha = 1;
        const bulletColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
        
        // Outer glow
        ctx.shadowColor = bulletColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = bulletColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main bullet body
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; // White core for maximum contrast
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner colored core
        ctx.fillStyle = bulletColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
