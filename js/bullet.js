/**
 * Bullet Class
 * Bullet yang ditembakkan player ke arah target (hand pointer)
 */

import { CONFIG } from './config.js';

export class Bullet {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.width = CONFIG.BULLET.WIDTH;
    this.height = CONFIG.BULLET.HEIGHT;
    this.damage = CONFIG.BULLET.DAMAGE;
    this.isActive = true;

    // Calculate direction vector from start to target
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize and multiply by speed
    if (distance > 0) {
      this.vx = (dx / distance) * CONFIG.BULLET.SPEED;
      this.vy = (dy / distance) * CONFIG.BULLET.SPEED;
    } else {
      // Default direction (right) jika target sama dengan start
      this.vx = CONFIG.BULLET.SPEED;
      this.vy = 0;
    }

    // Calculate angle untuk rotation (optional untuk visual)
    this.angle = Math.atan2(dy, dx);
  }

  /**
   * Update bullet position
   * @param {number} deltaTime - Time since last frame (seconds)
   * @param {number} canvasWidth - Canvas width untuk boundary check
   * @param {number} canvasHeight - Canvas height untuk boundary check
   */
  update(deltaTime, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // Move bullet
    this.x += this.vx * 60 * deltaTime; // 60 untuk normalize speed
    this.y += this.vy * 60 * deltaTime;

    // Deactivate if out of bounds
    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.isActive = false;
    }
  }

  /**
   * Deactivate bullet (setelah hit enemy)
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Draw bullet (DUMMY: circle kuning)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.isActive) return;

    // Main bullet body
    ctx.fillStyle = '#FFEB3B'; // Kuning
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Inner glow (putih kecil di tengah)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Get bounding box untuk collision detection
   * @returns {Object} - {x, y, width, height}
   */
  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
}
