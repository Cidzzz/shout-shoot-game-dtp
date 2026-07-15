/**
 * Player Class
 * Player auto-advances forward, and retreats (dodges) when shouting
 */

import { CONFIG } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Force square ratio for sprite
    this.width = CONFIG.PLAYER.WIDTH;
    this.height = CONFIG.PLAYER.WIDTH; 
    
    this.health = CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.score = 0;
    this.isDamaged = false;
    this.damageTimer = 0;
    this.damageDuration = 0.2; 
    this.totalDistance = 0; 

    // Rotation angle for aiming
    this.angle = 0; // Default facing right (0 degrees)

    // Load player sprite
    this.image = new Image();
    this.image.src = 'assets/sprites/Player.png'; 
  }

  /**
   * Set aim direction (rotate player towards target)
   * @param {number} targetX - Target X coordinate (crosshair)
   * @param {number} targetY - Target Y coordinate (crosshair)
   */
  setAim(targetX, targetY) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    // Calculate angle towards target (in radians)
    this.angle = Math.atan2(targetY - centerY, targetX - centerX);
  }

  /**
   * Update player position based on voice control
   * NEW MECHANIC: Auto-forward + Shout to Retreat/Dodge
   * @param {number} volumeLevel - Volume level (0-1)
   * @param {number} deltaTime - Time since last frame (seconds)
   * @param {number} canvasWidth - Canvas width for clamping
   */
  update(volumeLevel, deltaTime, canvasWidth) {
    // --- NEW LOGIC: Auto-Forward & Shout to Retreat ---

    // 1. Player auto-advances forward (right) constantly
    const autoForwardSpeed = 80; // Auto-advance speed
    const forwardMovement = autoForwardSpeed * deltaTime;
    this.x += forwardMovement;
    
    // Distance keeps increasing as player advances
    this.totalDistance += forwardMovement; 

    // 2. When SHOUTING, player RETREATS (left) to dodge enemies!
    if (volumeLevel > CONFIG.AUDIO.VOLUME_THRESHOLD) {
      const retreatSpeed = volumeLevel * CONFIG.PLAYER.SPEED_MULTIPLIER * 250; 
      const backwardMovement = retreatSpeed * deltaTime;
      
      // Subtract to move backward (left)
      this.x -= backwardMovement; 
    }

    // 3. Clamp position within canvas bounds
    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));

    // Update damage flash effect
    if (this.isDamaged) {
      this.damageTimer += deltaTime;
      if (this.damageTimer >= this.damageDuration) {
        this.isDamaged = false;
        this.damageTimer = 0;
      }
    }
  }

  /**
   * Take damage from enemy
   * @param {number} amount - Damage amount
   * @returns {boolean} - true if player died
   */
  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    this.isDamaged = true;
    this.damageTimer = 0;
    
    return this.health <= 0;
  }

  /**
   * Add score when enemy killed
   * @param {number} points - Points to add
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Check if player is dead
   * @returns {boolean}
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Get health percentage
   * @returns {number} - Health percentage (0-1)
   */
  getHealthPercentage() {
    return this.health / this.maxHealth;
  }

  /**
   * Draw player with sprite and rotation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    ctx.save();
    
    // Flash red when damaged
    if (this.isDamaged) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
    }

    // Rotate player towards aim direction
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(this.angle);
    ctx.translate(-centerX, -centerY);

    // Draw player sprite (with fallback to rect)
    if (this.image.complete && this.image.naturalWidth !== 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback to green rectangle
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore();
  }

  /**
   * Get player center position
   * @returns {Object} - {x, y} center coordinates
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /**
   * Get player bounds for collision
   * @returns {Object} - {x, y, width, height}
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}
