# Side B — 3D WebGL CD Jewel Case Viewer & Audio Player

A high-fidelity 3D WebGL CD jewel case interactive audio player built with Three.js shaders and vanilla JavaScript. Features realistic physical plastic refraction, dynamic iridescent rainbow CD reflections, rotational drag physics with inertia, and a synchronized minimal audio player.

---

## Features

- **3D Jewel Case Physics & Refraction**: Physically modeled clear acrylic CD case with realistic light transmission, Fresnel rim lighting, and shadow casting.
- **Iridescent Disc Shader**: Custom diffraction grating shader producing realistic rainbow reflections across the disc surface that animate as the disc spins or turns.
- **Dynamic Case Opening**: Click the case lid or press `O` to swing the jewel case open with realistic hinge constraints.
- **Disc Rotation**: Toggle spinning with `S` or via the dock controls.
- **17 Curated Audio Tracks**: Synchronized with high-resolution artwork, narrative notes, quotes, scrub bar, and live track timing.
- **Dock Thumbnail Rail**: Interactive glassmorphic carousel showing all 17 albums with tilt angles and playing progress bars.
- **Responsive Architecture**: Smooth touch interactions on mobile devices with iOS safe area handling.

---

## Controls

| Action | Control |
| :--- | :--- |
| **Rotate 3D Case** | Drag / Swipe on the stage with mouse or touch |
| **Open / Close Case** | Click the case lid, click the **Open** button, or press `O` |
| **Spin Disc** | Click the **Spin** button or press `S` |
| **Play / Pause Audio** | Spacebar, Player Play button, or Dock Pause button |
| **Previous / Next Track** | Left Arrow (`←`) / Right Arrow (`→`) |
| **Seek Audio** | Click anywhere on the minimal player progress line |
| **Select Track** | Click any thumbnail on the bottom dock rail |

---

## Project Structure

```
cd audio/
├── index.html              # Clean semantic HTML entry point
├── css/
│   └── style.css           # Glassmorphic dock, typography & responsive layouts
├── js/
│   ├── three.bundle.js     # Three.js Core & WebGLRenderer bundle
│   ├── cd-engine.js        # 3D CD Jewel Case WebGL engine & shaders
│   ├── data.js             # 17-track dataset with artwork & audio references
│   └── app.js              # HUD controller, audio playback & keyboard shortcuts
├── songs/                  # 17 MP3 audio files & cover photography
├── dist/                   # Production-ready distribution build
├── package.json            # Development & serving scripts
└── README.md
```

---

## Quick Start

Run with any local static HTTP server:

```bash
# Using Node built-in script
node test_server.cjs

# Or using npx serve
npx serve .
```

Then navigate to `http://localhost:3000` in any modern web browser.
