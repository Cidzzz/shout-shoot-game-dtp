# 🎮 Shout & Shoot

Game side-scrolling shooter inovatif dengan kontrol **voice** (volume suara) dan **hand gesture** (tracking tangan). Teriak untuk bergerak, arahkan tangan untuk menembak!

## 🌟 Features

- **Voice Control**: Auto-forward movement + shout to dodge enemies
- **Hand Tracking**: MediaPipe Hands untuk aiming & shooting
- **Dwell-to-Click**: Tahan pointer pada target untuk menembak
- **Real-time Audio Detection**: Web Audio API untuk volume detection
- **Responsive Design**: Canvas fullscreen dengan webcam preview
- **Real Game Assets**: Sprite graphics untuk player & 3 enemy types
- **Audio System**: Background music & sound effects with mute control

## 🎯 Game Objective

Capai finish line (2000m) sambil mengalahkan gelombang enemy! Auto-advance forward, teriak untuk dodge, dan tembak enemies dengan hand gestures.

## ⚙️ Requirements

- **Browser Modern**: Chrome, Edge, atau Opera (terbaik untuk MediaPipe)
- **Webcam**: Untuk hand tracking
- **Microphone**: Untuk voice control
- **Koneksi Internet**: Untuk load MediaPipe dari CDN

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Sangat Baik |
| Firefox | ⚠️ Terbatas (MediaPipe mungkin lambat) |
| Safari | ⚠️ Terbatas (memerlukan polyfill) |
| Opera | ✅ Baik |

## 🚀 Installation & Setup

### 1. Clone atau Download

```bash
cd /var/enginer/dtp/game/
```

### 2. Serve dengan Local Server

Game ini memerlukan server lokal karena menggunakan ES6 modules. Gunakan salah satu:

**Opsi A: Python**
```bash
python3 -m http.server 8000
```

**Opsi B: Node.js (http-server)**
```bash
npx http-server -p 8000
```

**Opsi C: VS Code Live Server Extension**
- Install extension "Live Server"
- Right-click pada `index.html` → "Open with Live Server"

### 3. Buka di Browser

```
http://localhost:8000/index.html
```

### 4. Berikan Izin

Browser akan meminta izin untuk:
- ✅ **Camera Access** (untuk hand tracking)
- ✅ **Microphone Access** (untuk voice control)

Klik "Allow" pada kedua permission request.

## 🎮 How to Play

### Main Menu
1. Tunggu loading selesai (MediaPipe & Audio initialization)
2. **Tahan pointer tangan** pada tombol "START GAME" sampai progress bar penuh
3. Game dimulai!

### During Game

#### Movement (Voice Control)
- **Auto-Forward**: Player terus maju otomatis ke kanan
- **Teriak/Bicara**: Player mundur ke kiri (dodge enemies!)
- **Diam**: Player terus maju forward
- Volume meter di pojok kanan atas menunjukkan input suara

#### Shooting (Hand Control)
- **Angkat tangan** di depan webcam (tangan kanan atau kiri)
- **Arahkan jari telunjuk** ke target enemy
- **Tahan posisi** pointer pada target selama ~0.3 detik
- Bullet akan otomatis ditembakkan!

#### Objectives
- 🎯 Tembak enemies sebelum mereka mencapai sisi kiri
- ❤️ Jaga health bar tetap penuh
- 🏆 Dapatkan score setinggi mungkin

### Game Over
- Game berakhir ketika health habis
- Tekan "RESTART" untuk main lagi
- Tekan "MENU" untuk kembali ke menu

## 🕹️ Controls Summary

| Input | Action |
|-------|--------|
| **Suara (Volume)** | Auto-forward + shout to dodge left |
| **Tangan (Pointer)** | Aiming untuk shooting |
| **Dwell (Tahan Pointer)** | Trigger shooting / mute button |
| **Mute Button** | Toggle audio on/off (top right) |

## 🎲 Game Mechanics

### Player
- **Health**: 100 HP
- **Speed**: Berdasarkan volume (louder = faster)
- **Damage**: Flash merah saat terkena enemy

### Enemies (3 Types)
- **Red Monster**: Fast & straight (30 HP, 1.3x speed, 10 points)
- **Yellow Monster**: Medium with wave pattern (50 HP, 0.9x speed, 20 points)
- **Blue Monster**: Slow tank (80 HP, 0.5x speed, 30 points)
- **Spawn**: Every 0.8 seconds, 3 enemies per wave
- **Damage**: 10 HP if reaching player

### Bullets
- **Damage**: 25 HP per bullet
- **Speed**: 8 pixels per frame
- **Direction**: Menuju posisi pointer saat ditembakkan

### Scoring
- **Enemy Killed**: +10 points

## 🛠️ Troubleshooting

### Kamera Tidak Terdeteksi
- ✅ Pastikan browser memiliki izin kamera
- ✅ Check apakah kamera tidak dipakai aplikasi lain
- ✅ Reload page dan berikan izin ulang

### Microphone Tidak Terdeteksi
- ✅ Pastikan browser memiliki izin microphone
- ✅ Check volume meter (pojok kanan atas) saat bicara
- ✅ Test microphone di system settings

### Hand Tracking Tidak Akurat
- ✅ Pastikan pencahayaan cukup baik
- ✅ Tangan harus terlihat jelas di webcam
- ✅ Jangan terlalu cepat menggerakkan tangan
- ✅ Gunakan jari telunjuk yang terangkat untuk pointer

### Game Lambat/Lag
- ✅ Tutup tab/aplikasi lain yang berat
- ✅ Gunakan Chrome/Edge untuk performa terbaik
- ✅ Kurangi complexity dengan close aplikasi background

### MediaPipe Gagal Load
- ✅ Pastikan ada koneksi internet (MediaPipe dari CDN)
- ✅ Check console browser (F12) untuk error
- ✅ Coba reload page

## 📁 File Structure

```
game/
├── index.html              # Entry point
├── style.css               # Styling
├── assets/
│   ├── sprites/           # Player & enemy sprites
│   │   ├── Player.png
│   │   ├── Red.png
│   │   ├── Yellow.png
│   │   ├── Blue.png
│   │   └── Background.png
│   └── audio/             # Sound effects & BGM
│       ├── Gameplay.mpeg
│       ├── Landing Page.mpeg
│       ├── Laser.mpeg
│       └── Game Over.mpeg
├── js/
│   ├── main.js            # Game loop & initialization
│   ├── audio-manager.js   # Audio system (NEW)
│   ├── audio-detector.js  # Web Audio API
│   ├── hand-tracker.js    # MediaPipe integration
│   ├── player.js          # Player class
│   ├── enemy.js           # Enemy class (3 types)
│   ├── bullet.js          # Bullet class
│   ├── collision.js       # Collision detection
│   ├── state-manager.js   # Game state machine
│   ├── ui.js              # UI rendering
│   └── config.js          # Game configuration
├── README.md              # This file
└── UPDATE_LOG.md          # Integration changelog (NEW)
```

## 🎨 Future Enhancements

**Completed (v2.0):**
- [x] Sprite graphics (Player + 3 enemy types + background)
- [x] Sound effects & background music (Laser, BGM, Game Over)
- [x] Multiple enemy types (Red, Yellow, Blue with different stats)

**Future Ideas:**
- [ ] Power-ups & special weapons
- [ ] Boss battles
- [ ] Leaderboard system
- [ ] Difficulty levels
- [ ] Pause functionality
- [ ] More audio variety (win sound, power-up sounds)

## 🙏 Credits

- **MediaPipe**: Google - Hand tracking
- **Font**: Orbitron (Google Fonts)
- **Inspirasi**: Glider Maze game

## 📄 License

Educational/Personal Use - MIT License

---

**Made with ❤️ using Voice + Hand Control Technology**

*Teriak, Arahkan, Tembak!* 🎯
