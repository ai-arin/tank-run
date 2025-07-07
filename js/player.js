// Player class
class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        
        // Player stats
        this.maxHealth = 9;
        this.health = this.maxHealth;
        this.lives = 3;
        this.maxAmmo = 50; // Increased from 30
        this.ammo = this.maxAmmo;
        
        // TNT system
        this.tntCount = 3; // Start with 3 TNT
        this.tntCooldown = 0;
        this.tntDelay = 1000; // 1 second cooldown between TNT placement
        
        // Movement
        this.speed = 200; // pixels per second
        this.size = 16;
        
        // Turret control
        this.turretAngle = 0; // Separate angle for turret
        this.turretRotationSpeed = 3; // radians per second
        
        // Combat
        this.shootCooldown = 0;
        this.shootDelay = 200; // milliseconds
        
        // Stealth
        this.isHidden = false;
        this.hiddenAlpha = 0.3;
        
        // Animation
        this.angle = 0;
        this.animFrame = 0;
        this.animTime = 0;
        
        // Invincibility frames after taking damage
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1000; // 1 second
    }
    
    update(deltaTime, keys) {
        this.handleInput(keys, deltaTime);
        this.updateTimers(deltaTime);
        this.updateAnimation(deltaTime);
        this.checkCollisions();
    }
    
    handleInput(keys, deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 1000);
        const rotationSpeed = this.turretRotationSpeed * (deltaTime / 1000);
        let moving = false;
        let newX = this.x;
        let newY = this.y;
        
        // Turret rotation (independent of movement)
        if (keys['KeyQ']) {
            this.turretAngle -= rotationSpeed;
        }
        if (keys['KeyE']) {
            this.turretAngle += rotationSpeed;
        }
        
        // Movement
        if (keys['KeyW'] || keys['ArrowUp']) {
            newY -= moveSpeed;
            this.angle = -Math.PI / 2;
            moving = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            newY += moveSpeed;
            this.angle = Math.PI / 2;
            moving = true;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            newX -= moveSpeed;
            this.angle = Math.PI;
            moving = true;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            newX += moveSpeed;
            this.angle = 0;
            moving = true;
        }
        
        // Diagonal movement
        if ((keys['KeyW'] || keys['ArrowUp']) && (keys['KeyA'] || keys['ArrowLeft'])) {
            this.angle = -3 * Math.PI / 4;
        }
        if ((keys['KeyW'] || keys['ArrowUp']) && (keys['KeyD'] || keys['ArrowRight'])) {
            this.angle = -Math.PI / 4;
        }
        if ((keys['KeyS'] || keys['ArrowDown']) && (keys['KeyA'] || keys['ArrowLeft'])) {
            this.angle = 3 * Math.PI / 4;
        }
        if ((keys['KeyS'] || keys['ArrowDown']) && (keys['KeyD'] || keys['ArrowRight'])) {
            this.angle = Math.PI / 4;
        }
        
        // Check collision before moving
        if (this.canMoveTo(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
        
        // Keep player in bounds
        this.x = Math.max(this.size, Math.min(this.game.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.game.height - this.size, this.y));
        
        // Stealth
        if (keys['KeyC']) {
            this.hide();
        } else {
            this.isHidden = false;
        }
        
        // Update animation if moving
        if (moving) {
            this.animTime += deltaTime;
        }
    }
    
    canMoveTo(x, y) {
        // Check collision with trees
        for (let tree of this.game.trees) {
            const dx = x - tree.x;
            const dy = y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < tree.size + this.size) {
                return false;
            }
        }
        return true;
    }
    
    hide() {
        // Check if player is near cover (trees)
        for (let tree of this.game.trees) {
            const dx = this.x - tree.x;
            const dy = this.y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < tree.size + 30) {
                this.isHidden = true;
                return;
            }
        }
        this.isHidden = false;
    }
    
    placeTNT() {
        console.log('placeTNT called - TNT count:', this.tntCount, 'Cooldown:', this.tntCooldown);
        
        if (this.tntCooldown <= 0 && this.tntCount > 0) {
            // Create TNT at player position
            console.log('Placing TNT at player position:', this.x, this.y);
            this.game.placeTNT(this.x, this.y);
            this.tntCount--;
            this.tntCooldown = this.tntDelay;
            this.game.audioManager.playTNTPlace();
            if (typeof updateUI === 'function') {
                updateUI();
            }
            console.log('TNT placed successfully. Remaining TNT:', this.tntCount);
        } else {
            console.log('Cannot place TNT - cooldown or no TNT remaining');
        }
    }
    
    shoot() {
        if (this.shootCooldown <= 0 && this.ammo > 0) {
            const bulletSpeed = 400;
            const bulletX = this.x + Math.cos(this.turretAngle) * (this.size + 5);
            const bulletY = this.y + Math.sin(this.turretAngle) * (this.size + 5);
            const bulletVelX = Math.cos(this.turretAngle) * bulletSpeed;
            const bulletVelY = Math.sin(this.turretAngle) * bulletSpeed;
            
            this.game.bullets.push(new Bullet(
                bulletX, bulletY, bulletVelX, bulletVelY, 'player', this.game
            ));
            
            this.ammo--;
            this.shootCooldown = this.shootDelay;
            this.game.audioManager.playShoot();
            updateUI();
        }
    }
    
    updateTimers(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        if (this.tntCooldown > 0) {
            this.tntCooldown -= deltaTime;
        }
        
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    updateAnimation(deltaTime) {
        this.animTime += deltaTime;
        this.animFrame = Math.floor(this.animTime / 200) % 4;
    }
    
    checkCollisions() {
        // Check collision with enemy bullets
        for (let i = this.game.bullets.length - 1; i >= 0; i--) {
            const bullet = this.game.bullets[i];
            if (bullet.owner === 'enemy') {
                const dx = this.x - bullet.x;
                const dy = this.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.size + bullet.size) {
                    this.takeDamage(1);
                    bullet.active = false;
                    this.game.bullets.splice(i, 1);
                }
            }
        }
        
        // Check collision with powerups
        for (let i = this.game.powerups.length - 1; i >= 0; i--) {
            const powerup = this.game.powerups[i];
            const dx = this.x - powerup.x;
            const dy = this.y - powerup.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.size + powerup.size) {
                this.collectPowerup(powerup);
                this.game.powerups.splice(i, 1);
            }
        }
        
        // Check collision with enemies (direct contact damage)
        for (let enemy of this.game.enemies) {
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.size + enemy.size) {
                this.takeDamage(1);
                break; // Only take damage from one enemy per frame
            }
        }
    }
    
    takeDamage(amount) {
        if (this.invulnerable || this.isHidden) return;
        
        this.health -= amount;
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
        this.game.audioManager.playHurt();
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        updateUI();
    }
    
    die() {
        this.lives--;
        
        if (this.lives > 0) {
            // Respawn at safe position
            const safeSpawn = this.game.findSafeSpawnPosition();
            this.x = safeSpawn.x;
            this.y = safeSpawn.y;
            
            // Reset stats
            this.health = this.maxHealth;
            this.ammo = this.maxAmmo;
            this.invulnerable = true;
            this.invulnerabilityTime = 3000; // 3 seconds of invulnerability after respawn
            
            showNotification('RESPAWNED!', 2000, '#00ff00');
        }
        
        updateUI();
    }
    
    collectPowerup(powerup) {
        switch (powerup.type) {
            case 'ammo':
                this.ammo = Math.min(this.maxAmmo, this.ammo + 25); // Increased from 15
                this.tntCount = Math.min(5, this.tntCount + 1); // Add 1 TNT, max 5
                this.game.score += 50;
                console.log(`Collected ammo pack: +25 ammo, +1 TNT. New totals: ${this.ammo} ammo, ${this.tntCount} TNT`);
                break;
            case 'health':
                this.health = Math.min(this.maxHealth, this.health + 3);
                this.game.score += 100;
                console.log(`Collected health pack: +3 health. New total: ${this.health}`);
                break;
            case 'life':
                this.lives++;
                this.game.score += 500;
                console.log(`Collected life pack: +1 life. New total: ${this.lives}`);
                break;
        }
        
        this.game.audioManager.playPowerup();
        if (typeof updateUI === 'function') {
            updateUI();
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Apply transparency if hidden or invulnerable
        if (this.isHidden) {
            ctx.globalAlpha = this.hiddenAlpha;
        } else if (this.invulnerable) {
            // Flashing effect when invulnerable
            ctx.globalAlpha = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        }
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw player (camouflaged soldier)
        this.drawPlayer(ctx);
        
        ctx.restore();
    }
    
    drawPlayer(ctx) {
        // Add bright outline for better visibility
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2 - 1, -this.size/2 - 1, this.size + 2, this.size + 2);
        
        // Body (brighter camouflage colors)
        ctx.fillStyle = '#6b8c2f'; // Brighter green
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Camouflage pattern (higher contrast)
        ctx.fillStyle = '#4a6b1f'; // Darker contrast
        ctx.fillRect(-this.size/3, -this.size/3, this.size/2, this.size/3);
        ctx.fillRect(-this.size/4, this.size/6, this.size/3, this.size/4);
        
        // Helmet (brighter)
        ctx.fillStyle = '#3d5a18';
        ctx.beginPath();
        ctx.arc(0, -this.size/3, this.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet outline
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Save context for turret rotation
        ctx.save();
        ctx.rotate(this.turretAngle - this.angle); // Rotate relative to body
        
        // Weapon (turret - more visible)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(this.size + 5, 0);
        ctx.stroke();
        
        // Weapon highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size/2, -1);
        ctx.lineTo(this.size + 5, -1);
        ctx.stroke();
        
        // Turret base
        ctx.fillStyle = '#4a6b1f';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore(); // Restore context
        
        // Eyes (brighter and larger)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -this.size/3, 3, 3);
        ctx.fillRect(1, -this.size/3, 3, 3);
        
        // Eye pupils for more character
        ctx.fillStyle = '#000000';
        ctx.fillRect(-3, -this.size/3 + 1, 1, 1);
        ctx.fillRect(2, -this.size/3 + 1, 1, 1);
    }
}
