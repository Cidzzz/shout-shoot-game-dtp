/**
 * Enemy Class
 * Enemy dengan 3 tipe, animasi Sprite, dan batas gerak aman
 */

import { CONFIG } from './config.js';

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialY = y;
    
    this.type = Math.floor(Math.random() * 3); 
    
    this.frames = [];
    this.currentFrame = 0;
    this.animationTimer = 0;
    this.animationInterval = 0.15; 
    
    const basePath = 'assets/sprites/'; 
    
    if (this.type === 0) {
      // Monster Merah (1 Frame)
      this.maxHealth = 30;
      this.scoreValue = 10;
      this.speed = CONFIG.ENEMY.SPEED * 1.3; 
      this.loadFrames([
        basePath + 'Red.png'
      ]);
    } else if (this.type === 1) {
      // Monster Kuning (2 Frame)
      this.maxHealth = 50;
      this.scoreValue = 20;
      this.speed = CONFIG.ENEMY.SPEED * 0.9; 
      this.waveAmplitude = 30; 
      this.waveFrequency = 0.015; 
      this.loadFrames([
        basePath + 'Yellow.png', 
        basePath + 'Yellow frame 2.png'
      ]);
    } else {
      // Monster Biru (3 Frame)
      this.maxHealth = 80;
      this.scoreValue = 30;
      this.speed = CONFIG.ENEMY.SPEED * 0.5; 
      this.loadFrames([
        basePath + 'Blue.png', 
        basePath + 'Blue frame 2.png',
        basePath + 'Blue frame 3.png'
      ]);
    }
    
    this.health = this.maxHealth;
    this.width = CONFIG.ENEMY.WIDTH;
    this.height = CONFIG.ENEMY.WIDTH; 
    this.isDead = false;
    this.phase = Math.random() * Math.PI * 2; 
    this.lastHitTime = 0; 
  }

  loadFrames(imagePaths) {
    for (const path of imagePaths) {
      const img = new Image();
      img.src = path;
      this.frames.push(img);
    }
  }

  update(deltaTime) {
    if (this.isDead) return;

    // Logika Animasi Frame
    if (this.frames.length > 1) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.animationInterval) {
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        this.animationTimer = 0; 
      }
    }

    // Gerakan Horizontal
    this.x -= this.speed * 60 * deltaTime; 

    // Gerakan Gelombang (Monster Kuning)
    if (this.type === 1) {
      this.y = this.initialY + Math.sin(this.x * this.waveFrequency + this.phase) * this.waveAmplitude;
      
      // Mencegah monster kuning naik menabrak UI
      if (this.y < 160) {
        this.y = 160;
      }
    } 
  }

  takeDamage(amount) {
    if (this.isDead) return 0;

    this.health -= amount;
    this.lastHitTime = Date.now(); 
    
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

    const isHit = Date.now() - this.lastHitTime < 100;
    if (isHit) {
      ctx.filter = 'brightness(2.5)'; 
    }

    const currentImage = this.frames[this.currentFrame];
    if (currentImage && currentImage.complete && currentImage.naturalWidth !== 0) {
      ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.type === 0 ? '#FF0000' : (this.type === 1 ? '#FFAA00' : '#0000FF');
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore(); 

    if (this.health < this.maxHealth) {
      const barWidth = this.width;
      const barHeight = 8;
      const barX = this.x;
      const barY = this.y - 15; 

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

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