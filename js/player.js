/**
 * Player Class
 * Player otomatis maju, teriak untuk mundur, dan berputar 360 derajat
 */

import { CONFIG } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.PLAYER.WIDTH;
    this.height = CONFIG.PLAYER.WIDTH; 
    
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.score = 0;
    this.isDamaged = false;
    this.damageTimer = 0;
    this.damageDuration = 0.2; 
    this.totalDistance = 0; 
    this.angle = 0;

    this.image = new Image();
    this.image.src = 'assets/sprites/Player.png'; 
  }

  /**
   * Menghitung sudut rotasi 360 derajat
   */
  setAim(targetX, targetY) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    this.angle = Math.atan2(targetY - centerY, targetX - centerX);
  }

  update(volumeLevel, deltaTime, canvasWidth) {
    // 1. Auto-Forward
    const autoForwardSpeed = 80;
    const forwardMovement = autoForwardSpeed * deltaTime;
    this.x += forwardMovement;
    this.totalDistance += forwardMovement; 

    // 2. Shout to Retreat
    if (volumeLevel > CONFIG.AUDIO.VOLUME_THRESHOLD) {
      const retreatSpeed = volumeLevel * CONFIG.PLAYER.SPEED_MULTIPLIER * 250; 
      this.x -= retreatSpeed * deltaTime; 
    }

    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));

    if (this.isDamaged) {
      this.damageTimer += deltaTime;
      if (this.damageTimer >= this.damageDuration) {
        this.isDamaged = false;
        this.damageTimer = 0;
      }
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    this.isDamaged = true;
    this.damageTimer = 0;
    return this.health <= 0;
  }

  addScore(points) { this.score += points; }
  isDead() { return this.health <= 0; }
  getHealthPercentage() { return this.health / this.maxHealth; }

  reset() {
    this.x = CONFIG.PLAYER.START_X;
    this.y = CONFIG.PLAYER.START_Y;
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.score = 0;
    this.totalDistance = 0;
    this.isDamaged = false;
    this.angle = 0;
  }

  /**
   * Draw dengan Rotasi 360 derajat yang benar
   */
  draw(ctx) {
    ctx.save();
    
    // Pindahkan titik pusat canvas ke tengah posisi player
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Putar canvas berdasarkan angle yang sudah dihitung di setAim
    ctx.rotate(this.angle);

    // Gambar pesawat di titik (-width/2, -height/2) agar tetap di tengah setelah diputar
    if (this.isDamaged) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15;
    }

    if (this.image.complete && this.image.naturalWidth !== 0) {
      // Menggambar dari -width/2 dan -height/2 sangat krusial untuk rotasi 360
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    
    ctx.restore();
  }

  getCenter() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}