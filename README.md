# Tank Run - Retro Style Tank Game

A retro-style top-down tank combat game built with HTML5 Canvas and JavaScript. Survive 10 levels of intense combat in a forest battlefield!

## How to Play

### Objective
- Survive 20 increasingly difficult levels (expanded from 10!)
- Eliminate all enemy tanks and infantry in each level
- Collect power-ups to stay alive
- Achieve the highest score possible

### Controls
- **WASD** or **Arrow Keys** - Move your soldier
- **Spacebar** - Shoot your weapon
- **C** - Hide behind cover (trees)
- **M** - Toggle mini-map
- **P** - Pause/Resume game
- **X** - Call for multiplayer help (placeholder)

### Game Elements

#### Player
- **Health**: 9 hearts (displayed as ♥)
- **Lives**: 3 total lives
- **Ammo**: 50 bullets (increased from 30, collect ammo packs to refill)

#### Enemies
- **Tanks**: 12 health, slow but powerful
- **Infantry**: 6 health, fast and aggressive

#### Power-ups
- **Yellow Ammo Packs**: Restore 25 bullets (+50 points) - increased from 15!
- **Red Health Packs**: Restore 3 hearts (+100 points)
- **Green Life Packs**: Grant extra life (+500 points)

#### Environment
- **Trees**: Provide cover from enemy fire
- **Forest Setting**: Navigate through dense woodland with safe zones
- **Mini-map**: Shows positions of all entities

### Special Features
- **Emergency Ammo**: When you run out of ammo, emergency supplies are dropped nearby!
- **Smart Spawning**: Player spawns in safe areas away from trees
- **Adaptive Difficulty**: More enemies and power-ups in later levels
- **Extended Campaign**: 20 levels of increasing challenge

### Scoring
- Infantry Kill: 100 points
- Tank Kill: 200 points
- Level Completion: 1000 × level number
- Power-up Collection: 50-500 points

### Special Features
- **Stealth System**: Hide behind trees to avoid detection
- **Dynamic AI**: Enemies search for you and coordinate attacks
- **Progressive Difficulty**: Each level adds more enemies
- **Retro Audio**: Chiptune-style sound effects and music
- **Visual Effects**: Bullet trails, explosions, and particle effects

## Setup Instructions

### Option 1: Simple File Opening
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. Click "Start Game" to begin playing

### Option 2: Local Server (Recommended)
For the best experience, run a local web server:

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server
```

#### Using PHP:
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Browser Requirements
- Modern web browser with HTML5 Canvas support
- Web Audio API support for sound effects
- Recommended: Chrome, Firefox, Safari, or Edge

## Game Features

### Audio System
- **Background Music**: Retro-style chiptune loops
- **Sound Effects**: 
  - Shooting sounds (different for player/enemies)
  - Impact and explosion effects
  - Power-up collection sounds
  - Level completion melodies
  - Game over "sad trombone"

### Visual Features
- **Pixel Art Style**: Retro 16-bit inspired graphics
- **Smooth Animations**: Character movement and bullet trails
- **Dynamic Lighting**: Glow effects and shadows
- **Particle Effects**: Explosions and impact effects
- **UI Elements**: Health bars, mini-map, and HUD

### AI Behavior
- **Patrol Mode**: Enemies wander when player not detected
- **Search Mode**: Investigate last known player position
- **Combat Mode**: Aggressive pursuit and coordinated attacks
- **Line of Sight**: Realistic vision system with cover mechanics

## Development

### File Structure
```
tank-run/
├── index.html          # Main game page
├── design.md          # Game design document
├── README.md          # This file
└── js/
    ├── game.js        # Main game engine
    ├── player.js      # Player character logic
    ├── enemy.js       # Enemy AI and behavior
    ├── bullet.js      # Projectile physics
    ├── powerup.js     # Collectible items
    ├── audio.js       # Sound system
    └── ui.js          # User interface
```

### Technical Details
- **Engine**: Pure JavaScript with HTML5 Canvas
- **Graphics**: 2D sprite-based rendering
- **Audio**: Web Audio API for synthetic sounds
- **Input**: Keyboard event handling
- **Performance**: 60 FPS target with efficient rendering

### Customization
You can easily modify the game by editing:
- **Level Configuration**: Adjust enemy counts in `game.js`
- **Player Stats**: Modify health, speed, ammo in `player.js`
- **Enemy Behavior**: Tweak AI parameters in `enemy.js`
- **Visual Style**: Change colors and sizes throughout
- **Audio**: Modify sound frequencies and patterns in `audio.js`

## Tips for Players

1. **Use Cover Wisely**: Trees block enemy bullets and hide you from sight
2. **Manage Ammo**: Don't waste shots, collect ammo packs regularly
3. **Stay Mobile**: Standing still makes you an easy target
4. **Watch the Mini-map**: Use 'M' to track enemy positions
5. **Prioritize Targets**: Take out infantry first, they're faster
6. **Collect Power-ups**: They spawn randomly and disappear after 30 seconds
7. **Use Stealth**: Press 'C' near trees to become harder to detect

## Troubleshooting

### No Sound
- Ensure your browser supports Web Audio API
- Check browser audio permissions
- Try refreshing the page

### Poor Performance
- Close other browser tabs
- Try a different browser
- Reduce browser zoom level

### Controls Not Working
- Click on the game area to focus
- Ensure no other applications are capturing keyboard input
- Try refreshing the page

## Future Enhancements

Potential features for future versions:
- Real multiplayer support
- More enemy types and weapons
- Level editor
- Mobile touch controls
- Save/load game progress
- Achievement system
- Leaderboards

## Credits

Created as a retro-style homage to classic top-down shooters. All code, graphics, and audio generated using modern web technologies.

Enjoy the game and try to beat all 10 levels!
