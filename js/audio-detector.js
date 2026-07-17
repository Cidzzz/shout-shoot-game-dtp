/**
 * Audio Detector - Web Audio API
 * Mendeteksi volume suara dari microphone untuk kontrol player
 */

export class AudioDetector {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.volumeLevel = 0; // 0-1
    this.isInitialized = false;
    this.smoothedVolume = 0;
    
    // Buffer untuk visualisasi
    this.frequencyData = null;
  }

  /**
   * Initialize audio context dan microphone
   * @returns {Promise<boolean>} - true jika berhasil
   */
  async init() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });

      // Setup AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create AnalyserNode
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // Ukuran FFT untuk analisis frekuensi
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect microphone stream
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Setup data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);

      this.isInitialized = true;
      console.log('AudioDetector initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize AudioDetector:', error);
      alert('Gagal mengakses microphone. Pastikan izin microphone telah diberikan.');
      return false;
    }
  }

  /**
   * Get current volume level (0-1)
   * Menggunakan RMS (Root Mean Square) calculation
   * @returns {number} - Volume level 0-1
   */
  getVolumeLevel() {
    if (!this.isInitialized || !this.analyser) {
      return 0;
    }

    // Get frequency data from analyser
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate RMS (Root Mean Square) volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128; // Normalize to -1 to 1
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);

    // Apply smoothing untuk mengurangi jitter
    const smoothingFactor = 0.8;
    this.smoothedVolume = (smoothingFactor * this.smoothedVolume) + ((1 - smoothingFactor) * rms);

    // Clamp antara 0-1
    this.volumeLevel = Math.min(Math.max(this.smoothedVolume, 0), 1);

    return this.volumeLevel;
  }

  /**
   * Get frequency data untuk visualisasi meter
   * @returns {Uint8Array} - Array frequency data (0-255)
   */
  getVisualData() {
    if (!this.isInitialized || !this.analyser) {
      return new Uint8Array(0);
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  /**
   * Check if volume is above threshold
   * @param {number} threshold - Minimum volume (0-1)
   * @returns {boolean}
   */
  isAboveThreshold(threshold) {
    return this.volumeLevel > threshold;
  }

  /**
   * Get volume as percentage string
   * @returns {string} - "XX%"
   */
  getVolumePercentage() {
    return `${Math.round(this.volumeLevel * 100)}%`;
  }

  /**
   * Cleanup audio resources
   */
  destroy() {
    if (this.microphone) {
      this.microphone.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}
