import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches || window.innerWidth < 720;

/* ---------- manômetros: ponteiros + contadores ---------- */
const gauges = [...document.querySelectorAll('[data-gauge]')];

const setGauge = (el, t) => {
  const value = parseFloat(el.dataset.value || '0') || 0;
  const max = parseFloat(el.dataset.max || String(value)) || value || 1;
  const angle = -90 + 180 * Math.min(1, (value * t) / max);
  const needle = el.querySelector('.v24-needle');
  if (needle) needle.style.setProperty('--a', `${angle}deg`);
  const num = el.querySelector('[data-gauge-number]');
  if (num) num.textContent = Math.round(value * t).toLocaleString('pt-BR');
};

if (reduced) {
  gauges.forEach((g) => setGauge(g, 1));
} else if (gauges.length > 0) {
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const animateGauge = (el) => {
    const duration = 1500;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setGauge(el, easeOut(t));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateGauge(entry.target);
      gaugeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  gauges.forEach((g) => { setGauge(g, 0); gaugeObserver.observe(g); });
}

/* ---------- engrenagem acoplada ao scroll ---------- */
const scrollGears = [...document.querySelectorAll('[data-gear-scroll]')];
if (scrollGears.length > 0 && !reduced) {
  let ticking = false;
  const update = () => {
    const y = window.scrollY || 0;
    scrollGears.forEach((gear) => {
      const factor = parseFloat(gear.dataset.gearScroll || '0.05') || 0.05;
      gear.style.transform = `rotate(${y * factor}deg)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ---------- vapor saindo do tubo (canvas) ---------- */
const steamCanvas = document.querySelector('.v24-steam');
const hero = document.querySelector('.v24-hero');
const vents = [...document.querySelectorAll('.v24-vent')];

if (steamCanvas && hero && !reduced) {
  const ctx = steamCanvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const maxPuffs = coarse ? 16 : 40;
  const spawnInterval = coarse ? 320 : 150;
  let puffs = [];
  let rafId = null;
  let lastSpawn = 0;

  const resize = () => {
    steamCanvas.width = Math.max(1, Math.round(steamCanvas.offsetWidth * dpr));
    steamCanvas.height = Math.max(1, Math.round(steamCanvas.offsetHeight * dpr));
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const spawn = () => {
    const box = steamCanvas.getBoundingClientRect();
    vents.forEach((vent) => {
      const r = vent.getBoundingClientRect();
      if (r.width === 0) return;
      puffs.push({
        x: (r.left + r.width / 2 - box.left) * dpr,
        y: (r.top - box.top) * dpr,
        r: (5 + Math.random() * 7) * dpr,
        a: 0.32,
        vy: -(0.35 + Math.random() * 0.5) * dpr,
        vx: (Math.random() - 0.5) * 0.3 * dpr,
        grow: (0.07 + Math.random() * 0.08) * dpr,
      });
    });
    if (puffs.length > maxPuffs) puffs = puffs.slice(-maxPuffs);
  };

  const tick = (now) => {
    if (now - lastSpawn > spawnInterval) {
      spawn();
      lastSpawn = now;
    }
    ctx.clearRect(0, 0, steamCanvas.width, steamCanvas.height);
    puffs = puffs.filter((p) => p.a > 0.015);
    puffs.forEach((p) => {
      p.x += p.vx + Math.sin((p.y + p.r) * 0.02) * 0.25 * dpr;
      p.y += p.vy;
      p.r += p.grow;
      p.a *= 0.982;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(243, 234, 216, ${p.a})`);
      grad.addColorStop(1, 'rgba(243, 234, 216, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    rafId = requestAnimationFrame(tick);
  };

  const steamObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && rafId === null) {
        rafId = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
        ctx.clearRect(0, 0, steamCanvas.width, steamCanvas.height);
      }
    });
  }, { threshold: 0.05 });
  steamObserver.observe(hero);
}

/* ---------- simulador (economia real) ---------- */
bindSimulador();
