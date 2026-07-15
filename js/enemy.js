/**
 * Enemy Class
 * Enemy dengan 3 tipe berbeda - each with unique behavior & sprites
 */

import { CONFIG } from './config.js';

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialY = y;
    
    // Random type: 0=Red, 1=Yellow, 2=Blue
    this.type = Math.floor(Math.random() * 3); 
    this.image = new Image();
    
    if (this.type === 0) {
      // 1. RED MONSTER: Fast & Straight
      this.image.src = 'assets/sprites/Red.png';
      this.maxHealth = 30;
      this.scoreValue = 10;
      this.speed = CONFIG.ENEMY.SPEED * 1.3; 
    } else if (this.type === 1) {
      // 2. YELLOW MONSTER: Wave pattern (medium)
      this.image.src = 'assets/sprites/Yellow.png';
      this.maxHealth = 50;
      this.scoreValue = 20;
      this.speed = CONFIG.ENEMY.SPEED * 0.9; 
      this.waveAmplitude = 30; // Small wave
      this.waveFrequency = 0.015; // Slow wave
    } else {
      // 3. BLUE MONSTER: Tank (slow but tough)
      this.image.src = 'assets/sprites/Blue.png';
      this.maxHealth = 80;
      this.scoreValue = 30;
      this.speed = CONFIG.ENEMY.SPEED * 0.5; 
    }
    
    this.health = this.maxHealth;
    this.width = CONFIG.ENEMY.WIDTH;
    this.height = CONFIG.ENEMY.WIDTH; 
    this.isDead = false;
    this.phase = Math.random() * Math.PI * 2; 

    // Hit effect timer
    this.lastHitTime = 0; 
  }

  update(deltaTime) {
    if (this.isDead) return;

    // All enemies move left
    this.x -= this.speed * 60 * deltaTime; 

    // Only yellow type (1) waves, others move straight
    if (this.type === 1) {
      this.y = this.initialY + Math.sin(this.x * this.waveFrequency + this.phase) * this.waveAmplitude;
    } 
  }

  takeDamage(amount) {
    if (this.isDead) return 0;

    this.health -= amount;
    this.lastHitTime = Date.now(); // Flash effect
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      return this.scoreValue;
    }
    
    return 0;
  }

  isOffScreen() { 
    return this.x + this.width < 0; 
  }
  
  hasReachedPlayer(threshold = 100) { 
    return this.x <= threshold; 
  }
  
  getHealthPercentage() { 
    return this.health / this.maxHealth; 
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save(); 

    // Flash white when hit
    const isHit = Date.now() - this.lastHitTime < 100;
    if (isHit) {
      ctx.filter = 'brightness(2.5)'; 
    }

    // Draw enemy sprite (with fallback to colored rect)
    if (this.image.complete && this.image.naturalWidth !== 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback colors if sprite not loaded
      ctx.fillStyle = this.type === 0 ? '#FF0000' : (this.type === 1 ? '#FFAA00' : '#0000FF');
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore(); 

    // Health bar (only show when damaged)
    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 8;
      const barX = this.x;
      const barY = this.y - 15; 

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Health fill
      const healthPercent = this.getHealthPercentage();
      const fillWidth = barWidth * healthPercent;
      
      if (healthPercent > 0.5) ctx.fillStyle = '#4CAF50'; 
      else if (healthPercent > 0.25) ctx.fillStyle = '#FFAA00';
      else ctx.fillStyle = '#FF0000';
      
      ctx.fillRect(barX, barY, fillWidth, barHeight);
    }
  }

  getCenter() { 
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 }; 
  }
  
  getBounds() { 
    return { x: this.x, y: this.y, width: this.width, height: this.height }; 
  }
}
