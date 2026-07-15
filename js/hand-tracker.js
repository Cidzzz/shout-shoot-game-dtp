/**
 * Hand Tracker - MediaPipe Hands Integration
 * Adapted dari glider-contoh-awal
 */

import { CONFIG } from './config.js';

export class HandTracker {
  constructor(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.hands = null;
    this.camera = null;
    this.isInitialized = false;
    
    // Hand pointer state
    this.pointer = {
      x: 0,
      y: 0,
      visible: false
    };

    // Dwell-to-click state
    this.dwellTimer = 0;
    this.dwellTime = CONFIG.HAND.DWELL_TIME;
    this.isDwelling = false;
    this.lastDwellTarget = null;
  }

  /**
   * Initialize MediaPipe Hands dan Camera
   * @returns {Promise<boolean>}
   */
  async init() {
    try {
      // Initialize MediaPipe Hands
      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Set callback untuk hasil deteksi
      this.hands.onResults((results) => this.onResults(results));

      // Initialize Camera
      this.camera = new window.Camera(this.videoElement, {
        onFrame: async () => {
          await this.hands.send({ image: this.videoElement });
        },
        width: 640,
        height: 480
      });

      // Start camera
      await this.camera.start();

      this.isInitialized = true;
      console.log('HandTracker initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize HandTracker:', error);
      alert('Gagal memulai kamera. Pastikan izin kamera telah diberikan.');
      return false;
    }
  }

  /**
   * Callback saat MediaPipe mendeteksi tangan
   * Adapted dari pointer-modes.js
   */
  onResults(results) {
    this.pointer.visible = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8]; // Ujung jari telunjuk

      if (indexFingerTip) {
        this.pointer.visible = true;
        // Mirror X coordinate (flip horizontal)
        this.pointer.x = (1.0 - indexFingerTip.x) * this.canvasElement.width;
        this.pointer.y = indexFingerTip.y * this.canvasElement.height;
      }
    }
  }

  /**
   * Update dwell timer untuk dwell-to-click
   * @param {number} deltaTime - Time since last frame (seconds)
   * @param {Object} target - Target object being dwelled on (optional)
   * @returns {boolean} - true if click triggered
   */
  updateDwell(deltaTime, target = null) {
    if (!this.pointer.visible) {
      this.dwellTimer = 0;
      this.isDwelling = false;
      this.lastDwellTarget = null;
      return false;
    }

    // Check if we're dwelling on the same target
    if (target !== null && target === this.lastDwellTarget) {
      this.dwellTimer += deltaTime;
      this.isDwelling = true;

      // Check if dwell time reached
      if (this.dwellTimer >= this.dwellTime) {
        this.dwellTimer = 0;
        this.isDwelling = false;
        this.lastDwellTarget = null;
        return true; // Click triggered!
      }
    } else {
      // Reset if target changed or no target
      this.dwellTimer = 0;
      this.isDwelling = false;
      this.lastDwellTarget = target;
    }

    return false;
  }

  /**
   * Get dwell progress (0-1) untuk visualisasi
   * @returns {number}
   */
  getDwellProgress() {
    return Math.min(this.dwellTimer / this.dwellTime, 1);
  }

  /**
   * Check if pointer is inside a rectangle
   * @param {Object} rect - {x, y, width, height}
   * @returns {boolean}
   */
  isPointerInRect(rect) {
    if (!this.pointer.visible) return false;
    
    return (
      this.pointer.x >= rect.x &&
      this.pointer.x <= rect.x + rect.width &&
      this.pointer.y >= rect.y &&
      this.pointer.y <= rect.y + rect.height
    );
  }

  /**
   * Get current pointer position
   * @returns {Object} - {x, y, visible}
   */
  getPointer() {
    return { ...this.pointer };
  }

  /**
   * Reset dwell timer manually
   */
  resetDwell() {
    this.dwellTimer = 0;
    this.isDwelling = false;
    this.lastDwellTarget = null;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.camera) {
      this.camera.stop();
    }
    this.isInitialized = false;
  }
}
