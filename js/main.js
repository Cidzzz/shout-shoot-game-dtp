/**
 * Main Game Entry Point
 * Game loop, initialization, dan core game logic
 */

import { CONFIG } from './config.js';
import { AudioDetector } from './audio-detector.js';
import { HandTracker } from './hand-tracker.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { checkCollision } from './collision.js';
import { StateManager, GameState } from './state-manager.js';
import { UI, drawMuteButton } from './ui.js';
import { AudioManager } from './audio-manager.js';

// ========== GLOBAL VARIABLES ==========
let canvas, ctx;
let videoElement;
let audioDetector;
let handTracker;
let stateManager;
let ui;
let audioManager;

// Game objects
let player;
let enemies = [];
let bullets = [];
let backgroundImage;
let bgX = 0; 

// Timing
let lastTime = 0;
let enemySpawnTimer = 0;
let lastShootTime = 0;

// ========== INITIALIZATION ==========

async function init() {
  console.log('Initializing Shout & Shoot...');

  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  videoElement = document.getElementById('webcam-stream');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  stateManager = new StateManager();
  ui = new UI(canvas, ctx);

  audioManager = new AudioManager();
  audioManager.playMenuMusic(); 

  audioDetector = new AudioDetector();
  const audioInit = await audioDetector.init();
  if (!audioInit) {
    console.error('Failed to initialize audio');
    return;
  }

  handTracker = new HandTracker(videoElement, canvas);
  const handInit = await handTracker.init();
  if (!handInit) {
    console.error('Failed to initialize hand tracker');
    return;
  }

  backgroundImage = new Image();
  backgroundImage.src = 'Background.png';

  player = new Player(CONFIG.PLAYER.START_X, CONFIG.PLAYER.START_Y);
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ========== GAME LOOP ==========

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000 || 0;
  lastTime = timestamp;

  ctx.fillStyle = '#000022';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch (stateManager.currentState) {
    case GameState.MENU:
      updateMenu(deltaTime);
      ui.drawMenu(stateManager, handTracker, deltaTime);
      break;
    case GameState.PLAYING:
      updateGame(deltaTime);
      renderGame();
      break;
    case GameState.GAME_OVER:
      ui.drawGameOver(player, handTracker, deltaTime);
      updateGameOver(deltaTime);
      break;
    case GameState.GAME_WIN:
      ui.drawGameWin(player, handTracker, deltaTime);
      updateGameWin(deltaTime);
      break;
  }

  const pointer = handTracker.getPointer();
  if (pointer.visible) ui.drawPointer(pointer);
  ui.drawVolumeMeter(audioDetector.getVolumeLevel());

  requestAnimationFrame(gameLoop);
}

// ========== UPDATE LOGIC ==========

function updateMenu(deltaTime) {
  const pointer = handTracker.getPointer();
  const startButton = ui.getStartButton();
  const isHovering = handTracker.isPointerInRect(startButton);
  const clicked = handTracker.updateDwell(deltaTime, isHovering ? 'start' : null);
  
  if (clicked && isHovering) {
    startGame();
  }
}

function startGame() {
  stateManager.changeState(GameState.PLAYING);
  audioManager.playGameplayMusic();
  player.reset();
  enemies = [];
  bullets = [];
  enemySpawnTimer = 0;
  lastShootTime = 0;
  bgX = 0; 
  handTracker.resetDwell();
}

function updateGame(deltaTime) {
  const volumeLevel = audioDetector.getVolumeLevel();
  player.update(volumeLevel, deltaTime, canvas.width);
  
  if (player.totalDistance >= CONFIG.GAME.FINISH_DISTANCE) {
    gameWin();
    return;
  }

  enemySpawnTimer += deltaTime;
  const baseInterval = CONFIG.ENEMY.SPAWN_INTERVAL;
  const speedUpFactor = Math.floor(player.totalDistance / 500) * 200;
  const currentInterval = Math.max(1000, baseInterval - speedUpFactor);

  // Diperlambat dengan membagi 1000
  if (enemySpawnTimer >= currentInterval / 1000) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);
    if (enemy.isOffScreen()) { enemies.splice(i, 1); continue; }
    if (enemy.hasReachedPlayer(player.x)) {
      const died = player.takeDamage(10);
      enemies.splice(i, 1);
      if (died) gameOver();
    }
  }

  handleMuteButton(deltaTime);
  handleShooting(deltaTime);

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update(deltaTime, canvas.width, canvas.height);
    if (!bullet.isActive) { bullets.splice(i, 1); continue; }
    checkBulletEnemyCollisions(bullet, i);
  }
}

function spawnEnemy() {
  const initialCount = 1;
  const increment = 1;
  const stepDistance = 550;
  
  const extraEnemies = Math.floor(player.totalDistance / stepDistance) * increment;
  const enemiesPerWave = Math.min(initialCount + extraEnemies, 12); 

  const topMargin = 160; 
  
  for (let i = 0; i < enemiesPerWave; i++) {
    const staggerX = Math.random() * 200;
    const x = canvas.width + 50 + staggerX; 
    const availableHeight = canvas.height - topMargin - CONFIG.ENEMY.HEIGHT;
    const y = topMargin + (Math.random() * availableHeight);
    
    enemies.push(new Enemy(x, y));
  }
}

function handleShooting(deltaTime) {
  const pointer = handTracker.getPointer();
  if (!pointer.visible) {
    handTracker.resetDwell();
    player.setAim(player.x + 100, player.y + (player.height/2));
    return;
  }

  player.setAim(pointer.x, pointer.y);
  const currentTime = Date.now();
  if (currentTime - lastShootTime < CONFIG.BULLET.FIRE_RATE) return;

  const clicked = handTracker.updateDwell(deltaTime, 'shoot');
  if (clicked) {
    shoot(pointer.x, pointer.y);
    lastShootTime = currentTime;
  }
}

function handleMuteButton(deltaTime) {
  const pointer = handTracker.getPointer();
  if (!pointer.visible) return;
  const btnSize = 50, btnX = canvas.width - btnSize - 20, btnY = 80;
  const isOverButton = pointer.x >= btnX && pointer.x <= btnX + btnSize && pointer.y >= btnY && pointer.y <= btnY + btnSize;
  
  if (!isOverButton) return; 
  const clicked = handTracker.updateDwell(deltaTime, 'mute');
  if (clicked) audioManager.toggleMute();
}

function shoot(targetX, targetY) {
  const playerCenter = player.getCenter();
  bullets.push(new Bullet(playerCenter.x, playerCenter.y, targetX, targetY));
  audioManager.playSound('shoot'); 
}

function checkBulletEnemyCollisions(bullet, bulletIndex) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
      const score = enemy.takeDamage(bullet.damage);
      bullet.deactivate();
      if (score > 0) {
        player.addScore(score);
        enemies.splice(i, 1);
      }
      break;
    }
  }
}

function gameOver() {
  audioManager.stopAllMusic();
  audioManager.playSound('gameOver'); 
  stateManager.changeState(GameState.GAME_OVER);
  handTracker.resetDwell();
}

function gameWin() {
  audioManager.stopAllMusic(); 
  stateManager.changeState(GameState.GAME_WIN);
  handTracker.resetDwell();
}

function updateGameOver(deltaTime) {
  const restartButton = ui.getRestartButton();
  const menuButton = ui.getMenuButton();
  const hoverRestart = handTracker.isPointerInRect(restartButton);
  const hoverMenu = handTracker.isPointerInRect(menuButton);
  
  let target = null;
  if (hoverRestart) target = 'restart';
  else if (hoverMenu) target = 'menu';
  
  const clicked = handTracker.updateDwell(deltaTime, target);
  if (clicked) {
    if (hoverRestart) startGame();
    else if (hoverMenu) {
      stateManager.changeState(GameState.MENU);
      audioManager.playMenuMusic();
      handTracker.resetDwell();
    }
  }
}

function updateGameWin(deltaTime) {
  const restartButton = ui.getRestartButton();
  const menuButton = ui.getMenuButton();
  const hoverRestart = handTracker.isPointerInRect(restartButton);
  const hoverMenu = handTracker.isPointerInRect(menuButton);
  
  let target = null;
  if (hoverRestart) target = 'restart';
  else if (hoverMenu) target = 'menu';
  
  const clicked = handTracker.updateDwell(deltaTime, target);
  if (clicked) {
    if (hoverRestart) startGame();
    else if (hoverMenu) {
      stateManager.changeState(GameState.MENU);
      audioManager.playMenuMusic();
      handTracker.resetDwell();
    }
  }
}

function renderGame() {
  if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
    bgX -= CONFIG.GAME.BACKGROUND_SCROLL_SPEED || 2;
    if (bgX <= -canvas.width) bgX = 0;
    ctx.drawImage(backgroundImage, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, bgX + canvas.width, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  player.draw(ctx);
  for (const enemy of enemies) enemy.draw(ctx);
  for (const bullet of bullets) bullet.draw(ctx);

  ui.drawHUD(player);
  ui.drawProgressBar(player, canvas);

  const pointer = handTracker.getPointer();
  const dwellProgress = handTracker.getDwellProgress();
  if (typeof drawMuteButton === 'function') {
      drawMuteButton(ctx, audioManager, pointer, canvas.width, dwellProgress);
  }

  if (pointer.visible && handTracker.isDwelling && handTracker.dwellTarget === 'shoot') {
    ui.drawDwellIndicator(pointer, handTracker.getDwellProgress());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}