// Main Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.currentLevel = 1;
        this.score = 0;
        this.isPaused = false;
        this.showMiniMap = false;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.trees = [];
        this.terrain = [];
        this.tntList = []; // Array to hold TNT objects
        
        // Player info
        this.playerName = 'Unknown';
        this.leaderboard = this.loadLeaderboard();
        
        // Initialize zoom level from localStorage
        this.initializeZoom();
        
        // Terrain system
        this.currentTerrain = 'forest';
        this.terrainConfig = {
            forest: {
                name: 'Forest',
                bgColor: '#1a2d1a',
                textureColor: '#0d1a0d',
                obstacleColor: '#2d5a2d',
                obstacleHighlight: '#4a7a4a',
                obstacleName: 'trees'
            },
            river: {
                name: 'Forest River',
                bgColor: '#1a2d2d',
                textureColor: '#0d1a1a',
                obstacleColor: '#2d5a2d',
                obstacleHighlight: '#4a7a4a',
                riverColor: '#2d4a6a',
                obstacleName: 'trees'
            },
            desert: {
                name: 'Desert',
                bgColor: '#3d2d1a',
                textureColor: '#2d1a0d',
                obstacleColor: '#6a5a3d',
                obstacleHighlight: '#8a7a5d',
                obstacleName: 'rocks'
            },
            snow: {
                name: 'Snowy Mountains',
                bgColor: '#2d2d3d',
                textureColor: '#1a1a2d',
                obstacleColor: '#4a4a6a',
                obstacleHighlight: '#6a6a8a',
                obstacleName: 'rocks'
            },
            urban: {
                name: 'Urban Ruins',
                bgColor: '#2d2d2d',
                textureColor: '#1a1a1a',
                obstacleColor: '#4a4a4a',
                obstacleHighlight: '#6a6a6a',
                obstacleName: 'buildings'
            },
            swamp: {
                name: 'Toxic Swamp',
                bgColor: '#2d3d1a',
                textureColor: '#1a2d0d',
                obstacleColor: '#3d5a2d',
                obstacleHighlight: '#5a7a4a',
                obstacleName: 'trees'
            }
        };
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Emergency ammo system
        this.emergencyAmmoDropped = false;
        this.emergencyAmmoCooldown = 0;
        
        // Level completion timer
        this.levelCompletionTimer = null;
        this.levelStarted = false;
        
        // Audio manager
        this.audioManager = new AudioManager();
        
        // Level configuration - Extended to 20 levels
        this.levelConfig = {
            1: { tanks: 1, infantry: 2, powerups: 3 },
            2: { tanks: 2, infantry: 3, powerups: 3 },
            3: { tanks: 2, infantry: 4, powerups: 3 },
            4: { tanks: 3, infantry: 4, powerups: 4 },
            5: { tanks: 3, infantry: 5, powerups: 4 },
            6: { tanks: 4, infantry: 5, powerups: 4 },
            7: { tanks: 4, infantry: 6, powerups: 5 },
            8: { tanks: 5, infantry: 6, powerups: 5 },
            9: { tanks: 5, infantry: 7, powerups: 5 },
            10: { tanks: 6, infantry: 7, powerups: 6 },
            11: { tanks: 6, infantry: 8, powerups: 6 },
            12: { tanks: 7, infantry: 8, powerups: 6 },
            13: { tanks: 7, infantry: 9, powerups: 7 },
            14: { tanks: 8, infantry: 9, powerups: 7 },
            15: { tanks: 8, infantry: 10, powerups: 7 },
            16: { tanks: 9, infantry: 10, powerups: 8 },
            17: { tanks: 9, infantry: 11, powerups: 8 },
            18: { tanks: 10, infantry: 11, powerups: 8 },
            19: { tanks: 10, infantry: 12, powerups: 9 },
            20: { tanks: 12, infantry: 15, powerups: 10 }
        };
        
        // Initialize with forest terrain
        this.currentTerrain = 'forest';
        
        this.init();
    }
    
    init() {
        // Check if enemy classes are available
        console.log('Tank class available:', typeof Tank);
        console.log('Infantry class available:', typeof Infantry);
        
        this.generateTerrain();
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle special keys
            switch(e.code) {
                case 'KeyP':
                    this.togglePause();
                    break;
                case 'KeyM':
                    this.showMiniMap = !this.showMiniMap;
                    break;
                case 'KeyX':
                    this.callForHelp();
                    break;
                case 'KeyL': // Show leaderboard
                    console.log('L key pressed - showing leaderboard');
                    this.showLeaderboardInGame();
                    break;
                case 'Escape': // Close menus/leaderboard
                    console.log('Escape key pressed - closing menus');
                    this.handleEscapeKey();
                    break;
                case 'KeyZ': // Cycle zoom levels
                    console.log('Z key pressed - cycling zoom');
                    this.cycleZoom();
                    break;
                case 'KeyB': // TNT placement
                    console.log('B key pressed - Game state:', this.gameState, 'Player exists:', !!this.player);
                    if (this.gameState === 'playing' && this.player) {
                        console.log('Calling player.placeTNT()');
                        this.player.placeTNT();
                    } else {
                        console.log('Cannot place TNT - game not playing or no player');
                    }
                    break;
                case 'KeyN': // Detonate all TNT
                    console.log('N key pressed - Game state:', this.gameState, 'TNT count:', this.tntList.length);
                    if (this.gameState === 'playing') {
                        console.log('Calling detonateAllTNT()');
                        this.detonateAllTNT();
                    } else {
                        console.log('Cannot detonate TNT - game not playing');
                    }
                    break;
                case 'Space':
                    e.preventDefault();
                    if (this.gameState === 'playing' && this.player) {
                        this.player.shoot();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        
        // Reset all game arrays
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.tntList = [];
        this.trees = [];
        this.terrain = [];
        
        // Reset terrain to forest for level 1
        this.currentTerrain = 'forest';
        
        // Generate terrain first
        this.generateTerrain();
        
        // Find a safe spawn position for player
        const safeSpawn = this.findSafeSpawnPosition();
        this.player = new Player(safeSpawn.x, safeSpawn.y, this);
        
        // Reset player stats
        this.player.lives = 3;
        this.player.health = this.player.maxHealth;
        this.player.ammo = this.player.maxAmmo;
        this.player.tntCount = 3;
        
        // Force immediate UI update
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
        this.loadLevel(this.currentLevel);
        this.hideMenu();
        this.audioManager.playBackgroundMusic();
        
        // Update UI after game starts
        setTimeout(() => {
            if (typeof updateUI === 'function') {
                updateUI();
            }
        }, 100);
        
        console.log('Game started/restarted - terrain and player initialized');
    }
    
    loadLevel(level) {
        console.log(`Loading level ${level}`);
        
        // Clear any existing level completion timer
        if (this.levelCompletionTimer) {
            clearTimeout(this.levelCompletionTimer);
            this.levelCompletionTimer = null;
        }
        
        // Reset level started flag
        this.levelStarted = false;
        
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        
        // Reset emergency ammo system for new level
        this.emergencyAmmoDropped = false;
        this.emergencyAmmoCooldown = 0;
        
        // Set terrain based on level (only if not level 1 restart)
        if (level !== 1 || this.trees.length === 0) {
            this.setTerrainForLevel(level);
            console.log(`Terrain set to: ${this.currentTerrain}`);
            
            // Generate new terrain
            this.generateTerrain();
        } else {
            console.log(`Using existing terrain: ${this.currentTerrain}`);
        }
        
        const config = this.levelConfig[level] || this.levelConfig[20];
        console.log(`Level config:`, config);
        
        // Spawn enemies
        for (let i = 0; i < config.tanks; i++) {
            this.spawnEnemy('tank');
        }
        
        for (let i = 0; i < config.infantry; i++) {
            this.spawnEnemy('infantry');
        }
        
        console.log(`Spawned ${this.enemies.length} enemies (${config.tanks} tanks, ${config.infantry} infantry)`);
        console.log(`Trees: ${this.trees.length}, Player: ${this.player ? 'exists' : 'missing'}`);
        
        // Mark level as started only if enemies were spawned
        this.levelStarted = this.enemies.length > 0;
        console.log(`Level started: ${this.levelStarted}`);
        
        // Spawn powerups
        for (let i = 0; i < config.powerups; i++) {
            this.spawnPowerup();
        }
        
        // Show level transition with terrain name
        const terrainName = this.terrainConfig[this.currentTerrain].name;
        showLevelTransition(level, terrainName);
        updateUI();
    }
    
    placeTNT(x, y) {
        console.log('Game placeTNT called at:', x, y);
        try {
            const tnt = new TNT(x, y, this);
            this.tntList.push(tnt);
            console.log(`TNT placed at (${Math.round(x)}, ${Math.round(y)}). Total TNT: ${this.tntList.length}`);
        } catch (error) {
            console.error('Error placing TNT:', error);
        }
    }
    
    detonateAllTNT() {
        let detonatedCount = 0;
        this.tntList.forEach(tnt => {
            if (tnt.active) {
                tnt.detonate();
                detonatedCount++;
            }
        });
        
        if (detonatedCount > 0) {
            console.log(`Detonated ${detonatedCount} TNT explosives`);
            this.audioManager.playTNTDetonate();
        } else {
            console.log('No TNT to detonate');
        }
    }
    
    createExplosion(x, y, radius) {
        // Visual explosion effect - you can enhance this later
        console.log(`Explosion at (${x}, ${y}) with radius ${radius}`);
        
        // Add screen shake effect
        this.screenShake = 300; // milliseconds of screen shake
    }
    
    loadLeaderboard() {
        return JSON.parse(localStorage.getItem('tankRunLeaderboard') || '[]');
    }
    
    saveScore() {
        console.log('saveScore called - Name:', this.playerName, 'Score:', this.score, 'Level:', this.currentLevel);
        const scores = this.loadLeaderboard();
        console.log('Current scores in storage:', scores);
        
        const newScore = {
            name: this.playerName || 'Anonymous',
            score: this.score || 0,
            level: this.currentLevel || 1,
            date: new Date().toLocaleDateString()
        };
        
        scores.push(newScore);
        console.log('Adding new score:', newScore);
        console.log('Updated scores array:', scores);
        
        localStorage.setItem('tankRunLeaderboard', JSON.stringify(scores));
        console.log('Scores saved to localStorage');
    }
    
    quitToMenu() {
        this.gameState = 'menu';
        this.audioManager.stopBackgroundMusic();
        this.showMenu();
    }
    
    showLeaderboardInGame() {
        this.gameState = 'paused';
        document.getElementById('leaderboard').style.display = 'block';
        updateLeaderboardDisplay();
    }
    
    handleEscapeKey() {
        // Close any open menus and return to appropriate state
        const leaderboard = document.getElementById('leaderboard');
        const gameOver = document.getElementById('gameOver');
        const menu = document.getElementById('menu');
        const nameInput = document.getElementById('nameInput');
        const instructions = document.getElementById('instructions');
        
        if (leaderboard.style.display === 'block') {
            // Close leaderboard
            leaderboard.style.display = 'none';
            if (this.gameState === 'paused' && this.player) {
                // Resume game if it was paused for leaderboard
                this.gameState = 'playing';
                console.log('Leaderboard closed, resuming game');
            } else {
                // Return to main menu
                this.showMenu();
            }
        } else if (instructions.style.display === 'block') {
            // Close instructions
            instructions.style.display = 'none';
            this.showMenu();
        } else if (nameInput.style.display === 'block') {
            // Close name input
            nameInput.style.display = 'none';
            this.showMenu();
        } else if (this.gameState === 'playing') {
            // Pause/unpause game
            this.togglePause();
        }
    }
    
    cycleZoom() {
        // Initialize zoom level if not set
        if (!this.zoomLevel) {
            // Try to load from localStorage first
            const savedZoom = localStorage.getItem('tankRunZoomLevel');
            this.zoomLevel = savedZoom || 'normal';
        }
        
        // Cycle through zoom levels
        const zoomLevels = ['small', 'normal', 'large', 'xlarge'];
        const currentIndex = zoomLevels.indexOf(this.zoomLevel);
        const nextIndex = (currentIndex + 1) % zoomLevels.length;
        this.zoomLevel = zoomLevels[nextIndex];
        
        // Save zoom level to localStorage
        localStorage.setItem('tankRunZoomLevel', this.zoomLevel);
        
        // Apply zoom to body class
        this.applyZoomLevel();
        
        // Show zoom notification
        this.showZoomNotification();
        
        console.log(`Zoom level changed to: ${this.zoomLevel}`);
    }
    
    applyZoomLevel() {
        const body = document.body;
        // Remove all zoom classes
        body.classList.remove('zoom-small', 'zoom-normal', 'zoom-large', 'zoom-xlarge');
        // Add current zoom class
        body.classList.add(`zoom-${this.zoomLevel}`);
    }
    
    initializeZoom() {
        // Load saved zoom level from localStorage
        const savedZoom = localStorage.getItem('tankRunZoomLevel');
        this.zoomLevel = savedZoom || 'xlarge'; // Default to xlarge (Full Size View)
        
        // Apply the zoom level
        this.applyZoomLevel();
        
        console.log(`Zoom level initialized to: ${this.zoomLevel}`);
    }
    
    showZoomNotification() {
        // Create or update zoom notification
        let notification = document.getElementById('zoomNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'zoomNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 10px 15px;
                border: 2px solid #00ff00;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                z-index: 1000;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(notification);
        }
        
        // Update notification text
        const zoomNames = {
            'small': 'Compact (60%)',
            'normal': 'Standard (75%)',
            'large': 'Large (90%)',
            'xlarge': 'Maximum (100%)'
        };
        
        notification.textContent = `View: ${zoomNames[this.zoomLevel]}`;
        notification.style.opacity = '1';
        
        // Hide notification after 2 seconds
        clearTimeout(this.zoomNotificationTimeout);
        this.zoomNotificationTimeout = setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
    }
    
    // Cache-busting comment - v1.1
    findSafeSpawnPosition() {
        let attempts = 0;
        let x, y;
        let safePosition = false;
        
        // Try to find a safe position
        do {
            x = Math.random() * (this.width - 200) + 100; // More margin from edges
            y = Math.random() * (this.height - 200) + 100;
            
            // Check if position is safe (no trees within larger radius)
            safePosition = true;
            for (let tree of this.trees) {
                const dx = tree.x - x;
                const dy = tree.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < tree.size + 60) { // Larger safe radius
                    safePosition = false;
                    break;
                }
            }
            
            attempts++;
        } while (!safePosition && attempts < 50);
        
        // If no safe position found, use center of screen
        if (!safePosition) {
            console.log('No safe spawn position found, using center');
            x = this.width / 2;
            y = this.height / 2;
        }
        
        console.log(`Safe spawn position found at (${Math.round(x)}, ${Math.round(y)}) after ${attempts} attempts`);
        return { x, y };
    }
    
    spawnEnemy(type) {
        let x, y;
        let attempts = 0;
        
        console.log(`Attempting to spawn ${type}...`);
        
        do {
            x = Math.random() * (this.width - 64) + 32;
            y = Math.random() * (this.height - 64) + 32;
            attempts++;
            
            if (attempts % 10 === 0) {
                console.log(`Spawn attempt ${attempts} for ${type} at (${Math.round(x)}, ${Math.round(y)})`);
            }
        } while (this.isPositionBlocked(x, y) && attempts < 50);
        
        if (attempts >= 50) {
            console.warn(`Failed to find spawn position for ${type} after ${attempts} attempts`);
            // Force spawn at a basic position
            x = Math.random() * (this.width - 100) + 50;
            y = Math.random() * (this.height - 100) + 50;
        }
        
        try {
            if (type === 'tank') {
                const tank = new Tank(x, y, this);
                this.enemies.push(tank);
                console.log(`✅ Spawned tank at (${Math.round(x)}, ${Math.round(y)}) - Health: ${tank.health} - Total enemies: ${this.enemies.length}`);
            } else {
                const infantry = new Infantry(x, y, this);
                this.enemies.push(infantry);
                console.log(`✅ Spawned infantry at (${Math.round(x)}, ${Math.round(y)}) - Health: ${infantry.health} - Total enemies: ${this.enemies.length}`);
            }
        } catch (error) {
            console.error(`❌ Failed to spawn ${type}:`, error);
        }
    }
    
    spawnPowerup(forceType = null) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.random() * (this.width - 32) + 16;
            y = Math.random() * (this.height - 32) + 16;
            attempts++;
        } while (this.isPositionBlocked(x, y) && attempts < 50);
        
        const types = ['ammo', 'health', 'life'];
        const type = forceType || types[Math.floor(Math.random() * types.length)];
        this.powerups.push(new Powerup(x, y, type, this));
    }
    
    setTerrainForLevel(level) {
        const terrainTypes = ['forest', 'river', 'desert', 'snow', 'urban', 'swamp'];
        const terrainIndex = Math.floor((level - 1) / 3) % terrainTypes.length;
        this.currentTerrain = terrainTypes[terrainIndex];
        
        // Special terrains for specific levels
        if (level === 1) this.currentTerrain = 'forest';
        if (level === 4) this.currentTerrain = 'river';
        if (level === 7) this.currentTerrain = 'desert';
        if (level === 10) this.currentTerrain = 'snow';
        if (level === 13) this.currentTerrain = 'urban';
        if (level === 16) this.currentTerrain = 'swamp';
        if (level === 20) this.currentTerrain = 'urban'; // Final boss in urban ruins
    }
    
    generateTerrain() {
        this.trees = [];
        this.terrain = [];
        
        const config = this.terrainConfig[this.currentTerrain];
        
        // Generate special terrain features
        if (this.currentTerrain === 'river') {
            this.generateRiver();
        }
        
        // Generate obstacles (trees, rocks, buildings)
        this.generateObstacles();
    }
    
    generateRiver() {
        // Create a winding river
        const riverWidth = 60;
        const riverPoints = [];
        
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * this.width;
            const y = this.height / 2 + Math.sin(i * 0.8) * 100;
            riverPoints.push({ x, y });
        }
        
        this.terrain.push({
            type: 'river',
            points: riverPoints,
            width: riverWidth
        });
    }
    
    generateObstacles() {
        this.trees = []; // Still called trees for compatibility, but represents all obstacles
        const obstacleCount = 35 + Math.random() * 15;
        
        // Create safe zones
        const safeZones = [
            { x: this.width / 2, y: this.height / 2, radius: 100 }, // Center
            { x: 100, y: 100, radius: 80 }, // Top-left
            { x: this.width - 100, y: this.height - 100, radius: 80 }, // Bottom-right
        ];
        
        for (let i = 0; i < obstacleCount; i++) {
            let x, y, size;
            let attempts = 0;
            let validPosition = false;
            
            do {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
                size = 12 + Math.random() * 18;
                
                // Check if obstacle is in a safe zone
                validPosition = true;
                for (let zone of safeZones) {
                    const dx = x - zone.x;
                    const dy = y - zone.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < zone.radius) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check river collision for river terrain
                if (validPosition && this.currentTerrain === 'river') {
                    for (let terrain of this.terrain) {
                        if (terrain.type === 'river') {
                            for (let point of terrain.points) {
                                const dx = x - point.x;
                                const dy = y - point.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                if (distance < terrain.width) {
                                    validPosition = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // Check if too close to other obstacles
                if (validPosition) {
                    for (let obstacle of this.trees) {
                        const dx = x - obstacle.x;
                        const dy = y - obstacle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < obstacle.size + size + 15) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
                attempts++;
            } while (!validPosition && attempts < 50);
            
            if (validPosition) {
                this.trees.push({ x, y, size, type: this.currentTerrain });
            }
        }
    }
    
    isPositionBlocked(x, y, radius = 32) {
        // Check trees
        for (let tree of this.trees) {
            const dx = x - tree.x;
            const dy = y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < tree.size + radius) {
                return true;
            }
        }
        
        // Check player
        if (this.player) {
            const dx = x - this.player.x;
            const dy = y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius + 32) {
                return true;
            }
        }
        
        return false;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.keys);
        }
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Update bullets
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        
        // Update powerups
        this.powerups.forEach(powerup => powerup.update(deltaTime));
        
        // Update TNT
        this.tntList.forEach(tnt => tnt.update(deltaTime));
        
        // Remove dead objects
        const beforeBullets = this.bullets.length;
        const beforeEnemies = this.enemies.length;
        const beforePowerups = this.powerups.length;
        
        this.bullets = this.bullets.filter(bullet => bullet.active);
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.health <= 0) {
                console.log(`Enemy removed - health: ${enemy.health}`);
                return false;
            }
            return true;
        });
        this.powerups = this.powerups.filter(powerup => powerup.active);
        this.tntList = this.tntList.filter(tnt => tnt.active);
        
        if (beforeEnemies !== this.enemies.length) {
            console.log(`Enemies changed: ${beforeEnemies} → ${this.enemies.length}`);
        }
        
        // Check level completion (only if level has started and enemies were spawned)
        if (this.enemies.length === 0 && this.gameState === 'playing' && this.levelStarted) {
            console.log(`Level completion check: enemies=${this.enemies.length}, gameState=${this.gameState}, levelStarted=${this.levelStarted}`);
            
            // Add a small delay to make sure this isn't called immediately after level load
            if (!this.levelCompletionTimer) {
                this.levelCompletionTimer = setTimeout(() => {
                    console.log(`Level completion timer fired: enemies=${this.enemies.length}, gameState=${this.gameState}`);
                    if (this.enemies.length === 0 && this.gameState === 'playing') {
                        console.log('All enemies defeated! Completing level...');
                        this.completeLevel();
                    }
                    this.levelCompletionTimer = null;
                }, 100);
            }
        } else {
            // Clear timer if enemies exist
            if (this.levelCompletionTimer) {
                clearTimeout(this.levelCompletionTimer);
                this.levelCompletionTimer = null;
            }
            
            // Log current state for debugging
            if (this.enemies.length > 0) {
                console.log(`Enemies alive: ${this.enemies.length}, Health values: [${this.enemies.map(e => e.health).join(', ')}]`);
            }
        }
        
        // Check game over
        if (this.player && this.player.lives <= 0) {
            this.gameOver();
        }
        
        // Update UI periodically (every ~20 frames at 60fps = 3 times per second)
        if (Math.random() < 0.05) {
            if (typeof updateUI === 'function') {
                updateUI();
            }
        }
        
        // Update emergency ammo cooldown
        if (this.emergencyAmmoCooldown > 0) {
            this.emergencyAmmoCooldown -= deltaTime;
        }
        
        // Emergency ammo spawn when player is out (limited and with cooldown)
        if (this.player && this.player.ammo === 0 && !this.emergencyAmmoDropped && this.emergencyAmmoCooldown <= 0) {
            // Spawn only 2 ammo packs near player
            for (let i = 0; i < 2; i++) {
                const angle = (Math.PI * 2 * i) / 2 + Math.random() * 0.5;
                const distance = 80 + Math.random() * 40;
                const ammoX = this.player.x + Math.cos(angle) * distance;
                const ammoY = this.player.y + Math.sin(angle) * distance;
                
                // Make sure it's in bounds
                const clampedX = Math.max(20, Math.min(this.width - 20, ammoX));
                const clampedY = Math.max(20, Math.min(this.height - 20, ammoY));
                
                this.powerups.push(new Powerup(clampedX, clampedY, 'ammo', this));
            }
            
            this.emergencyAmmoDropped = true;
            this.emergencyAmmoCooldown = 10000; // 10 second cooldown
            showNotification('EMERGENCY AMMO DROPPED!', 2000, '#ffff00');
        }
        
        // Reset emergency ammo flag when player gets ammo
        if (this.player && this.player.ammo > 0) {
            this.emergencyAmmoDropped = false;
        }
        
        // Randomly spawn ammo drops more frequently when player is low on ammo
        if (this.player && this.player.ammo < 10) {
            if (Math.random() < 0.002) { // Higher chance when low on ammo
                this.spawnPowerup('ammo');
            }
        } else if (Math.random() < 0.0005) {
            this.spawnPowerup();
        }
    }
    
    render() {
        const config = this.terrainConfig[this.currentTerrain];
        
        // Clear canvas with terrain-appropriate background
        this.ctx.fillStyle = config.bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Debug logging (remove after testing)
        if (Math.random() < 0.01) { // Log occasionally to avoid spam
            console.log(`Rendering: Trees=${this.trees.length}, Enemies=${this.enemies.length}, Player=${this.player ? 'exists' : 'missing'}, GameState=${this.gameState}`);
        }
        
        // Add terrain-appropriate texture pattern
        this.ctx.fillStyle = config.textureColor;
        for (let x = 0; x < this.width; x += 20) {
            for (let y = 0; y < this.height; y += 20) {
                if ((x + y) % 40 === 0) {
                    this.ctx.fillRect(x, y, 2, 2);
                }
            }
        }
        
        if (this.gameState === 'playing') {
            // Draw terrain features (rivers, etc.)
            this.drawTerrain();
            
            // Draw obstacles (trees, rocks, buildings)
            this.drawObstacles();
            
            // Draw powerups
            this.powerups.forEach(powerup => powerup.render(this.ctx));
            
            // Draw TNT
            this.tntList.forEach(tnt => tnt.render(this.ctx));
            
            // Draw player
            if (this.player) {
                this.player.render(this.ctx);
            }
            
            // Draw enemies
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            
            // Draw bullets
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            
            // Draw mini-map
            if (this.showMiniMap) {
                this.drawMiniMap();
            }
            
            // Draw pause overlay
            if (this.isPaused) {
                this.drawPauseOverlay();
            }
        }
    }
    
    drawTerrain() {
        // Draw special terrain features
        for (let feature of this.terrain) {
            if (feature.type === 'river') {
                this.drawRiver(feature);
            }
        }
    }
    
    drawRiver(river) {
        this.ctx.strokeStyle = this.terrainConfig[this.currentTerrain].riverColor;
        this.ctx.lineWidth = river.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(river.points[0].x, river.points[0].y);
        for (let i = 1; i < river.points.length; i++) {
            this.ctx.lineTo(river.points[i].x, river.points[i].y);
        }
        this.ctx.stroke();
        
        // Add river highlights
        this.ctx.strokeStyle = '#4a6a8a';
        this.ctx.lineWidth = river.width * 0.3;
        this.ctx.beginPath();
        this.ctx.moveTo(river.points[0].x, river.points[0].y - river.width * 0.2);
        for (let i = 1; i < river.points.length; i++) {
            this.ctx.lineTo(river.points[i].x, river.points[i].y - river.width * 0.2);
        }
        this.ctx.stroke();
    }
    
    drawObstacles() {
        const config = this.terrainConfig[this.currentTerrain];
        
        this.trees.forEach(obstacle => {
            // Obstacle shadow for depth
            this.ctx.fillStyle = config.textureColor;
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x + 2, obstacle.y + 2, obstacle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main obstacle body
            this.ctx.fillStyle = config.obstacleColor;
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Obstacle highlights
            this.ctx.fillStyle = config.obstacleHighlight;
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x - obstacle.size/3, obstacle.y - obstacle.size/3, obstacle.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Obstacle-specific details
            if (this.currentTerrain === 'urban') {
                // Building windows
                this.ctx.fillStyle = '#ffff88';
                for (let i = 0; i < 3; i++) {
                    const windowX = obstacle.x - obstacle.size/2 + (i * obstacle.size/3);
                    const windowY = obstacle.y - obstacle.size/3;
                    this.ctx.fillRect(windowX, windowY, 3, 3);
                }
            } else if (this.currentTerrain === 'desert') {
                // Rock cracks
                this.ctx.strokeStyle = config.textureColor;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x - obstacle.size/2, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.size/2, obstacle.y);
                this.ctx.stroke();
            }
            
            // Obstacle outline for better definition
            this.ctx.strokeStyle = config.textureColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }
    
    drawMiniMap() {
        const mapSize = 150;
        const mapX = this.width - mapSize - 10;
        const mapY = 10;
        const scale = mapSize / Math.max(this.width, this.height);
        
        // Map background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        // Player dot
        if (this.player) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(
                mapX + this.player.x * scale - 2,
                mapY + this.player.y * scale - 2,
                4, 4
            );
        }
        
        // Enemy dots
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(
                mapX + enemy.x * scale - 1,
                mapY + enemy.y * scale - 1,
                2, 2
            );
        });
        
        // Powerup dots
        this.ctx.fillStyle = '#ffff00';
        this.powerups.forEach(powerup => {
            this.ctx.fillRect(
                mapX + powerup.x * scale - 1,
                mapY + powerup.y * scale - 1,
                2, 2
            );
        });
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 50);
    }
    
    completeLevel() {
        // Prevent multiple calls to completeLevel
        if (this.gameState !== 'playing') {
            console.log('Level completion ignored - game not in playing state');
            return;
        }
        
        const completedLevel = this.currentLevel; // Store current level before incrementing
        this.score += 1000 * completedLevel;
        this.audioManager.playLevelUp();
        
        console.log(`Level ${completedLevel} completed! Moving to level ${completedLevel + 1}`);
        
        // Show correct completion message
        showNotification(`LEVEL ${completedLevel} COMPLETE!`, 2000, '#00ff00');
        
        if (completedLevel >= 20) {
            console.log('Game won - reached level 20!');
            this.gameWin();
        } else {
            // Set game state to prevent multiple completions
            this.gameState = 'levelTransition';
            this.currentLevel++; // Increment AFTER showing completion message
            console.log(`Current level now: ${this.currentLevel}`);
            
            setTimeout(() => {
                if (this.gameState === 'levelTransition') {
                    console.log(`Loading level ${this.currentLevel}`);
                    this.gameState = 'playing'; // Reset state before loading
                    this.loadLevel(this.currentLevel);
                }
            }, 3000);
        }
    }
    
    gameWin() {
        this.gameState = 'gameOver';
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playGameWin();
        
        // Save score to leaderboard
        this.saveScore();
        
        this.showGameOver(true);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playGameOver();
        
        // Save score to leaderboard
        this.saveScore();
        
        this.showGameOver(false);
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.isPaused = !this.isPaused;
        }
    }
    
    callForHelp() {
        // Placeholder for multiplayer functionality
        console.log('Calling for multiplayer help!');
        // In a real implementation, this would send an invite to friends
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    hideMenu() {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('nameInput').style.display = 'none';
        document.getElementById('leaderboard').style.display = 'none';
        
        // Show UI when game starts
        const uiElement = document.getElementById('ui');
        if (uiElement) {
            uiElement.style.display = 'block';
        }
    }
    
    showMenu() {
        document.getElementById('menu').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        this.gameState = 'menu';
    }
    
    showGameOver(isWin = false) {
        const gameOverDiv = document.getElementById('gameOver');
        const title = gameOverDiv.querySelector('h2');
        
        if (isWin) {
            title.textContent = 'VICTORY!';
            title.style.color = '#00ff00';
        } else {
            title.textContent = 'GAME OVER';
            title.style.color = '#ff0000';
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.currentLevel;
        gameOverDiv.style.display = 'block';
    }
}

// Global game instance
let game;

function showInstructions() {
    const instructions = document.getElementById('instructions');
    instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
}

function shareScore() {
    const score = game.score;
    const level = game.currentLevel;
    const text = `I just scored ${score} points and reached level ${level} in Tank Run! Can you beat my score?`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Tank Run Score',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    }
}

function showMenu() {
    game.showMenu();
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new Game();
});
