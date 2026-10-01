# Mosaic Weight & Ripple Button

An interactive, physical UI button component that reacts to cursor leverage with 3D spring tilt, localized mosaic tile illumination, and expanding aquatic wave ripples.

![Component Preview](https://img.shields.io/badge/UI-Interactive%20Component-blue)
![Tech](https://img.shields.io/badge/Stack-Canvas%202D%20%2B%20CSS%203D-success)
![FPS](https://img.shields.io/badge/Performance-60%20FPS%20Locked-brightgreen)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero-orange)

---

## ✨ Features

- **Physical Cursor Mass & Leverage**: Simulates physical weight pressing down on the button surface. Calculates normalized mouse coordinates and applies continuous Euler angles (`rotateX`, `rotateY`) and Z-depression (`translateZ`) with damped harmonic spring physics.
- **Dynamic Mosaic Luminescence**: 500+ rounded square mosaic tiles rendered on a high-DPI HTML5 Canvas. Tiles near the cursor dynamically illuminate into sparkling sky-blue and cyan hues with per-block sensitivity variance.
- **Aquatic Water Ripple Shockwave**: Clicking triggers an expanding circular wave pulse originating at the exact cursor position, illuminating the mosaic blocks with a soft light wave.
- **Web Audio Aquatic Haptics**: Built-in procedural water droplet audio synthesizer generated via the Web Audio API.
- **Zero Dependencies**: Pure HTML, Vanilla CSS, and Canvas 2D. No Tailwind, no React/Vue required (easily portable into any framework).
- **Lightweight & High-Performance**: Hardware-accelerated canvas rasterization locked at 60 FPS with near-zero CPU usage.

---

## 🚀 Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/mosaic-weight-button.git
   cd mosaic-weight-button
   ```

2. Open `index.html` directly in your browser, or serve it with any local static server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```

---

## 📦 How to Integrate into Any Project

### 1. HTML
```html
<div class="button-perspective-wrapper">
  <button class="mosaic-btn" id="mosaicBtn" aria-label="Get started">
    <canvas class="mosaic-canvas" id="mosaicCanvas"></canvas>
    <span class="btn-content">
      <span class="btn-text">Get started</span>
    </span>
    <div class="specular-highlight"></div>
  </button>
</div>
```

### 2. CSS
Include `style.css` (or copy the `.button-perspective-wrapper`, `.mosaic-btn`, and `.mosaic-canvas` styles into your project).

### 3. JavaScript
```javascript
import { MosaicButton } from './mosaic-button.js';

const buttonElement = document.getElementById('mosaicBtn');
const button = new MosaicButton(buttonElement);
```

---

## ⚙️ Customization Options

You can configure the button's physics and visual parameters:

```javascript
const button = new MosaicButton(buttonElement);

// Adjust parameters:
button.params.weightForce = 1.0;     // Multiplier for cursor tilt & depression
button.params.maxTilt = 7.5;         // Max tilt angle (degrees)
button.params.maxDepress = 5.0;      // Max push-back depth (px)
button.params.tileSize = 5.5;        // Size of individual mosaic blocks (px)
button.params.gap = 1.0;             // Gap between blocks (px)
button.params.cursorLightRadius = 85;// Proximity glow radius (px)
button.params.rippleSpeed = 1.1;     // Speed of expanding water wave
button.params.soundEnabled = true;   // Web Audio droplet haptics
button.params.shimmerEnabled = true; // Ambient idle shimmer
```

---

## 📄 License

MIT License. Free to use in personal and commercial projects.
