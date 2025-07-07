// TNT Explosive class
class TNT {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.size = 12;
        this.active = true;
        
        // TNT properties
        this.fuseTime = 10000; // 10 seconds until auto-explosion (longer for manual control)
        this.explosionRadius = 80;
        this.damage = 50; // High damage
        this.manualDetonation = false; // Can be manually detonated
        
        // Animation
        this.blinkTime = 0;
        this.blinking = false;
        
        // Auto-explode after 10 seconds if not manually detonated
        this.autoExplodeTimer = setTimeout(() => {
            if (this.active) {
                console.log('TNT auto-exploding after 10 seconds');
                this.explode();
            }
        }, this.fuseTime);
        
        // Start blinking in last 2 seconds
        setTimeout(() => {
            if (this.active) {
                this.blinking = true;
            }
        }, this.fuseTime - 2000);
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.fuseTime -= deltaTime;
        
        if (this.blinking) {
            this.blinkTime += deltaTime;
        }
    }
    
    // Manual detonation method
    detonate() {
        if (this.active) {
            console.log('TNT manually detonated');
            if (this.autoExplodeTimer) {
                clearTimeout(this.autoExplodeTimer);
            }
            this.explode();
        }
    }
    
    explode() {
        if (!this.active) return;
        
        console.log(`TNT exploding at (${this.x}, ${this.y})`);
        
        try {
            // Create explosion effect
            this.game.createExplosion(this.x, this.y, this.explosionRadius);
            
            // Damage all enemies in radius
            this.game.enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.explosionRadius) {
                    const damage = Math.max(1, this.damage - Math.floor(distance / 2));
                    enemy.takeDamage(damage);
                    console.log(`TNT damaged enemy for ${damage} damage`);
                }
            });
            
            // Damage player if too close
            if (this.game.player) {
                const dx = this.game.player.x - this.x;
                const dy = this.game.player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.explosionRadius) {
                    const damage = Math.max(1, Math.floor(this.damage / 4) - Math.floor(distance / 10));
                    this.game.player.takeDamage(damage);
                    console.log(`TNT damaged player for ${damage} damage`);
                }
            }
            
            // Destroy trees in explosion radius
            this.game.trees = this.game.trees.filter(tree => {
                const dx = tree.x - this.x;
                const dy = tree.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.explosionRadius) {
                    console.log(`TNT destroyed tree at (${tree.x}, ${tree.y})`);
                    return false; // Remove tree
                }
                return true; // Keep tree
            });
            
            // Play explosion sound with error handling
            try {
                this.game.audioManager.playExplosion();
            } catch (audioError) {
                console.warn('Error playing explosion sound:', audioError);
            }
            
        } catch (error) {
            console.error('Error in TNT explosion:', error);
        }
        
        // Remove TNT
        this.active = false;
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Don't draw if blinking and blink is off
        if (this.blinking && Math.floor(this.blinkTime / 200) % 2 === 0) {
            ctx.restore();
            return;
        }
        
        // TNT body (red with black stripes)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Black stripes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-this.size/2, -this.size/4, this.size, 2);
        ctx.fillRect(-this.size/2, this.size/4, this.size, 2);
        
        // TNT label
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', 0, 2);
        
        // Fuse (sparking when blinking)
        ctx.strokeStyle = this.blinking ? '#ffff00' : '#8b4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(0, -this.size);
        ctx.stroke();
        
        // Spark effect when blinking
        if (this.blinking) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(0, -this.size, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
    }
}
