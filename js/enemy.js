// Base Enemy class
class Enemy {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 50;
        this.size = 16;
        this.angle = 0;
        
        // AI behavior
        this.target = null;
        this.lastSeen = { x: 0, y: 0 };
        this.searchTime = 0;
        this.alertLevel = 0; // 0 = patrol, 1 = searching, 2 = combat
        
        // Combat
        this.shootCooldown = 0;
        this.shootDelay = 1000;
        this.attackRange = 200;
        this.sightRange = 150;
        
        // Movement
        this.patrolTarget = { x: x, y: y };
        this.stuck = false;
        this.stuckTime = 0;
        
        this.generatePatrolTarget();
    }
    
    update(deltaTime) {
        this.updateAI(deltaTime);
        this.updateTimers(deltaTime);
        this.updateMovement(deltaTime);
    }
    
    updateAI(deltaTime) {
        if (!this.game.player) return;
        
        const player = this.game.player;
        const distanceToPlayer = this.getDistanceTo(player);
        const canSeePlayer = this.canSeeTarget(player) && !player.isHidden;
        
        if (canSeePlayer && distanceToPlayer < this.sightRange) {
            // Player spotted
            this.target = player;
            this.lastSeen = { x: player.x, y: player.y };
            this.alertLevel = 2;
            this.searchTime = 3000; // Search for 3 seconds after losing sight
            
            // Shoot if in range
            if (distanceToPlayer < this.attackRange && this.shootCooldown <= 0) {
                this.shoot();
            }
        } else if (this.alertLevel > 0) {
            // Lost sight of player, search last known position
            this.searchTime -= deltaTime;
            if (this.searchTime <= 0) {
                this.alertLevel = 0;
                this.target = null;
                this.generatePatrolTarget();
            } else {
                this.target = this.lastSeen;
            }
        }
        
        // Set movement target
        if (this.alertLevel === 2 && this.target === this.game.player) {
            // Chase player
            this.moveToward(this.target);
        } else if (this.alertLevel === 1 && this.target === this.lastSeen) {
            // Search last known position
            this.moveToward(this.target);
        } else {
            // Patrol
            this.patrol();
        }
    }
    
    updateTimers(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        if (this.stuck) {
            this.stuckTime += deltaTime;
            if (this.stuckTime > 1000) {
                this.generatePatrolTarget();
                this.stuck = false;
                this.stuckTime = 0;
            }
        }
    }
    
    updateMovement(deltaTime) {
        // Movement is handled in the specific enemy type classes
    }
    
    moveToward(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.angle = Math.atan2(dy, dx);
        }
    }
    
    patrol() {
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
            this.generatePatrolTarget();
        } else {
            this.moveToward(this.patrolTarget);
        }
    }
    
    generatePatrolTarget() {
        let attempts = 0;
        do {
            this.patrolTarget.x = Math.random() * this.game.width;
            this.patrolTarget.y = Math.random() * this.game.height;
            attempts++;
        } while (this.game.isPositionBlocked(this.patrolTarget.x, this.patrolTarget.y) && attempts < 20);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            // Add score for killing enemy
            this.game.score += this.scoreValue || 100;
        }
    }
    
    canSeeTarget(target) {
        // Simple line of sight check
        const steps = 20;
        const dx = (target.x - this.x) / steps;
        const dy = (target.y - this.y) / steps;
        
        for (let i = 1; i < steps; i++) {
            const checkX = this.x + dx * i;
            const checkY = this.y + dy * i;
            
            // Check if line of sight is blocked by trees
            for (let tree of this.game.trees) {
                const treeDx = checkX - tree.x;
                const treeDy = checkY - tree.y;
                const treeDistance = Math.sqrt(treeDx * treeDx + treeDy * treeDy);
                if (treeDistance < tree.size) {
                    return false;
                }
            }
        }
        return true;
    }
    
    getDistanceTo(target) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    shoot() {
        const bulletSpeed = 300;
        const bulletX = this.x + Math.cos(this.angle) * (this.size + 5);
        const bulletY = this.y + Math.sin(this.angle) * (this.size + 5);
        const bulletVelX = Math.cos(this.angle) * bulletSpeed;
        const bulletVelY = Math.sin(this.angle) * bulletSpeed;
        
        this.game.bullets.push(new Bullet(
            bulletX, bulletY, bulletVelX, bulletVelY, 'enemy', this.game
        ));
        
        this.shootCooldown = this.shootDelay;
        this.game.audioManager.playEnemyShoot();
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.game.score += this.scoreValue || 100;
        this.game.audioManager.playEnemyDeath();
        updateUI();
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        this.drawEnemy(ctx);
        
        // Health bar
        this.drawHealthBar(ctx);
        
        ctx.restore();
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.size * 1.5;
        const barHeight = 4;
        const barY = -this.size - 10;
        
        // Background
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-barWidth/2, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth/2, barY, barWidth, barHeight);
    }
    
    drawEnemy(ctx) {
        // Override in subclasses
    }
}

// Tank Enemy
class Tank extends Enemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.health = 12;
        this.maxHealth = 12;
        this.speed = 30;
        this.size = 24;
        this.shootDelay = 1500;
        this.attackRange = 250;
        this.sightRange = 200;
        this.scoreValue = 200;
    }
    
    updateMovement(deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 1000);
        const newX = this.x + Math.cos(this.angle) * moveSpeed;
        const newY = this.y + Math.sin(this.angle) * moveSpeed;
        
        if (this.canMoveTo(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.stuck = false;
            this.stuckTime = 0;
        } else {
            this.stuck = true;
        }
        
        // Keep in bounds
        this.x = Math.max(this.size, Math.min(this.game.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.game.height - this.size, this.y));
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
    
    drawEnemy(ctx) {
        // Add bright red outline for enemy identification
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2 - 1, -this.size/2 - 1, this.size + 2, this.size + 2);
        
        // Tank body (brighter gray)
        ctx.fillStyle = '#6a6a6a'; // Brighter than before
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Tank details (higher contrast)
        ctx.fillStyle = '#404040'; // Darker contrast
        ctx.fillRect(-this.size/3, -this.size/3, this.size/1.5, this.size/1.5);
        
        // Tank barrel (more visible)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(this.size + 8, 0);
        ctx.stroke();
        
        // Barrel highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size/2, -2);
        ctx.lineTo(this.size + 8, -2);
        ctx.stroke();
        
        // Tank treads (more defined)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Tread details
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = -this.size/2; i < this.size/2; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, -this.size/2);
            ctx.lineTo(i, this.size/2);
            ctx.stroke();
        }
        
        // Tank markings (brighter red)
        ctx.fillStyle = '#ff3333'; // Brighter red
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Marking outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Infantry Enemy
class Infantry extends Enemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.health = 6;
        this.maxHealth = 6;
        this.speed = 80;
        this.size = 12;
        this.shootDelay = 800;
        this.attackRange = 180;
        this.sightRange = 160;
        this.scoreValue = 100;
        
        // Animation
        this.animFrame = 0;
        this.animTime = 0;
    }
    
    updateMovement(deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 1000);
        const newX = this.x + Math.cos(this.angle) * moveSpeed;
        const newY = this.y + Math.sin(this.angle) * moveSpeed;
        
        if (this.canMoveTo(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.stuck = false;
            this.stuckTime = 0;
            
            // Update animation
            this.animTime += deltaTime;
            this.animFrame = Math.floor(this.animTime / 200) % 4;
        } else {
            this.stuck = true;
        }
        
        // Keep in bounds
        this.x = Math.max(this.size, Math.min(this.game.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(this.game.height - this.size, this.y));
    }
    
    canMoveTo(x, y) {
        // Infantry can move closer to trees but not through them
        for (let tree of this.game.trees) {
            const dx = x - tree.x;
            const dy = y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < tree.size + this.size - 5) {
                return false;
            }
        }
        return true;
    }
    
    drawEnemy(ctx) {
        // Add bright red outline for enemy identification
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2 - 1, -this.size/2 - 1, this.size + 2, this.size + 2);
        
        // Enemy soldier body (brighter brown)
        ctx.fillStyle = '#b8651a'; // Much brighter brown
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Uniform details (higher contrast)
        ctx.fillStyle = '#8b4513'; // Darker brown for contrast
        ctx.fillRect(-this.size/3, -this.size/4, this.size/1.5, this.size/2);
        
        // Uniform stripes for more detail
        ctx.fillStyle = '#654321';
        ctx.fillRect(-this.size/4, -this.size/6, this.size/2, 2);
        ctx.fillRect(-this.size/4, this.size/8, this.size/2, 2);
        
        // Helmet (more visible)
        ctx.fillStyle = '#404040'; // Brighter gray
        ctx.beginPath();
        ctx.arc(0, -this.size/3, this.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Weapon (more visible)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(this.size + 3, 0);
        ctx.stroke();
        
        // Weapon highlight
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size/2, -1);
        ctx.lineTo(this.size + 3, -1);
        ctx.stroke();
        
        // Eyes (brighter and more menacing)
        ctx.fillStyle = '#ff6666'; // Bright red eyes
        ctx.fillRect(-3, -this.size/3, 2, 2);
        ctx.fillRect(1, -this.size/3, 2, 2);
        
        // Eye glow effect
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -this.size/3, 1, 1);
        ctx.fillRect(2, -this.size/3, 1, 1);
        
        // Legs animation (more visible)
        if (this.animFrame % 2 === 0) {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-this.size/4, this.size/3, this.size/5, this.size/2);
            ctx.fillRect(this.size/8, this.size/3, this.size/5, this.size/2);
            
            // Leg outlines
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.size/4, this.size/3, this.size/5, this.size/2);
            ctx.strokeRect(this.size/8, this.size/3, this.size/5, this.size/2);
        }
    }
}
