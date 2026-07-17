/**
 * UI Module
 * Handles all UI rendering (menu, HUD, game over, etc.)
 */

import { CONFIG } from './config.js';

export class UI {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.startButton = { x: 0, y: 0, width: 300, height: 70 };
    this.restartButton = { x: 0, y: 0, width: 300, height: 70 };
    this.menuButton = { x: 0, y: 0, width: 300, height: 70 };
  }

  // ========== MENU ==========

  drawMenu(stateManager, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;
    ctx.font = "bold 72px 'Orbitron', sans-serif";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("SHOUT & SHOOT", canvas.width / 2, canvas.height / 2 - 120);
    ctx.shadowBlur = 0;
    ctx.font = "24px 'Orbitron', sans-serif";
    ctx.fillStyle = '#00FFFF';
    ctx.fillText("Voice + Hand Control Game", canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = "18px 'Orbitron', sans-serif";
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText("TERIAK Untuk Mundur", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("ARAHKAN TANGAN Untuk Menembak", canvas.width / 2, canvas.height / 2 + 5);

    const btnWidth = 300;
    const btnHeight = 70;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    const btnY = canvas.height / 2 + 50;

    this.startButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    const pointer = handTracker.getPointer();
    const isHovering = pointer.visible && handTracker.isPointerInRect(this.startButton);
    this.drawButton(this.startButton, "START GAME", '#00FF00', isHovering, handTracker.getDwellProgress());
  }

  // ========== HUD (PIXEL STYLE) ==========

  drawHUD(player) {
    const ctx = this.ctx;
    const x = 30;
    const y = 30;
    const segments = 10;
    const healthPercent = player.getHealthPercentage();
    const activeSegments = Math.ceil(healthPercent * segments);

    // Ikon Hati Pixel
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 2, y + 2, 4, 4);
    ctx.fillRect(x + 8, y + 2, 4, 4);
    ctx.fillRect(x, y + 6, 16, 4);
    ctx.fillRect(x + 4, y + 10, 8, 4);
    ctx.fillRect(x + 8, y + 14, 4, 4);

    // Bar Health Pixel
    const barStartX = x + 24;
    const barY = y + 2;
    const segWidth = 16;
    const segHeight = 16;
    const gap = 4;

    ctx.fillStyle = '#222';
    for (let i = 0; i < segments; i++) {
        ctx.fillRect(barStartX + (i * (segWidth + gap)), barY, segWidth, segHeight);
    }
    for (let i = 0; i < activeSegments; i++) {
      ctx.fillStyle = '#FF0000'; 
      ctx.fillRect(barStartX + (i * (segWidth + gap)) + 2, barY + 2, segWidth - 4, segHeight - 4);
    }
// ========== HUD (PIXEL & ARCADE STYLE) ==========

  // ... (pastikan fungsi drawHUD kamu sebelumnya tetap ada, bagian bawahnya ganti dengan ini)

    // Score Arcade (Pixel style)
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFF00';
    ctx.shadowBlur = 0; // Hapus blur agar teks tajam (pixelated)
    ctx.fillText(`SCORE:${player.score}`, this.canvas.width / 2, 60);
  }

  // ========== PROGRESS BAR (ARCADE STYLE) ==========

  drawProgressBar(player, canvas) {
    const ctx = this.ctx;
    const barWidth = 400;
    const barHeight = 30;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 80; // Sedikit di bawah score
    
    const progress = Math.min(player.totalDistance / CONFIG.GAME.FINISH_DISTANCE, 1);
    const fillWidth = barWidth * progress;

    // Background Bar (Solid, bukan transparan)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fill Progress (Solid Green, bukan gradient)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Border (Cyan Arcade - Tebal)
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Teks di tengah (Font pixel)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "10px 'Press Start 2P', cursive";
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(player.totalDistance)}m/${CONFIG.GAME.FINISH_DISTANCE}m`, canvas.width / 2, barY + 20);
  }

  // ========== VOLUME METER (ARCADE STYLE) ==========

  drawVolumeMeter(volumeLevel) {
    const ctx = this.ctx;
    const segments = 10;
    const activeSegments = Math.ceil(volumeLevel * segments);
    const segWidth = 16;
    const segHeight = 16;
    const gap = 4;
    const meterX = this.canvas.width - (segments * (segWidth + gap)) - 20;
    const meterY = 20;

    ctx.font = "14px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText("VOLUME", meterX - 10, meterY + 14);

    for (let i = 0; i < segments; i++) {
      const segX = meterX + (i * (segWidth + gap));
      let color = '#555';
      if (i < activeSegments) {
        if (volumeLevel < 0.4) color = '#F44336';
        else if (volumeLevel < 0.7) color = '#FFEB3B';
        else color = '#4CAF50';
      }
      ctx.fillStyle = color;
      ctx.fillRect(segX, meterY, segWidth, segHeight);
    }
  }

  // ========== OTHERS ==========

drawGameOver(player, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // 1. Efek Background Scanlines (Garis-garis layar)
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i = 0; i < canvas.height; i += 4) {
      ctx.fillRect(0, i, canvas.width, 2);
    }

    // 2. Teks "GAME OVER" dengan efek Glitch sederhana
    ctx.textAlign = 'center';
    const shake = Math.sin(Date.now() / 50) * 2; // Efek bergetar
    
    // Bayangan merah/cyan untuk efek glitch
    ctx.font = "bold 60px 'Press Start 2P', cursive";
    ctx.fillStyle = '#FF0000';
    ctx.fillText("GAME OVER", canvas.width / 2 + shake, canvas.height / 2 - 100);
    ctx.fillStyle = '#00FFFF';
    ctx.fillText("GAME OVER", canvas.width / 2 - shake, canvas.height / 2 - 100);

    // 3. Final Score
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`FINAL SCORE: ${player.score}`, canvas.width / 2, canvas.height / 2 - 30);

    // 4. Tombol dengan gaya yang sama
    const btnWidth = 300;
    const btnHeight = 60;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    
    this.restartButton = { x: btnX, y: canvas.height / 2 + 30, width: btnWidth, height: btnHeight };
    this.menuButton = { x: btnX, y: canvas.height / 2 + 110, width: btnWidth, height: btnHeight };

    this.drawButton(this.restartButton, "RESTART", '#00FF00', handTracker.isPointerInRect(this.restartButton), handTracker.getDwellProgress());
    this.drawButton(this.menuButton, "MENU", '#00FFFF', handTracker.isPointerInRect(this.menuButton), handTracker.getDwellProgress());
  }

drawGameWin(player, handTracker, deltaTime) {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // 1. Background (Dark Green Arcade)
    ctx.fillStyle = '#051005'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efek Scanlines untuk konsistensi retro
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for(let i = 0; i < canvas.height; i += 4) ctx.fillRect(0, i, canvas.width, 2);

    // 2. Fungsi helper checkerboard
    const drawCheckerboard = (x, y) => {
      const size = 20; // Dibuat sedikit lebih besar agar terlihat jelas
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? '#FFFFFF' : '#333333';
          ctx.fillRect(x + i * size, y + j * size, size, size);
        }
      }
    };

    // 3. Teks VICTORY!
    ctx.font = "40px 'Press Start 2P', cursive";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FF00';
    const textY = canvas.height / 2 - 120; // Geser sedikit ke atas
    ctx.fillText("VICTORY!", canvas.width / 2, textY);

    // 4. Final Score (Ditambahkan di sini agar tidak kosong)
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`FINAL SCORE: ${player.score}`, canvas.width / 2, textY + 50);

    // Gambar checkerboard
    drawCheckerboard(canvas.width / 2 - 220, textY - 35);
    drawCheckerboard(canvas.width / 2 + 190, textY - 35);

    // 5. Tombol (Gunakan helper action buttons agar rapi)
    // Jika fungsi drawActionButtons ada, gunakan itu. Jika tidak, pakai cara manual ini:
    const btnWidth = 320;
    const btnHeight = 65;
    const btnX = (canvas.width / 2) - (btnWidth / 2);
    
    this.restartButton = { x: btnX, y: canvas.height / 2 + 20, width: btnWidth, height: btnHeight };
    this.menuButton = { x: btnX, y: canvas.height / 2 + 110, width: btnWidth, height: btnHeight };

    this.drawButton(this.restartButton, "PLAY AGAIN", '#00FF00', handTracker.isPointerInRect(this.restartButton), handTracker.getDwellProgress());
    this.drawButton(this.menuButton, "MENU", '#00FFFF', handTracker.isPointerInRect(this.menuButton), handTracker.getDwellProgress());
  }
  drawPointer(pointer) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 3, 0, Math.PI * 2); ctx.fill();
  }

  drawDwellIndicator(pointer, progress) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 30, -Math.PI / 2, (-Math.PI / 2) + (progress * Math.PI * 2));
    ctx.stroke();
  }

  drawButton(button, text, color, isHovering, dwellProgress) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(20, 20, 50, 0.8)';
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (isHovering) { ctx.shadowColor = color; ctx.shadowBlur = 15; }
    ctx.strokeRect(button.x, button.y, button.width, button.height);
    ctx.shadowBlur = 0;
    if (isHovering && dwellProgress > 0) {
      ctx.fillStyle = color; ctx.globalAlpha = 0.3;
      ctx.fillRect(button.x, button.y, button.width * dwellProgress, button.height);
      ctx.globalAlpha = 1.0;
    }
    ctx.font = "bold 24px 'Orbitron', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(text, button.x + button.width / 2, button.y + button.height / 2 + 8);
  }

  getStartButton() { return this.startButton; }
  getRestartButton() { return this.restartButton; }
  getMenuButton() { return this.menuButton; }
}

export function drawMuteButton(ctx, audioManager, pointer, canvasWidth, dwellProgress = 0) {
  const btnSize = 50, btnX = canvasWidth - btnSize - 20, btnY = 80;
  const isHovering = pointer.visible && pointer.x >= btnX && pointer.x <= btnX + btnSize && pointer.y >= btnY && pointer.y <= btnY + btnSize;
  ctx.fillStyle = isHovering ? 'rgba(70, 70, 70, 0.9)' : 'rgba(50, 50, 50, 0.8)';
  ctx.fillRect(btnX, btnY, btnSize, btnSize);
  ctx.strokeStyle = isHovering ? '#FFD700' : '#00FFFF';
  ctx.strokeRect(btnX, btnY, btnSize, btnSize);
  if (isHovering && dwellProgress > 0) {
    ctx.fillStyle = '#FFD700'; ctx.globalAlpha = 0.3; ctx.fillRect(btnX, btnY, btnSize * dwellProgress, btnSize); ctx.globalAlpha = 1.0;
  }
  ctx.fillStyle = '#FFFFFF'; ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(audioManager.isMuted ? '🔇' : '🔊', btnX + btnSize/2, btnY + btnSize/2);
}