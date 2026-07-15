/**
 * UI Module
 * Handles all UI rendering (menu, HUD, game over, etc.)
 */

import { CONFIG } from './config.js';

export class UI {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Button definitions
    this.startButton = { x: 0, y: 0, width: 300, height: 70 };
    this.restartButton = { x: 0, y: 0, width: 300, height: 70 };
    this.menuButton = { x: 0, y: 0, width: 300, height: 70 };
  }

  // ========== MENU ==========

  /**
   * Draw main menu
   */
  drawMenu(stateManager, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Title with neon glow effect
    ctx.font = "bold 72px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("SHOUT & SHOOT", canvas.width / 2, canvas.height / 2 - 120);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = "24px 'Orbitron', sans-serif";
    ctx.fillStyle = '#00FFFF';
    ctx.fillText("Voice + Hand Control Game", canvas.width / 2, canvas.height / 2 - 60);

    // Instructions
    ctx.font = "18px 'Orbitron', sans-serif";
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText("TERIAK untuk bergerak ke kanan", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("ARAHKAN TANGAN untuk menembak", canvas.width / 2, canvas.height / 2 + 5);

    // Start button
    const btnWidth = 300;
    const btnHeight = 70;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    const btnY = canvas.height / 2 + 50;

    this.startButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

    // Check if hovering
    const pointer = handTracker.getPointer();
    const isHovering = pointer.visible && handTracker.isPointerInRect(this.startButton);

    // Draw button
    this.drawButton(this.startButton, "START GAME", '#00FF00', isHovering, handTracker.getDwellProgress());
  }

  // ========== GAME HUD ==========

  /**
   * Draw HUD (health bar, score)
   */
  drawHUD(player) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Health bar (top left)
    const healthBarWidth = 200;
    const healthBarHeight = 25;
    const healthBarX = 20;
    const healthBarY = 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health fill
    const healthPercent = player.getHealthPercentage();
    const fillWidth = healthBarWidth * healthPercent;
    
    // Color based on health
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#4CAF50'; // Green
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#FFEB3B'; // Yellow
    } else {
      ctx.fillStyle = '#F44336'; // Red
    }
    
    ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health text
    ctx.font = "16px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`HEALTH: ${Math.round(player.health)}`, healthBarX + 5, healthBarY + 18);

    // Score (top center)
    ctx.font = "bold 32px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFEB3B';
    ctx.fillText(`SCORE: ${player.score}`, canvas.width / 2, 50);
    ctx.shadowBlur = 0;
  }

  /**
   * Draw progress bar (jarak ke finish line)
   */
  drawProgressBar(player, canvas) {
    const ctx = this.ctx;
    const barWidth = 400;
    const barHeight = 25;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 60; // Below score

    // Calculate progress
    const progress = Math.min(player.totalDistance / CONFIG.GAME.FINISH_DISTANCE, 1);
    const fillWidth = barWidth * progress;

    // Draw background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw progress fill with gradient
    const gradient = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#8BC34A');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Draw border
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Draw distance text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "bold 14px 'Orbitron'";
    ctx.textAlign = 'center';
    const distanceText = `${Math.floor(player.totalDistance)}m / ${CONFIG.GAME.FINISH_DISTANCE}m`;
    ctx.fillText(distanceText, canvas.width / 2, barY + 17);

    // Draw "FINISH" marker when close
    if (progress > 0.9) {
      ctx.fillStyle = '#FFD700';
      ctx.font = "bold 18px 'Orbitron'";
      ctx.fillText('🏁 FINISH LINE AHEAD!', canvas.width / 2, barY - 10);
    }
  }

  // ========== GAME OVER ==========

  /**
   * Draw game over screen
   */
  drawGameOver(player, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over text
    ctx.font = "bold 64px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF5555';
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 100);
    ctx.shadowBlur = 0;

    // Final score
    ctx.font = "32px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Final Score: ${player.score}`, canvas.width / 2, canvas.height / 2 - 30);

    // Buttons
    const btnWidth = 300;
    const btnHeight = 70;
    const btnMargin = 20;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    const restartY = canvas.height / 2 + 30;
    const menuY = restartY + btnHeight + btnMargin;

    this.restartButton = { x: btnX, y: restartY, width: btnWidth, height: btnHeight };
    this.menuButton = { x: btnX, y: menuY, width: btnWidth, height: btnHeight };

    const pointer = handTracker.getPointer();
    const hoveringRestart = pointer.visible && handTracker.isPointerInRect(this.restartButton);
    const hoveringMenu = pointer.visible && handTracker.isPointerInRect(this.menuButton);

    this.drawButton(this.restartButton, "RESTART", '#00FF00', hoveringRestart, 
                    hoveringRestart ? handTracker.getDwellProgress() : 0);
    this.drawButton(this.menuButton, "MENU", '#00FFFF', hoveringMenu, 
                    hoveringMenu ? handTracker.getDwellProgress() : 0);
  }

  /**
   * Draw game win screen
   */
  drawGameWin(player, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Overlay (green tint)
    ctx.fillStyle = 'rgba(0, 30, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Victory text
    ctx.font = "bold 64px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00FF00';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#00FF00';
    ctx.fillText("🏁 VICTORY! 🏁", canvas.width / 2, canvas.height / 2 - 120);
    ctx.shadowBlur = 0;

    // Congrats message
    ctx.font = "28px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFEB3B';
    ctx.fillText("You reached the finish line!", canvas.width / 2, canvas.height / 2 - 60);

    // Final score and distance
    ctx.font = "24px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Final Score: ${player.score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Distance: ${Math.floor(player.totalDistance)}m`, canvas.width / 2, canvas.height / 2 + 10);

    // Buttons
    const btnWidth = 300;
    const btnHeight = 70;
    const btnMargin = 20;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    const restartY = canvas.height / 2 + 60;
    const menuY = restartY + btnHeight + btnMargin;

    this.restartButton = { x: btnX, y: restartY, width: btnWidth, height: btnHeight };
    this.menuButton = { x: btnX, y: menuY, width: btnWidth, height: btnHeight };

    const pointer = handTracker.getPointer();
    const hoveringRestart = pointer.visible && handTracker.isPointerInRect(this.restartButton);
    const hoveringMenu = pointer.visible && handTracker.isPointerInRect(this.menuButton);

    this.drawButton(this.restartButton, "PLAY AGAIN", '#00FF00', hoveringRestart,
                    hoveringRestart ? handTracker.getDwellProgress() : 0);
    this.drawButton(this.menuButton, "MENU", '#00FFFF', hoveringMenu,
                    hoveringMenu ? handTracker.getDwellProgress() : 0);
  }

  // ========== VOLUME METER ==========

  /**
   * Draw volume meter (top right)
   */
  drawVolumeMeter(volumeLevel) {
    const ctx = this.ctx;
    const canvas = this.canvas;

    const meterWidth = 200;
    const meterHeight = 25;
    const meterX = canvas.width - meterWidth - 20;
    const meterY = 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    // Volume fill
    const fillWidth = meterWidth * volumeLevel;
    
    // Color based on volume
    if (volumeLevel < 0.3) {
      ctx.fillStyle = '#F44336'; // Red (too quiet)
    } else if (volumeLevel < 0.7) {
      ctx.fillStyle = '#FFEB3B'; // Yellow (good)
    } else {
      ctx.fillStyle = '#4CAF50'; // Green (loud)
    }
    
    ctx.fillRect(meterX, meterY, fillWidth, meterHeight);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // Label
    ctx.font = "14px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText("VOLUME", meterX - 5, meterY + 18);

    // Percentage
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(volumeLevel * 100)}%`, meterX + meterWidth / 2, meterY + 18);
  }

  // ========== POINTER & DWELL ==========

  /**
   * Draw hand pointer
   */
  drawPointer(pointer) {
    const ctx = this.ctx;

    // Outer circle (cyan glow)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle (bright)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Center dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw dwell indicator (progress circle saat shooting)
   */
  drawDwellIndicator(pointer, progress) {
    const ctx = this.ctx;
    const radius = 30;

    // Background circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, -Math.PI / 2, (-Math.PI / 2) + (progress * Math.PI * 2));
    ctx.stroke();
  }

  // ========== HELPER METHODS ==========

  /**
   * Draw button dengan hover effect dan dwell progress
   */
  drawButton(button, text, color, isHovering, dwellProgress) {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = 'rgba(20, 20, 50, 0.8)';
    ctx.fillRect(button.x, button.y, button.width, button.height);

    // Border with glow if hovering
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    if (isHovering) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }
    
    ctx.strokeRect(button.x, button.y, button.width, button.height);
    ctx.shadowBlur = 0;

    // Dwell progress fill
    if (isHovering && dwellProgress > 0) {
      const fillWidth = button.width * dwellProgress;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(button.x, button.y, fillWidth, button.height);
      ctx.globalAlpha = 1.0;
    }

    // Text
    ctx.font = "bold 24px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, button.x + button.width / 2, button.y + button.height / 2 + 8);
  }

  /**
   * Get start button bounds
   */
  getStartButton() {
    return this.startButton;
  }

  /**
   * Get restart button bounds
   */
  getRestartButton() {
    return this.restartButton;
  }

  /**
   * Get menu button bounds
   */
  getMenuButton() {
    return this.menuButton;
  }
}

/**
 * Draw mute button (standalone function)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {AudioManager} audioManager - Audio manager instance
 * @param {Object} pointer - Hand pointer {x, y, visible}
 * @param {number} canvasWidth - Canvas width
 * @param {number} dwellProgress - Dwell progress (0-1)
 * @returns {Object} - Button bounds {x, y, width, height}
 */
export function drawMuteButton(ctx, audioManager, pointer, canvasWidth, dwellProgress = 0) {
  const btnSize = 50;
  const btnX = canvasWidth - btnSize - 20;
  const btnY = 80; // Below volume meter
  
  // Check if hovering
  const isHovering = pointer.visible &&
    pointer.x >= btnX && pointer.x <= btnX + btnSize &&
    pointer.y >= btnY && pointer.y <= btnY + btnSize;
  
  // Draw button background
  ctx.fillStyle = isHovering ? 'rgba(70, 70, 70, 0.9)' : 'rgba(50, 50, 50, 0.8)';
  ctx.fillRect(btnX, btnY, btnSize, btnSize);
  
  // Draw border
  ctx.strokeStyle = isHovering ? '#FFD700' : '#00FFFF';
  ctx.lineWidth = 2;
  
  if (isHovering) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
  }
  
  ctx.strokeRect(btnX, btnY, btnSize, btnSize);
  ctx.shadowBlur = 0;
  
  // Dwell progress fill
  if (isHovering && dwellProgress > 0) {
    const fillWidth = btnSize * dwellProgress;
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(btnX, btnY, fillWidth, btnSize);
    ctx.globalAlpha = 1.0;
  }
  
  // Draw icon (speaker or mute symbol)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = audioManager.isMuted ? '🔇' : '🔊';
  ctx.fillText(icon, btnX + btnSize/2, btnY + btnSize/2);
  
  // Return button bounds for click detection
  return { x: btnX, y: btnY, width: btnSize, height: btnSize };
}
