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

// Timing
let lastTime = 0;
let enemySpawnTimer = 0;
let lastShootTime = 0;

// ========== INITIALIZATION ==========

/**
 * Initialize game
 */
async function init() {
  console.log('Initializing Shout & Shoot...');

  // Get DOM elements
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  videoElement = document.getElementById('webcam-stream');

  // Setup canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize state manager
  stateManager = new StateManager();

  // Initialize UI
  ui = new UI(canvas, ctx);

  // Initialize audio manager
  audioManager = new AudioManager();
  audioManager.playMenuMusic(); // Start menu music

  // Initialize audio detector
  audioDetector = new AudioDetector();
  const audioInit = await audioDetector.init();
  if (!audioInit) {
    console.error('Failed to initialize audio');
    return;
  }

  // Initialize hand tracker
  handTracker = new HandTracker(videoElement, canvas);
  const handInit = await handTracker.init();
  if (!handInit) {
    console.error('Failed to initialize hand tracker');
    return;
  }

  // Load background image
  backgroundImage = new Image();
  backgroundImage.src = 'assets/sprites/Background.png';

  // Initialize player
  player = new Player(CONFIG.PLAYER.START_X, CONFIG.PLAYER.START_Y);

  console.log('Initialization complete!');

  // Start game loop
  requestAnimationFrame(gameLoop);
}

/**
 * Resize canvas to maintain aspect ratio
 */
function resizeCanvas() {
  const aspectRatio = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;
  const windowRatio = window.innerWidth / window.innerHeight;

  if (windowRatio > aspectRatio) {
    // Window wider than canvas
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * aspectRatio;
  } else {
    // Window taller than canvas
    canvas.width = window.innerWidth;
    canvas.height = canvas.width / aspectRatio;
  }
}

// ========== GAME LOOP ==========

/**
 * Main game loop
 */
function gameLoop(timestamp) {
  // Calculate delta time
  const deltaTime = (timestamp - lastTime) / 1000 || 0;
  lastTime = timestamp;

  // Clear canvas
  ctx.fillStyle = '#000022';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update & render based on state
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

  // Always draw hand pointer
  const pointer = handTracker.getPointer();
  if (pointer.visible) {
    ui.drawPointer(pointer);
  }

  // Always draw volume meter
  const volumeLevel = audioDetector.getVolumeLevel();
  ui.drawVolumeMeter(volumeLevel);

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// ========== UPDATE LOGIC ==========

/**
 * Update menu state
 */
function updateMenu(deltaTime) {
  const pointer = handTracker.getPointer();
  
  // Check if hovering over start button
  const startButton = ui.getStartButton();
  const isHovering = handTracker.isPointerInRect(startButton);
  
  // Update dwell timer
  const clicked = handTracker.updateDwell(deltaTime, isHovering ? 'start' : null);
  
  if (clicked && isHovering) {
    startGame();
  }
}

/**
 * Start game
 */
function startGame() {
  console.log('Starting game...');
  stateManager.changeState(GameState.PLAYING);
  audioManager.playGameplayMusic(); // Start gameplay music
  
  // Reset game state
  player.reset();
  enemies = [];
  bullets = [];
  enemySpawnTimer = 0;
  lastShootTime = 0;
  
  handTracker.resetDwell();
}

/**
 * Update game state
 */
function updateGame(deltaTime) {
  // Get volume level
  const volumeLevel = audioDetector.getVolumeLevel();
  
  // Update player
  player.update(volumeLevel, deltaTime, canvas.width);
  
  // NEW: Check for finish line (win condition)
  if (player.totalDistance >= CONFIG.GAME.FINISH_DISTANCE) {
    gameWin();
    return;
  }

  // Spawn enemies
  enemySpawnTimer += deltaTime;
  if (enemySpawnTimer >= CONFIG.ENEMY.SPAWN_INTERVAL / 1000) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);

    // Remove if off screen
    if (enemy.isOffScreen()) {
      enemies.splice(i, 1);
      continue;
    }

    // Check if reached player
    if (enemy.hasReachedPlayer(player.x)) {
      const died = player.takeDamage(10);
      enemies.splice(i, 1);
      
      if (died) {
        gameOver();
      }
    }
  }

  // Handle mute button
  handleMuteButton(deltaTime);

  // Handle shooting
  handleShooting(deltaTime);

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update(deltaTime, canvas.width, canvas.height);

    if (!bullet.isActive) {
      bullets.splice(i, 1);
      continue;
    }

    // Check collision with enemies
    checkBulletEnemyCollisions(bullet, i);
  }
}

/**
 * Spawn new enemies (multiple per wave)
 */
function spawnEnemy() {
  const enemiesPerWave = CONFIG.ENEMY.ENEMIES_PER_WAVE || 1;
  const spacing = 80; // Vertical spacing between enemies
  
  for (let i = 0; i < enemiesPerWave; i++) {
    const x = canvas.width + 50 + (i * 60); // Horizontal stagger
    const baseY = Math.random() * (canvas.height - CONFIG.ENEMY.HEIGHT - (spacing * enemiesPerWave));
    const y = baseY + (i * spacing); // Vertical offset
    const enemy = new Enemy(x, y);
    enemies.push(enemy);
  }
}

/**
 * Handle shooting with dwell-to-click
 */
function handleShooting(deltaTime) {
  const pointer = handTracker.getPointer();
  if (!pointer.visible) {
    handTracker.resetDwell();
    return;
  }

  // Check fire rate cooldown
  const currentTime = Date.now();
  if (currentTime - lastShootTime < CONFIG.BULLET.FIRE_RATE) {
    return;
  }

  // Update dwell for shooting
  const clicked = handTracker.updateDwell(deltaTime, 'shoot');
  
  if (clicked) {
    shoot(pointer.x, pointer.y);
    lastShootTime = currentTime;
  }
}

/**
 * Handle mute button with dwell-to-click
 */
function handleMuteButton(deltaTime) {
  const pointer = handTracker.getPointer();
  if (!pointer.visible) {
    handTracker.resetDwell();
    return;
  }

  // Mute button bounds (same as in drawMuteButton)
  const btnSize = 50;
  const btnX = canvas.width - btnSize - 20;
  const btnY = 80;
  
  // Check if pointer is over mute button
  const isOverButton = pointer.x >= btnX && pointer.x <= btnX + btnSize &&
                       pointer.y >= btnY && pointer.y <= btnY + btnSize;
  
  if (!isOverButton) {
    return; // Don't reset dwell, let shooting handle it
  }
  
  // Update dwell for mute button
  const clicked = handTracker.updateDwell(deltaTime, 'mute');
  
  if (clicked) {
    audioManager.toggleMute();
  }
}

/**
 * Shoot bullet towards target
 */
function shoot(targetX, targetY) {
  const playerCenter = player.getCenter();
  const bullet = new Bullet(playerCenter.x, playerCenter.y, targetX, targetY);
  bullets.push(bullet);
  audioManager.playSound('shoot'); // Play shoot sound
}

/**
 * Check bullet-enemy collisions
 */
function checkBulletEnemyCollisions(bullet, bulletIndex) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    
    if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
      // Bullet hit enemy
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

/**
 * Game over
 */
function gameOver() {
  console.log('Game Over! Score:', player.score);
  audioManager.stopAllMusic();
  audioManager.playSound('gameOver'); // Play game over sound
  stateManager.changeState(GameState.GAME_OVER);
  handTracker.resetDwell();
}

/**
 * Game win (reached finish line)
 */
function gameWin() {
  console.log('YOU WIN! Score:', player.score, 'Distance:', player.totalDistance);
  audioManager.stopAllMusic(); // Stop gameplay music on win
  stateManager.changeState(GameState.GAME_WIN);
  handTracker.resetDwell();
}

/**
 * Update game over state
 */
function updateGameOver(deltaTime) {
  // Check restart button
  const restartButton = ui.getRestartButton();
  const menuButton = ui.getMenuButton();
  
  const pointer = handTracker.getPointer();
  const hoveringRestart = handTracker.isPointerInRect(restartButton);
  const hoveringMenu = handTracker.isPointerInRect(menuButton);
  
  let target = null;
  if (hoveringRestart) target = 'restart';
  else if (hoveringMenu) target = 'menu';
  
  const clicked = handTracker.updateDwell(deltaTime, target);
  
  if (clicked) {
    if (hoveringRestart) {
      startGame();
    } else if (hoveringMenu) {
      stateManager.changeState(GameState.MENU);
      audioManager.playMenuMusic();
      handTracker.resetDwell();
    }
  }
}

/**
 * Update game win state
 */
function updateGameWin(deltaTime) {
  // Check restart button
  const restartButton = ui.getRestartButton();
  const menuButton = ui.getMenuButton();
  
  const pointer = handTracker.getPointer();
  const hoveringRestart = handTracker.isPointerInRect(restartButton);
  const hoveringMenu = handTracker.isPointerInRect(menuButton);
  
  let target = null;
  if (hoveringRestart) target = 'restart';
  else if (hoveringMenu) target = 'menu';
  
  const clicked = handTracker.updateDwell(deltaTime, target);
  
  if (clicked) {
    if (hoveringRestart) {
      startGame();
    } else if (hoveringMenu) {
      stateManager.changeState(GameState.MENU);
      audioManager.playMenuMusic();
      handTracker.resetDwell();
    }
  }
}

/**
 * Render game (playing state)
 */
function renderGame() {
  // Draw background image (fallback to gradient)
  if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#001133');
    gradient.addColorStop(1, '#000022');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw player
  player.draw(ctx);

  // Draw enemies
  for (const enemy of enemies) {
    enemy.draw(ctx);
  }

  // Draw bullets
  for (const bullet of bullets) {
    bullet.draw(ctx);
  }

  // Draw UI (HUD)
  ui.drawHUD(player);
  
  // NEW: Draw progress bar
  ui.drawProgressBar(player, canvas);

  // Draw mute button
  const pointer = handTracker.getPointer();
  const dwellProgress = handTracker.getDwellProgress();
  drawMuteButton(ctx, audioManager, pointer, canvas.width, dwellProgress);

  // Draw dwell indicator if shooting
  if (pointer.visible && handTracker.isDwelling) {
    ui.drawDwellIndicator(pointer, handTracker.getDwellProgress());
  }
}

// ========== START GAME ==========

// Start when DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
