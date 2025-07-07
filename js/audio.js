// Audio Manager class
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // Initialize Web Audio API
        this.initAudioContext();
        
        // Audio buffers and sources
        this.sounds = {};
        this.musicSource = null;
        this.backgroundMusicPlaying = false;
        
        // Create synthetic sounds
        this.createSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.audioContext = null;
        }
    }
    
    createSounds() {
        if (!this.audioContext) return;
        
        // Create synthetic sound effects using Web Audio API
        this.createShootSound();
        this.createEnemyShootSound();
        this.createHurtSound();
        this.createPowerupSound();
        this.createEnemyDeathSound();
        this.createGameOverSound();
        this.createLevelUpSound();
        this.createGameWinSound();
    }
    
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode, duration };
    }
    
    createNoise(duration, volume = 0.1) {
        if (!this.audioContext) return null;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        return { source, gainNode, duration };
    }
    
    createShootSound() {
        this.sounds.shoot = () => {
            const sound1 = this.createTone(800, 0.1, 'square', 0.2);
            const sound2 = this.createTone(400, 0.15, 'sawtooth', 0.1);
            const noise = this.createNoise(0.05, 0.1);
            
            if (sound1) {
                sound1.oscillator.start();
                sound1.oscillator.stop(this.audioContext.currentTime + sound1.duration);
            }
            if (sound2) {
                sound2.oscillator.start();
                sound2.oscillator.stop(this.audioContext.currentTime + sound2.duration);
            }
            if (noise) {
                noise.source.start();
            }
        };
    }
    
    createEnemyShootSound() {
        this.sounds.enemyShoot = () => {
            const sound1 = this.createTone(600, 0.12, 'square', 0.15);
            const sound2 = this.createTone(300, 0.18, 'sawtooth', 0.08);
            
            if (sound1) {
                sound1.oscillator.start();
                sound1.oscillator.stop(this.audioContext.currentTime + sound1.duration);
            }
            if (sound2) {
                sound2.oscillator.start();
                sound2.oscillator.stop(this.audioContext.currentTime + sound2.duration);
            }
        };
    }
    
    createHurtSound() {
        this.sounds.hurt = () => {
            const sound = this.createTone(200, 0.3, 'sawtooth', 0.3);
            if (sound) {
                sound.oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + sound.duration);
            }
        };
    }
    
    createPowerupSound() {
        this.sounds.powerup = () => {
            const frequencies = [523, 659, 784, 1047]; // C, E, G, C
            frequencies.forEach((freq, index) => {
                const sound = this.createTone(freq, 0.2, 'sine', 0.2);
                if (sound) {
                    sound.oscillator.start(this.audioContext.currentTime + index * 0.1);
                    sound.oscillator.stop(this.audioContext.currentTime + index * 0.1 + sound.duration);
                }
            });
        };
    }
    
    createEnemyDeathSound() {
        this.sounds.enemyDeath = () => {
            const sound = this.createTone(150, 0.5, 'square', 0.2);
            const noise = this.createNoise(0.3, 0.15);
            
            if (sound) {
                sound.oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + sound.duration);
            }
            if (noise) {
                noise.source.start();
            }
        };
    }
    
    createGameOverSound() {
        this.sounds.gameOver = () => {
            // Sad trombone effect
            const frequencies = [233, 220, 207, 196]; // Descending notes
            frequencies.forEach((freq, index) => {
                const sound = this.createTone(freq, 0.8, 'triangle', 0.3);
                if (sound) {
                    sound.oscillator.start(this.audioContext.currentTime + index * 0.3);
                    sound.oscillator.stop(this.audioContext.currentTime + index * 0.3 + sound.duration);
                }
            });
        };
    }
    
    createLevelUpSound() {
        this.sounds.levelUp = () => {
            // Happy piano-like melody
            const melody = [523, 659, 784, 1047, 1319]; // C, E, G, C, E
            melody.forEach((freq, index) => {
                const sound = this.createTone(freq, 0.3, 'sine', 0.25);
                if (sound) {
                    sound.oscillator.start(this.audioContext.currentTime + index * 0.15);
                    sound.oscillator.stop(this.audioContext.currentTime + index * 0.15 + sound.duration);
                }
            });
        };
    }
    
    createGameWinSound() {
        this.sounds.gameWin = () => {
            // Victory fanfare
            const fanfare = [523, 523, 523, 659, 784, 784, 1047];
            fanfare.forEach((freq, index) => {
                const sound = this.createTone(freq, 0.4, 'triangle', 0.3);
                if (sound) {
                    sound.oscillator.start(this.audioContext.currentTime + index * 0.2);
                    sound.oscillator.stop(this.audioContext.currentTime + index * 0.2 + sound.duration);
                }
            });
        };
    }
    
    playBackgroundMusic() {
        if (!this.audioContext || this.backgroundMusicPlaying) return;
        
        this.backgroundMusicPlaying = true;
        this.playBackgroundLoop();
    }
    
    playBackgroundLoop() {
        if (!this.backgroundMusicPlaying) return;
        
        // Simple background music loop
        const bassLine = [130, 130, 174, 174, 146, 146, 196, 196];
        const melody = [523, 659, 784, 659, 523, 659, 784, 1047];
        
        bassLine.forEach((freq, index) => {
            const sound = this.createTone(freq, 0.8, 'triangle', 0.1 * this.musicVolume);
            if (sound) {
                sound.oscillator.start(this.audioContext.currentTime + index * 0.5);
                sound.oscillator.stop(this.audioContext.currentTime + index * 0.5 + sound.duration);
            }
        });
        
        melody.forEach((freq, index) => {
            const sound = this.createTone(freq, 0.4, 'sine', 0.08 * this.musicVolume);
            if (sound) {
                sound.oscillator.start(this.audioContext.currentTime + index * 0.5 + 0.1);
                sound.oscillator.stop(this.audioContext.currentTime + index * 0.5 + 0.1 + sound.duration);
            }
        });
        
        // Schedule next loop
        setTimeout(() => {
            if (this.backgroundMusicPlaying) {
                this.playBackgroundLoop();
            }
        }, 4000);
    }
    
    stopBackgroundMusic() {
        this.backgroundMusicPlaying = false;
    }
    
    // Public methods for playing sounds
    playShoot() {
        if (this.sounds.shoot) this.sounds.shoot();
    }
    
    playEnemyShoot() {
        if (this.sounds.enemyShoot) this.sounds.enemyShoot();
    }
    
    playHurt() {
        if (this.sounds.hurt) this.sounds.hurt();
    }
    
    playPowerup() {
        if (this.sounds.powerup) this.sounds.powerup();
    }
    
    playEnemyDeath() {
        if (this.sounds.enemyDeath) this.sounds.enemyDeath();
    }
    
    playGameOver() {
        if (this.sounds.gameOver) this.sounds.gameOver();
    }
    
    playLevelUp() {
        if (this.sounds.levelUp) this.sounds.levelUp();
    }
    
    // Generic tone generator for sound effects
    playTone(frequency, duration, waveType = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing tone:', error);
        }
    }
    
    playTNTPlace() {
        this.playTone(200, 0.1, 'square');
    }
    
    playTNTDetonate() {
        // Detonation trigger sound (different from explosion)
        this.playTone(300, 0.2, 'sawtooth');
        setTimeout(() => this.playTone(250, 0.1, 'square'), 50);
    }
    
    playExplosion() {
        // Big explosion sound
        this.playTone(80, 0.5, 'sawtooth');
        setTimeout(() => this.playTone(60, 0.3, 'square'), 100);
        setTimeout(() => this.playTone(40, 0.2, 'triangle'), 200);
    }
    
    playGameWin() {
        if (this.sounds.gameWin) this.sounds.gameWin();
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
}
