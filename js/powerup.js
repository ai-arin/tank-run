// Powerup class
class Powerup {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.type = type; // 'ammo', 'health', 'life'
        this.game = game;
        
        this.size = 12;
        this.active = true;
        
        // Animation
        this.bobOffset = 0;
        this.bobSpeed = 0.003;
        this.rotationSpeed = 0.002;
        this.rotation = 0;
        this.scale = 1;
        this.pulseSpeed = 0.005;
        
        // Lifetime
        this.lifetime = 30000; // 30 seconds
        this.age = 0;
        this.blinkTime = 5000; // Start blinking 5 seconds before expiring
        
        // Visual properties based on type
        this.setVisualProperties();
    }
    
    setVisualProperties() {
        switch (this.type) {
            case 'ammo':
                this.color = '#ffff00';
                this.secondaryColor = '#cccc00';
                this.glowColor = '#ffff00';
                break;
            case 'health':
                this.color = '#ff0000';
                this.secondaryColor = '#cc0000';
                this.glowColor = '#ff0000';
                break;
            case 'life':
                this.color = '#00ff00';
                this.secondaryColor = '#00cc00';
                this.glowColor = '#00ff00';
                break;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update age
        this.age += deltaTime;
        
        // Check if expired
        if (this.age > this.lifetime) {
            this.active = false;
            return;
        }
        
        // Update animations
        this.bobOffset += this.bobSpeed * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Pulsing scale effect
        this.scale = 1 + Math.sin(this.age * this.pulseSpeed) * 0.1;
        
        // Blinking effect when about to expire
        if (this.age > this.lifetime - this.blinkTime) {
            const blinkSpeed = 0.01;
            this.alpha = 0.5 + Math.sin(this.age * blinkSpeed) * 0.5;
        } else {
            this.alpha = 1;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Apply alpha for blinking effect
        ctx.globalAlpha = this.alpha;
        
        // Calculate bobbing position
        const bobY = this.y + Math.sin(this.bobOffset) * 3;
        
        ctx.translate(this.x, bobY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Draw glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        
        // Draw powerup based on type
        switch (this.type) {
            case 'ammo':
                this.drawAmmoPack(ctx);
                break;
            case 'health':
                this.drawHealthPack(ctx);
                break;
            case 'life':
                this.drawLifePack(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    drawAmmoPack(ctx) {
        // Ammo box
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Box details
        ctx.fillStyle = this.secondaryColor;
        ctx.fillRect(-this.size/3, -this.size/3, this.size/1.5, this.size/3);
        
        // Ammo symbol (bullets)
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 3; i++) {
            const bulletX = -this.size/3 + (i * this.size/4);
            ctx.fillRect(bulletX, -2, 2, 4);
        }
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
    }
    
    drawHealthPack(ctx) {
        // Medical cross background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Red cross
        ctx.fillStyle = this.color;
        // Vertical bar
        ctx.fillRect(-this.size/6, -this.size/2, this.size/3, this.size);
        // Horizontal bar
        ctx.fillRect(-this.size/2, -this.size/6, this.size, this.size/3);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
    }
    
    drawLifePack(ctx) {
        // Star shape for extra life
        const spikes = 5;
        const outerRadius = this.size / 2;
        const innerRadius = outerRadius * 0.5;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Inner star
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? innerRadius * 0.7 : innerRadius * 0.3;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}
