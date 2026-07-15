/**
 * Game State Machine
 * Mengelola state game (menu, playing, paused, game over)
 */

export const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  GAME_WIN: 'GAME_WIN'
};

export class StateManager {
  constructor() {
    this.currentState = GameState.MENU;
    this.previousState = null;
  }

  /**
   * Change game state
   * @param {string} newState - New state from GameState enum
   */
  changeState(newState) {
    this.previousState = this.currentState;
    this.currentState = newState;
    console.log(`State changed: ${this.previousState} -> ${this.currentState}`);
  }

  /**
   * Check if game is currently playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.currentState === GameState.PLAYING;
  }

  /**
   * Check if game is in menu
   * @returns {boolean}
   */
  isMenu() {
    return this.currentState === GameState.MENU;
  }

  /**
   * Check if game is over
   * @returns {boolean}
   */
  isGameOver() {
    return this.currentState === GameState.GAME_OVER;
  }

  /**
   * Check if game is paused
   * @returns {boolean}
   */
  isPaused() {
    return this.currentState === GameState.PAUSED;
  }
}
