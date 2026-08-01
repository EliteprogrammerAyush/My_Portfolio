/* ==========================================================================
   PAC-MAN AUDIO SYNTH & ARCADE INTERACTIVITY ENGINE
   Ayush Soni - Retro Arcade Portfolio
   ========================================================================== */

(function () {
  // Web Audio Context initialization
  let audioCtx = null;
  let isMuted = localStorage.getItem('pacman_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Synth Pac-Man Waka Sound
  window.playWaka = function () {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  };

  // Synth Arcade Click / Select Sound
  window.playClickSound = function () {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.04); // A5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  };

  // Synth Power Pellet Sound
  window.playPowerPellet = function () {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.15);
      osc.frequency.linearRampToValueAtTime(300, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  };

  // Initialize UI Sound Events & HUD Button
  document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) {
      updateSoundBtnLabel(soundBtn);
      soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isMuted = !isMuted;
        localStorage.setItem('pacman_muted', isMuted);
        updateSoundBtnLabel(soundBtn);
        if (!isMuted) playClickSound();
      });
    }

    // Attach sound FX to links & buttons
    document.querySelectorAll('.nav a, .btn-arcade, .social-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        playWaka();
      });
      el.addEventListener('click', () => {
        playClickSound();
      });
    });

    // Setup playable Pac-Man canvas mini game if present
    initMiniGame();
  });

  function updateSoundBtnLabel(btn) {
    btn.innerHTML = isMuted ? '🔊 SOUND: OFF' : '🔊 SOUND: ON';
    btn.style.color = isMuted ? '#9fb6bf' : '#00ffff';
    btn.style.borderColor = isMuted ? '#9fb6bf' : '#00ffff';
  }

  // Interactive Playable Mini Pac-Man Game Engine
  function initMiniGame() {
    const canvas = document.getElementById('pacman-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;

    let pacX = 30;
    let pacY = 140;
    let pacDir = 'RIGHT';
    let pacSpeed = 3;
    let score = 0;

    let ghostX = 360;
    let ghostY = 140;
    let ghostSpeed = 1.8;

    // Dots grid
    let dots = [];
    for (let x = 40; x < 380; x += 40) {
      for (let y = 30; y < 270; y += 40) {
        dots.push({ x, y, eaten: false });
      }
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) pacDir = 'UP';
      if (['ArrowDown', 'KeyS'].includes(e.code)) pacDir = 'DOWN';
      if (['ArrowLeft', 'KeyA'].includes(e.code)) pacDir = 'LEFT';
      if (['ArrowRight', 'KeyD'].includes(e.code)) pacDir = 'RIGHT';
    });

    function update() {
      // Move Pac-Man
      if (pacDir === 'RIGHT') pacX += pacSpeed;
      if (pacDir === 'LEFT') pacX -= pacSpeed;
      if (pacDir === 'UP') pacY -= pacSpeed;
      if (pacDir === 'DOWN') pacY += pacSpeed;

      // Boundaries
      pacX = Math.max(15, Math.min(385, pacX));
      pacY = Math.max(15, Math.min(265, pacY));

      // Move Ghost towards Pacman
      if (ghostX < pacX) ghostX += ghostSpeed;
      if (ghostX > pacX) ghostX -= ghostSpeed;
      if (ghostY < pacY) ghostY += ghostSpeed;
      if (ghostY > pacY) ghostY -= ghostSpeed;

      // Eat dots
      dots.forEach(d => {
        if (!d.eaten && Math.hypot(pacX - d.x, pacY - d.y) < 15) {
          d.eaten = true;
          score += 10;
          playWaka();
          const scoreEl = document.getElementById('mini-score');
          if (scoreEl) scoreEl.innerText = score;
        }
      });
    }

    let mouthAngle = 0.2;
    let mouthSpeed = 0.04;

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Maze Grid Outline
      ctx.strokeStyle = '#1b1bff';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Draw Dots
      ctx.fillStyle = '#ffb8ae';
      dots.forEach(d => {
        if (!d.eaten) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Pac-Man
      mouthAngle += mouthSpeed;
      if (mouthAngle > 0.4 || mouthAngle < 0.05) mouthSpeed = -mouthSpeed;

      let rotation = 0;
      if (pacDir === 'RIGHT') rotation = 0;
      if (pacDir === 'DOWN') rotation = Math.PI / 2;
      if (pacDir === 'LEFT') rotation = Math.PI;
      if (pacDir === 'UP') rotation = -Math.PI / 2;

      ctx.save();
      ctx.translate(pacX, pacY);
      ctx.rotate(rotation);

      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(0, 0, 12, mouthAngle, Math.PI * 2 - mouthAngle);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();

      // Draw Ghost (Blinky Red)
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(ghostX, ghostY - 2, 11, Math.PI, 0, false);
      ctx.lineTo(ghostX + 11, ghostY + 10);
      ctx.lineTo(ghostX - 11, ghostY + 10);
      ctx.fill();

      // Ghost Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ghostX - 4, ghostY - 4, 3, 0, Math.PI * 2);
      ctx.arc(ghostX + 4, ghostY - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0000ff';
      ctx.beginPath();
      ctx.arc(ghostX - 3, ghostY - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(ghostX + 5, ghostY - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function gameLoop() {
      update();
      render();
      animationId = requestAnimationFrame(gameLoop);
    }

    // Play/Pause Trigger
    const openBtn = document.getElementById('open-game-btn');
    const closeBtn = document.getElementById('close-game-btn');
    const modal = document.getElementById('game-modal');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        playPowerPellet();
        if (!animationId) gameLoop();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }
  }
})();
