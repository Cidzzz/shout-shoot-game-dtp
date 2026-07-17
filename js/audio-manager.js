/**
 * Audio Manager
 * Handles all game audio (BGM & SFX)
 */

export class AudioManager {
  constructor() {
    // Background Music
    this.bgMusic = {
      menu: new Audio('assets/audio/Landing Page.mpeg'),
      gameplay: new Audio('assets/audio/Gameplay.mpeg')
    };
    
    // Configure BGM
    this.bgMusic.menu.loop = true;
    this.bgMusic.menu.volume = 1.0;
    this.bgMusic.gameplay.loop = true;
    this.bgMusic.gameplay.volume = 0.3;
    
    // Sound Effects
    this.sounds = {
      shoot: new Audio('assets/audio/Laser.mpeg'),
      gameOver: new Audio('assets/audio/Game Over.mpeg')
    };
    
    // Set SFX volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 1.0;
    });
    
    this.isMuted = false;
    this.currentBGM = null; // Track which BGM is playing
  }
  
  /**
   * Play menu background music
   */
  playMenuMusic() {
    if (!this.isMuted) {
      this.stopAllMusic();
      this.currentBGM = this.bgMusic.menu;
      this.bgMusic.menu.play().catch(e => console.log('Autoplay blocked:', e));
    }
  }
  
  /**
   * Play gameplay background music
   */
  playGameplayMusic() {
    if (!this.isMuted) {
      this.stopAllMusic();
      this.currentBGM = this.bgMusic.gameplay;
      this.bgMusic.gameplay.play().catch(e => console.log('Autoplay blocked:', e));
    }
  }
  
  /**
   * Stop all background music
   */
  stopAllMusic() {
    Object.values(this.bgMusic).forEach(music => {
      music.pause();
      music.currentTime = 0;
    });
    this.currentBGM = null;
  }
  
  /**
   * Play sound effect
   * @param {string} soundName - Name of sound to play
   */
  playSound(soundName) {
    if (!this.isMuted && this.sounds[soundName]) {
      const sound = this.sounds[soundName];
      sound.currentTime = 0; // Reset to start
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }
  
  /**
   * Toggle mute on/off
   * @returns {boolean} - New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      // Mute: pause current BGM
      if (this.currentBGM) {
        this.currentBGM.pause();
      }
    } else {
      // Unmute: resume current BGM
      if (this.currentBGM) {
        this.currentBGM.play().catch(e => console.log('Resume failed:', e));
      }
    }
    
    return this.isMuted;
  }
  
  /**
   * Set BGM volume
   * @param {number} volume - Volume level (0-1)
   */
  setBGMVolume(volume) {
    Object.values(this.bgMusic).forEach(music => {
      music.volume = Math.max(0, Math.min(1, volume));
    });
  }
  
  /**
   * Set SFX volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}
