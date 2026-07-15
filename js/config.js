/**
 * Game Configuration & Constants
 * Semua konstanta game disimpan di sini untuk memudahkan tuning
 */

export const CONFIG = {
  CANVAS: {
    WIDTH: 1280,
    HEIGHT: 720
  },
  PLAYER: {
    START_X: 100,
    START_Y: 360,
    WIDTH: 160,  // Updated for sprite size
    HEIGHT: 160, // Square ratio for sprite
    MAX_HEALTH: 100,
    SPEED_MULTIPLIER: 3 // multiply dengan volume level
  },
  ENEMY: {
    SPAWN_INTERVAL: 800, // PRESERVED: Faster spawn for challenge (0.8s)
    ENEMIES_PER_WAVE: 3, // PRESERVED: More enemies per wave
    SPEED: 1.5,
    WIDTH: 120,  // Updated for sprite size
    HEIGHT: 120, // Square ratio for sprite
    HEALTH: 50   // Base health (Yellow type)
  },
  BULLET: {
    SPEED: 8,
    DAMAGE: 25,
    WIDTH: 8,
    HEIGHT: 8,
    FIRE_RATE: 300 // ms cooldown
  },
  AUDIO: {
    VOLUME_THRESHOLD: 0.03, // minimum volume untuk gerak (lebih sensitive)
    SMOOTHING: 0.7 // Faster response
  },
  HAND: {
    DWELL_TIME: 0.3 // detik untuk shoot (tahan pointer)
  },
  GAME: {
    FINISH_DISTANCE: 2000, // Total distance to win (pixels/meters)
    BACKGROUND_SCROLL_SPEED: 2 // Background scroll rate
  }
};
