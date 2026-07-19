import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Chuva na janela do escritório do detetive (hero).
   Sem canvas/reduced-motion o hero mantém o fundo estático com veneziana. */
const canvas = document.querySelector('[data-rain]');

if (canvas && !reduced) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 720;
    const COUNT = coarse ? 55 : 130;
    const WIND = 0.35;
    let drops = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;

    const spawn = (anywhere) => ({
      x: Math.random() * (w + 80) - 40,
      y: anywhere ? Math.random() * h : -20 - Math.random() * 40,
      len: 9 + Math.random() * 16,
      speed: 5 + Math.random() * 6,
      alpha: 0.08 + Math.random() * 0.2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: COUNT }, () => spawn(true));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const drop of drops) {
        ctx.strokeStyle = `rgba(243, 243, 243, ${drop.alpha})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.len * WIND, drop.y + drop.len);
        ctx.stroke();
        drop.x -= drop.speed * WIND;
        drop.y += drop.speed;
        if (drop.y > h + 20) Object.assign(drop, spawn(false));
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    });
    observer.observe(canvas);

    let resizeTimer;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (canvas.getBoundingClientRect().bottom > 0) start();
    });
  }
}

bindSimulador();
