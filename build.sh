#!/bin/bash

# 🔧 Tank Run - Build Script
# Obfuscates and minifies code for production deployment

set -e  # Exit on any error

# Configuration
BUILD_DIR="dist"
TEMP_DIR="temp_build"
COMBINED_JS="tank-run.min.js"
COMBINED_CSS="tank-run.min.css"

echo "🔧 Tank Run - Production Build"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Or visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "npm should come with Node.js installation"
    exit 1
fi

echo "✅ Node.js and npm are available"
echo ""

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "tank-run-game",
  "version": "1.0.0",
  "description": "Retro-style tank combat game",
  "main": "index.html",
  "scripts": {
    "build": "./build.sh",
    "deploy": "./deploy.sh"
  },
  "keywords": ["game", "tank", "retro", "html5", "javascript"],
  "author": "Tank Run Developer",
  "license": "MIT",
  "devDependencies": {
    "terser": "^5.19.0",
    "html-minifier-terser": "^7.2.0",
    "clean-css-cli": "^5.6.2",
    "javascript-obfuscator": "^4.0.2"
  }
}
EOF
    echo "✅ package.json created"
fi

# Install build dependencies
echo "📦 Installing build dependencies..."
npm install --save-dev terser html-minifier-terser clean-css-cli javascript-obfuscator

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf $BUILD_DIR $TEMP_DIR
mkdir -p $BUILD_DIR $TEMP_DIR

echo "✅ Build directory cleaned"
echo ""

# Combine JavaScript files in correct order
echo "🔗 Combining JavaScript files..."
cat > $TEMP_DIR/$COMBINED_JS << 'EOF'
// Tank Run Game - Production Build
// Combined and minified JavaScript
EOF

# Add JS files in dependency order
cat js/audio.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/bullet.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/tnt.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/powerup.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/enemy.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/player.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/ui.js >> $TEMP_DIR/$COMBINED_JS
echo "" >> $TEMP_DIR/$COMBINED_JS
cat js/game.js >> $TEMP_DIR/$COMBINED_JS

echo "✅ JavaScript files combined"

# Obfuscate JavaScript
echo "🔒 Obfuscating JavaScript..."
npx javascript-obfuscator $TEMP_DIR/$COMBINED_JS \
    --output $TEMP_DIR/obfuscated.js \
    --compact true \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.75 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.4 \
    --debug-protection false \
    --debug-protection-interval false \
    --disable-console-output false \
    --identifier-names-generator hexadecimal \
    --log false \
    --rename-globals false \
    --rotate-string-array true \
    --self-defending true \
    --shuffle-string-array true \
    --split-strings true \
    --split-strings-chunk-length 10 \
    --string-array true \
    --string-array-encoding rc4 \
    --string-array-threshold 0.75 \
    --transform-object-keys true \
    --unicode-escape-sequence false

if [ $? -eq 0 ]; then
    echo "✅ JavaScript obfuscated successfully"
else
    echo "❌ Failed to obfuscate JavaScript"
    exit 1
fi

# Minify obfuscated JavaScript
echo "🗜️  Minifying JavaScript..."
npx terser $TEMP_DIR/obfuscated.js \
    --compress drop_console=false,drop_debugger=true,pure_funcs=['console.log'] \
    --mangle \
    --output $BUILD_DIR/$COMBINED_JS

if [ $? -eq 0 ]; then
    echo "✅ JavaScript minified successfully"
else
    echo "❌ Failed to minify JavaScript"
    exit 1
fi

# Extract and minify CSS from HTML
echo "🎨 Processing CSS..."
# Extract CSS from index.html
sed -n '/<style>/,/<\/style>/p' index.html | sed '1d;$d' > $TEMP_DIR/styles.css

# Minify CSS
npx cleancss $TEMP_DIR/styles.css --output $BUILD_DIR/$COMBINED_CSS

if [ $? -eq 0 ]; then
    echo "✅ CSS minified successfully"
else
    echo "❌ Failed to minify CSS"
    exit 1
fi

# Create production HTML
echo "📄 Creating production HTML..."
cat > $BUILD_DIR/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tank Run - Retro Tank Combat Game</title>
    <meta name="description" content="Tank Run - Retro style tank combat game. Survive 20 levels of intense combat with tactical TNT explosives!">
    <meta name="keywords" content="tank game, retro game, combat, HTML5 game, javascript game, browser game">
    <meta name="author" content="Tank Run Developer">
    <meta property="og:title" content="Tank Run - Retro Tank Combat Game">
    <meta property="og:description" content="Survive 20 levels of intense tank combat in this retro-style game with TNT explosives!">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/1a2d1a/00ff00?text=Tank+Run+Game">
    <link rel="stylesheet" href="tank-run.min.css">
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas" width="1024" height="768"></canvas>
        
        <div id="ui">
            <div>Player: <span id="playerNameDisplay">Unknown</span></div>
            <div>Health: <span id="health">♥♥♥♥♥♥♥♥♥</span></div>
            <div>Lives: <span id="lives">3</span></div>
            <div>Ammo: <span id="ammo">30</span></div>
            <div>TNT: <span id="tnt">3</span></div>
            <div>Level: <span id="level">1</span></div>
            <div>Score: <span id="score">0</span></div>
        </div>
        
        <div id="menu">
            <h1>TANK RUN</h1>
            <p>Retro Tank Combat Game</p>
            <button onclick="showNameInput()">Start Game</button>
            <button onclick="showLeaderboard()">Leaderboard (L)</button>
            <button onclick="showInstructions()">How to Play</button>
        </div>
        
        <div id="nameInput" style="display: none;">
            <h2>Enter Your Name</h2>
            <input type="text" id="playerName" placeholder="Enter your name" maxlength="20">
            <br><br>
            <button onclick="startGameWithName()">START GAME</button>
            <button onclick="showMenu()">BACK</button>
        </div>
        
        <div id="instructions" style="display: none;">
            <h3>Controls:</h3>
            <p>WASD or Arrow Keys - Move</p>
            <p>Q/E - Rotate Turret</p>
            <p>Spacebar - Shoot</p>
            <p>B - Place TNT</p>
            <p>N - Detonate all TNT</p>
            <p>C - Hide behind cover</p>
            <p>M - Toggle mini-map</p>
            <p>P - Pause/Resume</p>
            <p>Q - Quit to menu</p>
            <p>L - Show leaderboard</p>
            <p>X - Call for multiplayer help</p>
            <br>
            <p>Survive 20 levels across different terrains!</p>
            <p>Collect ammo bags and med packs to survive.</p>
            <p>Use TNT strategically to destroy enemies and trees!</p>
            <button onclick="showMenu()">BACK</button>
        </div>
        
        <div id="leaderboard" style="display: none;">
            <h2>🏆 LEADERBOARD</h2>
            <div id="leaderboardList" style="text-align: left; margin: 20px 0;">
                <!-- Leaderboard entries will be populated here -->
            </div>
            <button onclick="addTestScore()">Add Test Score</button>
            <button onclick="clearLeaderboard()">Clear Scores</button>
            <button onclick="showMenu()">BACK</button>
        </div>
        
        <div id="gameOver" style="display: none;">
            <h2 id="gameOverTitle">GAME OVER</h2>
            <p id="gameOverMessage">You fought bravely!</p>
            <p>Final Score: <span id="finalScore">0</span></p>
            <p>Level Reached: <span id="finalLevel">1</span></p>
            <button onclick="restartGame()">PLAY AGAIN</button>
            <button onclick="showLeaderboard()">LEADERBOARD</button>
            <button onclick="showMenu()">MAIN MENU</button>
        </div>
    </div>

    <script src="tank-run.min.js"></script>
    <script>
        // Global functions for HTML onclick handlers
        function showMenu() {
            document.getElementById('menu').style.display = 'block';
            document.getElementById('nameInput').style.display = 'none';
            document.getElementById('leaderboard').style.display = 'none';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('instructions').style.display = 'none';
            
            if (window.game && window.game.gameState === 'playing') {
                window.game.gameState = 'paused';
            }
        }

        function showNameInput() {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('nameInput').style.display = 'block';
            document.getElementById('playerName').focus();
        }

        function showInstructions() {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('instructions').style.display = 'block';
        }

        function showLeaderboard() {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('leaderboard').style.display = 'block';
            updateLeaderboardDisplay();
        }

        function startGame() {
            if (typeof Game === 'undefined') {
                console.error('Game class not yet loaded, retrying...');
                setTimeout(() => startGame(), 100);
                return;
            }
            
            if (!window.game) {
                window.game = new Game();
            }
            window.game.startGame();
        }

        function startGameWithName() {
            const nameInput = document.getElementById('playerName');
            const playerName = nameInput.value.trim() || 'Anonymous';
            
            if (typeof Game === 'undefined') {
                console.error('Game class not yet loaded, retrying...');
                setTimeout(() => startGameWithName(), 100);
                return;
            }
            
            if (!window.game) {
                window.game = new Game();
            }
            
            window.game.playerName = playerName;
            document.getElementById('playerNameDisplay').textContent = playerName;
            document.getElementById('nameInput').style.display = 'none';
            window.game.startGame();
        }

        function restartGame() {
            if (window.game) {
                window.game.startGame();
            }
            document.getElementById('gameOver').style.display = 'none';
        }

        function updateLeaderboardDisplay() {
            console.log('updateLeaderboardDisplay called');
            const leaderboardList = document.getElementById('leaderboardList');
            const scores = JSON.parse(localStorage.getItem('tankRunLeaderboard') || '[]');
            
            console.log('Loaded scores from localStorage:', scores);
            
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<p>No scores yet! Play the game to set a high score.</p>';
                return;
            }
            
            const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
            console.log('Sorted top scores:', sortedScores);
            
            leaderboardList.innerHTML = sortedScores
                .map((entry, index) => 
                    `<div class="leaderboard-entry">
                        <span>${index + 1}. ${entry.name || 'Anonymous'}</span>
                        <span>Level ${entry.level || 1} - ${entry.score || 0} pts</span>
                    </div>`
                ).join('');
                
            console.log('Leaderboard HTML updated');
        }

        function clearLeaderboard() {
            if (confirm('Clear all scores?')) {
                localStorage.removeItem('tankRunLeaderboard');
                updateLeaderboardDisplay();
            }
        }
        
        function addTestScore() {
            const scores = JSON.parse(localStorage.getItem('tankRunLeaderboard') || '[]');
            scores.push({
                name: 'Test Player',
                score: 5000,
                level: 5,
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('tankRunLeaderboard', JSON.stringify(scores));
            updateLeaderboardDisplay();
            console.log('Test score added');
        }

        // Global updateUI function (fallback if ui.js not loaded)
        function updateUI() {
            const gameInstance = window.game;
            if (!gameInstance || !gameInstance.player) {
                console.log('updateUI: No game instance or player found');
                return;
            }
            
            const player = gameInstance.player;
            
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
            
            const livesElement = document.getElementById('lives');
            if (livesElement) livesElement.textContent = player.lives;
            
            const ammoElement = document.getElementById('ammo');
            if (ammoElement) {
                ammoElement.textContent = player.ammo;
                ammoElement.style.color = player.ammo <= 5 ? '#ff0000' : '#00ff00';
            }
            
            const tntElement = document.getElementById('tnt');
            if (tntElement) {
                tntElement.textContent = player.tntCount || 0;
                tntElement.style.color = (player.tntCount || 0) === 0 ? '#ff0000' : '#ffff00';
            }
            
            const levelElement = document.getElementById('level');
            if (levelElement) levelElement.textContent = gameInstance.currentLevel;
            
            const scoreElement = document.getElementById('score');
            if (scoreElement) scoreElement.textContent = gameInstance.score;
            
            const playerNameElement = document.getElementById('playerNameDisplay');
            if (playerNameElement) playerNameElement.textContent = gameInstance.playerName || 'Unknown';
        }

        // Initialize game when page loads
        window.addEventListener('load', function() {
            console.log('Page loaded, initializing game...');
            if (typeof Game !== 'undefined') {
                window.game = new Game();
                console.log('Game initialized successfully');
            } else {
                console.error('Game class not found!');
            }
        });
    </script>
</body>
</html>
EOF

# Minify the HTML
echo "🗜️  Minifying HTML..."
npx html-minifier-terser $BUILD_DIR/index.html \
    --collapse-whitespace \
    --remove-comments \
    --remove-optional-tags \
    --remove-redundant-attributes \
    --remove-script-type-attributes \
    --remove-tag-whitespace \
    --use-short-doctype \
    --minify-css true \
    --minify-js true \
    --output $BUILD_DIR/index.html

if [ $? -eq 0 ]; then
    echo "✅ HTML minified successfully"
else
    echo "❌ Failed to minify HTML"
    exit 1
fi

# Copy additional files
echo "📋 Copying additional files..."
cp README.md $BUILD_DIR/ 2>/dev/null || true
cp HOW-TO-PLAY.md $BUILD_DIR/ 2>/dev/null || true

# Create build info
echo "📊 Creating build information..."
cat > $BUILD_DIR/build-info.json << EOF
{
    "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "1.0.0",
    "buildType": "production",
    "obfuscated": true,
    "minified": true,
    "files": {
        "javascript": "$COMBINED_JS",
        "css": "$COMBINED_CSS",
        "html": "index.html"
    },
    "originalSize": {
        "javascript": "$(du -b js/*.js | awk '{sum += $1} END {print sum}') bytes",
        "html": "$(wc -c < index.html) bytes"
    },
    "compressedSize": {
        "javascript": "$(wc -c < $BUILD_DIR/$COMBINED_JS) bytes",
        "html": "$(wc -c < $BUILD_DIR/index.html) bytes"
    }
}
EOF

# Calculate compression ratio
ORIGINAL_JS_SIZE=$(du -b js/*.js | awk '{sum += $1} END {print sum}')
COMPRESSED_JS_SIZE=$(wc -c < $BUILD_DIR/$COMBINED_JS)
COMPRESSION_RATIO=$(echo "scale=2; (1 - $COMPRESSED_JS_SIZE / $ORIGINAL_JS_SIZE) * 100" | bc -l 2>/dev/null || echo "N/A")

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo ""
echo "🎉 Build Complete!"
echo "=================="
echo ""
echo "📁 Production files created in: $BUILD_DIR/"
echo "   📄 index.html (minified)"
echo "   📜 $COMBINED_JS (obfuscated & minified)"
echo "   🎨 $COMBINED_CSS (minified)"
echo "   📊 build-info.json"
echo ""
echo "📊 Compression Statistics:"
echo "   Original JS: $(echo $ORIGINAL_JS_SIZE | numfmt --to=iec) bytes"
echo "   Compressed JS: $(echo $COMPRESSED_JS_SIZE | numfmt --to=iec) bytes"
echo "   Compression: ${COMPRESSION_RATIO}% reduction"
echo ""
echo "🔒 Security Features:"
echo "   ✅ Code obfuscated with multiple techniques"
echo "   ✅ Variable names scrambled"
echo "   ✅ Control flow flattened"
echo "   ✅ Dead code injection"
echo "   ✅ String array encoding"
echo ""
echo "🚀 Ready for deployment!"
echo "   Run: ./deploy.sh from the $BUILD_DIR directory"
echo "   Or manually upload files from $BUILD_DIR/ to your web server"
echo ""
echo "💡 Next steps:"
echo "   1. Test the production build locally"
echo "   2. Deploy to AWS S3 or your preferred hosting"
echo "   3. Monitor performance and loading times"
echo ""
echo "🎮 Your obfuscated Tank Run game is ready!"
