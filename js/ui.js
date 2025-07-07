// UI Manager functions
function updateUI() {
    const gameInstance = window.game || game;
    if (!gameInstance || !gameInstance.player) {
        console.log('updateUI: No game instance or player found');
        return;
    }
    
    const player = gameInstance.player;
    
    // Update health display
    const healthElement = document.getElementById('health');
    if (healthElement) {
        let healthDisplay = '';
        for (let i = 0; i < player.maxHealth; i++) {
            if (i < player.health) {
                healthDisplay += '♥';
            } else {
                healthDisplay += '♡';
            }
        }
        healthElement.textContent = healthDisplay;
        healthElement.style.color = player.health <= 3 ? '#ff0000' : '#00ff00';
    }
    
    // Update lives
    const livesElement = document.getElementById('lives');
    if (livesElement) {
        livesElement.textContent = player.lives;
    }
    
    // Update ammo
    const ammoElement = document.getElementById('ammo');
    if (ammoElement) {
        ammoElement.textContent = player.ammo;
        ammoElement.style.color = player.ammo <= 5 ? '#ff0000' : '#00ff00';
    }
    
    // Update TNT count
    const tntElement = document.getElementById('tnt');
    if (tntElement) {
        tntElement.textContent = player.tntCount || 0;
        tntElement.style.color = (player.tntCount || 0) === 0 ? '#ff0000' : '#ffff00';
    }
    
    // Update level
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = gameInstance.currentLevel;
    }
    
    // Update score
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = gameInstance.score;
    }
    
    // Update player name
    const playerNameElement = document.getElementById('playerNameDisplay');
    if (playerNameElement) {
        playerNameElement.textContent = gameInstance.playerName || 'Unknown';
    }
}

// Utility functions for UI interactions
function showNotification(message, duration = 2000, color = '#00ff00') {
    // Remove existing notification
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: ${color};
        padding: 20px;
        border: 2px solid ${color};
        font-family: 'Courier New', monospace;
        font-size: 24px;
        text-align: center;
        z-index: 1000;
        animation: fadeInOut ${duration}ms ease-in-out;
    `;
    
    // Add CSS animation
    if (!document.getElementById('notificationStyle')) {
        const style = document.createElement('style');
        style.id = 'notificationStyle';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.getElementById('gameContainer').appendChild(notification);
    
    // Remove notification after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

function showLevelTransition(level, terrainName = '') {
    const message = terrainName ? `LEVEL ${level}\n${terrainName}` : `LEVEL ${level}`;
    showNotification(message, 3000, '#ffff00');
}

function showPowerupMessage(type) {
    let message = '';
    let color = '#00ff00';
    
    switch (type) {
        case 'ammo':
            message = 'AMMO COLLECTED!';
            color = '#ffff00';
            break;
        case 'health':
            message = 'HEALTH RESTORED!';
            color = '#ff0000';
            break;
        case 'life':
            message = 'EXTRA LIFE!';
            color = '#00ff00';
            break;
    }
    
    showNotification(message, 1500, color);
}

function showEnemyKillMessage(enemyType) {
    let message = '';
    
    switch (enemyType) {
        case 'tank':
            message = 'TANK DESTROYED!';
            break;
        case 'infantry':
            message = 'ENEMY DOWN!';
            break;
    }
    
    showNotification(message, 1000, '#ff8800');
}

function updateMiniMapToggle() {
    const miniMapStatus = document.createElement('div');
    miniMapStatus.style.cssText = `
        position: absolute;
        top: 120px;
        left: 10px;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
    `;
    miniMapStatus.textContent = game.showMiniMap ? 'Mini-Map: ON' : 'Mini-Map: OFF';
    
    // Remove existing status
    const existing = document.getElementById('miniMapStatus');
    if (existing) existing.remove();
    
    miniMapStatus.id = 'miniMapStatus';
    document.getElementById('gameContainer').appendChild(miniMapStatus);
    
    // Remove after 2 seconds
    setTimeout(() => {
        if (miniMapStatus.parentNode) {
            miniMapStatus.remove();
        }
    }, 2000);
}

function showPauseStatus() {
    if (game.isPaused) {
        showNotification('GAME PAUSED', 1000, '#ffff00');
    } else {
        showNotification('GAME RESUMED', 1000, '#00ff00');
    }
}

function showMultiplayerMessage() {
    showNotification('MULTIPLAYER INVITE SENT!', 2000, '#00ffff');
}

// Enhanced game over screen
function updateGameOverScreen(isWin = false) {
    const gameOverDiv = document.getElementById('gameOver');
    const title = gameOverDiv.querySelector('h2');
    
    if (isWin) {
        title.textContent = 'VICTORY!';
        title.style.color = '#00ff00';
        gameOverDiv.style.borderColor = '#00ff00';
    } else {
        title.textContent = 'GAME OVER';
        title.style.color = '#ff0000';
        gameOverDiv.style.borderColor = '#ff0000';
    }
    
    // Add statistics
    let statsHTML = `
        <p>Final Score: <span id="finalScore">${game.score}</span></p>
        <p>Level Reached: <span id="finalLevel">${game.currentLevel}</span></p>
        <p>Enemies Defeated: <span>${Math.floor(game.score / 150)}</span></p>
    `;
    
    if (isWin) {
        statsHTML += '<p style="color: #00ff00;">ALL LEVELS COMPLETED!</p>';
    }
    
    // Update the content
    const existingStats = gameOverDiv.querySelector('.stats');
    if (existingStats) {
        existingStats.innerHTML = statsHTML;
    } else {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats';
        statsDiv.innerHTML = statsHTML;
        gameOverDiv.insertBefore(statsDiv, gameOverDiv.querySelector('button'));
    }
}

// Keyboard shortcut hints
function showKeyboardHints() {
    const hints = document.createElement('div');
    hints.id = 'keyboardHints';
    hints.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        opacity: 0.7;
        line-height: 1.2;
    `;
    hints.innerHTML = `
        <div>WASD/Arrows: Move</div>
        <div>Space: Shoot</div>
        <div>C: Hide</div>
        <div>M: Map</div>
        <div>P: Pause</div>
        <div>X: Multiplayer</div>
    `;
    
    document.getElementById('gameContainer').appendChild(hints);
    
    // Hide after 10 seconds
    setTimeout(() => {
        if (hints.parentNode) {
            hints.style.opacity = '0.3';
        }
    }, 10000);
}

// Initialize UI when game starts
function initializeUI() {
    updateUI();
    showKeyboardHints();
}

// Export functions for global access
window.updateUI = updateUI;
window.showNotification = showNotification;
window.showLevelTransition = showLevelTransition;
window.showPowerupMessage = showPowerupMessage;
window.showEnemyKillMessage = showEnemyKillMessage;
window.updateMiniMapToggle = updateMiniMapToggle;
window.showPauseStatus = showPauseStatus;
window.showMultiplayerMessage = showMultiplayerMessage;
window.updateGameOverScreen = updateGameOverScreen;
window.initializeUI = initializeUI;
