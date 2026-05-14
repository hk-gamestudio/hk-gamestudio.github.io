/**
 * Cyberpunk particle field.
 * ~120 particles (cyan + purple), connected by lines when close,
 * repelled by mouse. Respects prefers-reduced-motion.
 */

const PARTICLE_COUNT = 120;
const CONNECTION_DIST = 130;
const MOUSE_REPEL_DIST = 110;
const SPEED = 0.45;

const COLORS = [
  { r: 0,   g: 230, b: 230 }, // ~cyan
  { r: 139, g: 92,  b: 246 }, // ~purple
];

class Particle {
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    this.x  = Math.random() * w;
    this.y  = Math.random() * h;
    this.vx = (Math.random() - 0.5) * SPEED * 2;
    this.vy = (Math.random() - 0.5) * SPEED * 2;
    this.r  = Math.random() * 1.8 + 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.45 + 0.15;
    this.w = w;
    this.h = h;
  }

  update(mouse) {
    if (mouse) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_REPEL_DIST * MOUSE_REPEL_DIST) {
        const d = Math.sqrt(d2);
        const force = (MOUSE_REPEL_DIST - d) / MOUSE_REPEL_DIST * 0.6;
        this.vx += (dx / d) * force;
        this.vy += (dy / d) * force;
      }
    }

    // Speed cap + damping
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > SPEED * 3) {
      this.vx = (this.vx / speed) * SPEED * 3;
      this.vy = (this.vy / speed) * SPEED * 3;
    }
    this.vx *= 0.992;
    this.vy *= 0.992;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap
    if (this.x < -10)         this.x = this.w + 10;
    if (this.x > this.w + 10) this.x = -10;
    if (this.y < -10)         this.y = this.h + 10;
    if (this.y > this.h + 10) this.y = -10;
  }

  draw(ctx) {
    const { r, g, b } = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
    ctx.fill();
  }
}

export function initCanvas(canvasId) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const particles = [];
  let mouse = null;
  let raf = null;
  let w = 0, h = 0;

  function resize() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width  = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    particles.forEach(p => { p.w = w; p.h = h; });
  }

  function init() {
    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle(w, h));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const pi = particles[i], pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECTION_DIST * CONNECTION_DIST) {
          const t = 1 - Math.sqrt(d2) / CONNECTION_DIST;
          const { r: r1, g: g1, b: b1 } = pi.color;
          const { r: r2, g: g2, b: b2 } = pj.color;
          const rc = Math.round((r1 + r2) / 2);
          const gc = Math.round((g1 + g2) / 2);
          const bc = Math.round((b1 + b2) / 2);
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(${rc},${gc},${bc},${t * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw + update particles
    particles.forEach(p => {
      p.update(mouse);
      p.draw(ctx);
    });
  }

  function loop() {
    draw();
    raf = requestAnimationFrame(loop);
  }

  // Mouse tracking
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse = null; }, { passive: true });

  // Touch tracking
  hero.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse = { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, { passive: true });
  hero.addEventListener('touchend', () => { mouse = null; }, { passive: true });

  // Resize observer (more accurate than window resize for canvas)
  new ResizeObserver(resize).observe(canvas);

  // Pause when off-screen
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!raf) loop();
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }
    });
  }, { threshold: 0 });

  observer.observe(canvas);
  init();
  loop();
}
