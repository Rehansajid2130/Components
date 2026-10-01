/**
 * Interactive Mosaic Ripple Button
 * - Dynamic Canvas-based Mosaic Block Matrix
 * - 3D Spring-Damper Physics (Cursor Weight & Tilt Pushback)
 * - Concentric White Water Ripple Wave Propagation
 * - Web Audio Aquatic Droplet Synthesizer
 */

class MosaicButton {
  constructor(btnElement) {
    this.btn = btnElement;
    this.canvas = this.btn.querySelector('.mosaic-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.btnContent = this.btn.querySelector('.btn-content');

    // Configuration / Parameters
    this.params = {
      tileSize: 5.5,
      gap: 1.0,
      cursorLightRadius: 85,
      weightForce: 1.0,
      maxTilt: 7.5,       // reduced: gentler, subtle 3D tilt
      maxDepress: 5.0,     // reduced: much subtler push-back depth
      rippleSpeed: 1.1,
      soundEnabled: true,
      shimmerEnabled: true
    };

    // State
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.tiles = [];
    this.ripples = [];
    
    // Mouse tracking & physics
    this.isHovered = false;
    this.isPressed = false;
    this.mouse = { x: -999, y: -999 };
    this.normMouse = { x: 0, y: 0 };
    
    // Spring physics states (current & target)
    this.physics = {
      rotX: 0,
      rotY: 0,
      transZ: 0,
      targetRotX: 0,
      targetRotY: 0,
      targetTransZ: 0,
      velRotX: 0,
      velRotY: 0,
      velTransZ: 0,
      stiffness: 0.18,
      damping: 0.78
    };

    // Audio context (initialized on first user interaction)
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.resize();
    this.initTiles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const rect = this.btn.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.initTiles();
  }

  initTiles() {
    this.tiles = [];
    const step = this.params.tileSize + this.params.gap;
    const cols = Math.ceil(this.width / step);
    const rows = Math.ceil(this.height / step);

    // Color palette matching the reference screenshot:
    // Rich royal blue with organic lightness jitter and light-receptivity variance
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * step;
        const y = r * step;

        // Base color variation
        const baseHue = 222 + (Math.random() * 8 - 4);       // 218 - 226
        const baseSat = 78 + (Math.random() * 12 - 6);       // 72 - 84%
        const baseLight = 44 + (Math.random() * 14 - 7);     // 37 - 51%
        const lightSensitivity = 0.75 + Math.random() * 0.5; // per-block reactivity for authentic mosaic sparkle
        const phase = Math.random() * Math.PI * 2;          // shimmer phase

        this.tiles.push({
          x,
          y,
          size: this.params.tileSize,
          baseHue,
          baseSat,
          baseLight,
          lightSensitivity,
          phase,
          activeFactor: 0 // 0 = idle, 1 = maximum proximity glow
        });
      }
    }
  }

  bindEvents() {
    // Resize observer for responsive bounds
    const resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    resizeObserver.observe(this.btn);

    // Mouse movement inside button
    this.btn.addEventListener('mousemove', (e) => {
      const rect = this.btn.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Normalized coordinates (-1 to 1) from button center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      this.normMouse.x = (this.mouse.x - centerX) / centerX;
      this.normMouse.y = (this.mouse.y - centerY) / centerY;

      // Cursor weight pushing down the button surface (subtler pushback)
      const force = this.params.weightForce;
      this.physics.targetRotY = this.normMouse.x * this.params.maxTilt * force;
      this.physics.targetRotX = -this.normMouse.y * this.params.maxTilt * force;

      // Subtle localized depression
      const distFromCenter = Math.hypot(this.normMouse.x, this.normMouse.y);
      this.physics.targetTransZ = -(1.5 + distFromCenter * this.params.maxDepress * 0.5) * force;
    });

    this.btn.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });

    this.btn.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.isPressed = false;
      this.mouse.x = -999;
      this.mouse.y = -999;
      this.normMouse.x = 0;
      this.normMouse.y = 0;

      // Return to resting physics
      this.physics.targetRotX = 0;
      this.physics.targetRotY = 0;
      this.physics.targetTransZ = 0;
    });

    // Mousedown - gentle extra push on press
    this.btn.addEventListener('mousedown', (e) => {
      this.isPressed = true;
      const rect = this.btn.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Gentle push-back on press
      this.physics.targetTransZ = -this.params.maxDepress * 1.1 * this.params.weightForce;

      // Trigger subtle ripple pulse
      this.triggerRipple(clickX, clickY);

      // Play gentle droplet sound
      if (this.params.soundEnabled) {
        this.playWaterDropSound();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPressed) {
        this.isPressed = false;
        if (this.isHovered) {
          this.physics.targetTransZ = -this.params.maxDepress * 0.4 * this.params.weightForce;
        } else {
          this.physics.targetTransZ = 0;
        }
      }
    });

    // Touch support for mobile devices
    this.btn.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.btn.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      this.mouse.x = touchX;
      this.mouse.y = touchY;
      this.isHovered = true;
      this.isPressed = true;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      this.normMouse.x = (touchX - centerX) / centerX;
      this.normMouse.y = (touchY - centerY) / centerY;

      const force = this.params.weightForce;
      this.physics.targetRotY = this.normMouse.x * this.params.maxTilt * force;
      this.physics.targetRotX = -this.normMouse.y * this.params.maxTilt * force;
      this.physics.targetTransZ = -this.params.maxDepress * 1.0 * force;

      this.triggerRipple(touchX, touchY);
      if (this.params.soundEnabled) {
        this.playWaterDropSound();
      }
    }, { passive: true });

    this.btn.addEventListener('touchend', () => {
      this.isHovered = false;
      this.isPressed = false;
      this.mouse.x = -999;
      this.mouse.y = -999;
      this.physics.targetRotX = 0;
      this.physics.targetRotY = 0;
      this.physics.targetTransZ = 0;
    });
  }

  triggerRipple(originX, originY) {
    const maxRadius = Math.hypot(
      Math.max(originX, this.width - originX),
      Math.max(originY, this.height - originY)
    ) + 20;

    this.ripples.push({
      x: originX,
      y: originY,
      radius: 0,
      maxRadius,
      speed: 3.4 * this.params.rippleSpeed,
      waveWidth: 18, // clean, sleeker wave width (less thick wave)
      intensity: 0.72, // reduced brightness intensity
      decay: 0.015 // dissipates cleanly
    });
  }

  playWaterDropSound() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Dual oscillator resonant water droplet synth
      const osc = this.audioCtx.createOscillator();
      const subOsc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sine';
      subOsc.type = 'sine';

      // Aquatic "bloop" pitch upward sweep then subtle fall
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.22);

      subOsc.frequency.setValueAtTime(240, now);
      subOsc.frequency.exponentialRampToValueAtTime(550, now + 0.07);

      // Lowpass filter for smooth glassy aquatic timbre
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);

      // Volume envelope
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(this.audioCtx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.3);
      subOsc.stop(now + 0.3);
    } catch {
      // Audio not supported or blocked by user gesture policy
    }
  }

  updatePhysics() {
    // Damped spring-harmonic oscillator for rotational & translational tilt
    const p = this.physics;

    // RotX spring
    const fRotX = (p.targetRotX - p.rotX) * p.stiffness;
    p.velRotX = (p.velRotX + fRotX) * p.damping;
    p.rotX += p.velRotX;

    // RotY spring
    const fRotY = (p.targetRotY - p.rotY) * p.stiffness;
    p.velRotY = (p.velRotY + fRotY) * p.damping;
    p.rotY += p.velRotY;

    // TransZ spring
    const fTransZ = (p.targetTransZ - p.transZ) * p.stiffness;
    p.velTransZ = (p.velTransZ + fTransZ) * p.damping;
    p.transZ += p.velTransZ;

    // Apply 3D transform to button
    this.btn.style.transform = `
      rotateX(${p.rotX.toFixed(2)}deg) 
      rotateY(${p.rotY.toFixed(2)}deg) 
      translateZ(${p.transZ.toFixed(2)}px)
    `;

    // Subtle reactive shadow shift based on cursor weight push
    const shadowX = -p.rotY * 0.8;
    const shadowY = 12 + p.rotX * 0.8;
    const shadowBlur = Math.max(16, 28 + p.transZ * 0.6);
    const shadowSpread = -3;

    this.btn.style.boxShadow = `
      ${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px ${shadowSpread}px var(--shadow-color),
      0 4px 12px -2px rgba(15, 23, 42, 0.15),
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -2px 4px 0 rgba(15, 23, 42, 0.35)
    `;
  }

  updateRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed;
      rip.intensity -= rip.decay;

      if (rip.radius > rip.maxRadius || rip.intensity <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.updatePhysics();
    this.updateRipples();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    const now = performance.now() * 0.0025;
    const lightRadius = this.params.cursorLightRadius;

    // Render each mosaic tile
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const centerX = tile.x + tile.size / 2;
      const centerY = tile.y + tile.size / 2;

      // 1. Cursor Proximity Illumination:
      // When cursor is near, tiles illuminate into vibrant sky blue & light cyan
      let proximity = 0;
      if (this.isHovered) {
        const distToMouse = Math.hypot(centerX - this.mouse.x, centerY - this.mouse.y);
        if (distToMouse < lightRadius) {
          const normDist = distToMouse / lightRadius;
          proximity = Math.pow(1 - normDist, 1.6) * tile.lightSensitivity;
        }
      }

      // Smooth lerp for activeFactor
      tile.activeFactor += (proximity - tile.activeFactor) * 0.24;

      // 2. Gentle Light Ripple Pulse (clean single pulse, soft brightness, less wave-like)
      let waveFactor = 0;
      for (let r = 0; r < this.ripples.length; r++) {
        const rip = this.ripples[r];
        const distToOrigin = Math.hypot(centerX - rip.x, centerY - rip.y);
        const waveDist = Math.abs(distToOrigin - rip.radius);

        if (waveDist < rip.waveWidth) {
          const crest = Math.cos((waveDist / rip.waveWidth) * (Math.PI / 2));
          const val = crest * rip.intensity;
          if (val > waveFactor) waveFactor = val;
        }
      }

      // 3. Ambient shimmer
      let shimmer = 0;
      if (this.params.shimmerEnabled) {
        shimmer = Math.sin(now + tile.phase + centerX * 0.05) * 3;
      }

      // 4. Color computation
      // Base: Deep royal blue (~44% lightness)
      // Proximity: Light sky blue / ice cyan (72-88% lightness)
      // Wave pulse: Soft light blue/soft white tint (subtle, non-blinding)
      const targetHue = 222 - tile.activeFactor * 14;
      const targetSat = tile.baseSat - tile.activeFactor * 10;
      let targetLight = tile.baseLight + shimmer + tile.activeFactor * 36;

      let fillStyle;
      if (waveFactor > 0.02) {
        // Softer brightness increase: gentle soft-white/cyan wash
        const blend = Math.min(1, waveFactor * 0.88);
        const waveLight = targetLight + (78 - targetLight) * blend;
        const waveHue = targetHue - blend * 8;
        const waveSat = Math.max(45, targetSat * (1 - blend * 0.35));
        fillStyle = `hsl(${waveHue}, ${waveSat}%, ${Math.min(84, waveLight).toFixed(1)}%)`;
      } else {
        fillStyle = `hsl(${targetHue}, ${targetSat}%, ${Math.min(92, targetLight)}%)`;
      }

      // Draw individual block with hardware-accelerated fillRect
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillRect(tile.x, tile.y, tile.size, tile.size);
    }
  }
}

// Initialize and Setup Controls
document.addEventListener('DOMContentLoaded', () => {
  const btnEl = document.getElementById('mosaicBtn');
  const mosaicButton = new MosaicButton(btnEl);

  // Controls bindings
  const labelInput = document.getElementById('labelInput');
  const btnLabel = document.getElementById('btnLabel');
  labelInput.addEventListener('input', (e) => {
    btnLabel.textContent = e.target.value.trim() || 'Get started';
  });

  const weightSlider = document.getElementById('weightSlider');
  const weightVal = document.getElementById('weightVal');
  weightSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    mosaicButton.params.weightForce = val;
    weightVal.textContent = `${val.toFixed(1)}x`;
  });

  const tileSizeSlider = document.getElementById('tileSizeSlider');
  const tileSizeVal = document.getElementById('tileSizeVal');
  tileSizeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    mosaicButton.params.tileSize = val;
    tileSizeVal.textContent = `${val.toFixed(1)}px`;
    mosaicButton.initTiles();
  });

  const rippleSpeedSlider = document.getElementById('rippleSpeedSlider');
  const rippleSpeedVal = document.getElementById('rippleSpeedVal');
  rippleSpeedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    mosaicButton.params.rippleSpeed = val;
    rippleSpeedVal.textContent = val === 1.0 ? 'Normal' : `${val.toFixed(1)}x`;
  });

  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('change', (e) => {
    mosaicButton.params.soundEnabled = e.target.checked;
  });

  const shimmerToggle = document.getElementById('shimmerToggle');
  shimmerToggle.addEventListener('change', (e) => {
    mosaicButton.params.shimmerEnabled = e.target.checked;
  });

  // Dark/Light Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  let isDark = false;
  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '☀️';
    } else {
      document.body.removeAttribute('data-theme');
      themeIcon.textContent = '🌙';
    }
  });
});
