import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* Revelação suave das salas ao rolar (apenas com JS e sem reduced-motion) */
if (!reduced) {
  document.body.classList.add('v17-js');
  const salas = [...document.querySelectorAll('[data-experience-section]')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('v17-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  salas.forEach((sala) => io.observe(sala));
}

/* Obra interativa «Tinta Viva» — canvas 2D de tinta fluida.
   Blobs azuis/vermelhos/pretos escorrem e se misturam (multiply);
   quem prefere reduced-motion recebe a composição estática em CSS. */
const art = document.querySelector('[data-ink-art]');
const canvas = document.querySelector('#v17-ink');

if (art && canvas && !reduced) {
  const ctx = canvas.getContext('2d');
  const PAPER = '#f6f1e4';
  const INKS = ['#0000fe', '#ff0c00', '#080808'];
  const MAX_DROPS = coarse ? 130 : 260;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pickInk = () => INKS[(Math.random() * INKS.length) | 0];

  let w = 0;
  let h = 0;
  let raf = 0;
  let running = false;
  let inView = false;
  const drops = [];

  function spawn(x, y, burst = 1, big = false) {
    for (let i = 0; i < burst; i++) {
      if (drops.length >= MAX_DROPS) drops.shift();
      drops.push({
        x: x + rand(-7, 7),
        y: y + rand(-7, 7),
        vx: rand(-0.35, 0.35),
        vy: rand(0.05, 0.55),
        r: big ? rand(5, 13) : rand(2, 8),
        color: pickInk(),
        life: 1,
        decay: rand(0.0022, 0.0075),
        drag: rand(0.4, 1.4),
        alpha: rand(0.32, 0.6),
      });
    }
  }

  function paintDrop(d) {
    const stretch = 1 + Math.min(3.5, d.vy * 1.7);
    ctx.globalAlpha = Math.max(0, Math.min(1, d.life)) * d.alpha;
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, Math.max(0.6, d.r / Math.sqrt(stretch)), d.r * stretch, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function seedPainting() {
    /* composição inicial: manchas amplas + pingos que já escorrem */
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 9; i++) {
      ctx.globalAlpha = rand(0.12, 0.3);
      ctx.fillStyle = pickInk();
      const r = rand(w * 0.08, w * 0.22);
      ctx.beginPath();
      ctx.ellipse(rand(w * 0.15, w * 0.85), rand(h * 0.12, h * 0.85), r, r * rand(0.7, 1.5), rand(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 16; i++) spawn(rand(w * 0.1, w * 0.9), rand(-8, h * 0.55), 1, Math.random() < 0.3);
  }

  function resize() {
    const rect = art.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
    drops.length = 0;
    seedPainting();
  }

  function frame() {
    /* desbotamento lento: a tinta “escorre” deixando rastro na tela */
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(246, 241, 228, 0.03)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'multiply';
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += 0.011 * d.drag;
      d.x += d.vx;
      d.y += d.vy;
      d.life -= d.decay;
      paintDrop(d);
      if (d.life <= 0 || d.y - d.r > h + 24) drops.splice(i, 1);
    }
    ctx.globalAlpha = 1;

    /* pingos autônomos ocasionais mantêm a obra viva sem cursor */
    if (Math.random() < 0.07) spawn(rand(w * 0.08, w * 0.92), rand(-12, h * 0.4), 1);

    if (running) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function pointerToCanvas(ev) {
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  art.addEventListener('pointermove', (ev) => {
    const p = pointerToCanvas(ev);
    spawn(p.x, p.y, coarse ? 1 : 2);
  }, { passive: true });
  art.addEventListener('pointerdown', (ev) => {
    const p = pointerToCanvas(ev);
    spawn(p.x, p.y, coarse ? 8 : 16, true);
  }, { passive: true });

  /* pausa fora da viewport e com a aba oculta */
  const visObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting;
      if (inView) start(); else stop();
    });
  }, { threshold: 0.05 });
  visObserver.observe(art);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inView) start();
  });

  const ro = new ResizeObserver(() => resize());
  ro.observe(art);

  resize();
  art.classList.add('v17-live');
}

bindSimulador();
