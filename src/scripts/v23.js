import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ── Vinha fixa: cresce com o progresso do scroll ─────── */
const stems = [...document.querySelectorAll('[data-vine-grow]')];
const sprouts = [...document.querySelectorAll('[data-leaf-at]')];

stems.forEach((stem) => {
  stem.style.strokeDasharray = '100';
  stem.style.strokeDashoffset = reduced ? '0' : '100';
});
if (reduced) sprouts.forEach((s) => s.classList.add('v23-grown'));

function scrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
}

let vineTicking = false;
function updateVine() {
  vineTicking = false;
  const p = scrollProgress();
  stems.forEach((stem) => { stem.style.strokeDashoffset = String(100 - p * 100); });
  sprouts.forEach((s) => s.classList.toggle('v23-grown', p >= Number(s.dataset.leafAt || 0)));
}

if (!reduced && stems.length > 0) {
  updateVine();
  addEventListener('scroll', () => {
    if (!vineTicking) { vineTicking = true; requestAnimationFrame(updateVine); }
  }, { passive: true });
  addEventListener('resize', updateVine);
}

/* ── Seiva: gota de tinta azul que percorre o caule ──── */
const sapPath = document.querySelector('#v23-sap-path');
const sapDrop = document.querySelector('.v23-sap-drop');

if (sapPath && sapDrop) {
  const len = sapPath.getTotalLength();
  const place = (dist) => {
    const pt = sapPath.getPointAtLength(dist);
    sapDrop.setAttribute('cx', pt.x.toFixed(1));
    sapDrop.setAttribute('cy', pt.y.toFixed(1));
  };

  if (reduced) {
    place(len * 0.5);
  } else {
    let dist = 0;
    let running = false;
    let rafId = 0;
    const tick = () => {
      dist = (dist + len / 420) % len;
      place(dist);
      rafId = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    }).observe(sapPath.closest('.v23-hero-visual') ?? sapPath);
  }
}

/* ── Pólen: partículas flutuando (canvas leve) ────────── */
const pollen = document.querySelector('.v23-pollen');

if (pollen && !reduced) {
  const ctx = pollen.getContext('2d');
  const COUNT = coarse || innerWidth < 720 ? 14 : 42;
  const COLORS = ['0,143,76', '0,0,254', '0,255,96'];
  let w = 0;
  let h = 0;
  let parts = [];
  let rafId = 0;
  let active = false;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    pollen.width = w * dpr;
    pollen.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(fromBottom) {
    return {
      x: Math.random() * w,
      y: fromBottom ? h + 8 : Math.random() * h,
      r: 1 + Math.random() * 2.3,
      vy: .15 + Math.random() * .35,
      sway: Math.random() * Math.PI * 2,
      speed: .006 + Math.random() * .012,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: .22 + Math.random() * .33,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];
      p.y -= p.vy;
      p.sway += p.speed;
      p.x += Math.sin(p.sway) * .35;
      if (p.y < -10 || p.x < -10 || p.x > w + 10) parts[i] = spawn(true);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (active) return;
    active = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(rafId);
  }

  resize();
  parts = Array.from({ length: COUNT }, () => spawn(false));
  start();
  addEventListener('resize', () => { resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

/* ── Brotos: elementos florescem ao entrar na viewport ── */
const bloomTargets = [...document.querySelectorAll('.v23-product, .v23-eco-card, .v23-step, .v23-badge, .v23-result')];
bloomTargets.forEach((el, i) => el.style.setProperty('--i', String(i % 6)));

if (reduced) {
  bloomTargets.forEach((el) => el.classList.add('v23-bloom', 'v23-in'));
} else {
  bloomTargets.forEach((el) => el.classList.add('v23-bloom'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v23-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  bloomTargets.forEach((el) => io.observe(el));
}

/* ── Simulador: pulso na economia ao recalcular ───────── */
bindSimulador(() => {
  if (reduced) return;
  const dd = document.querySelector('.v23-result-accent dd');
  if (!dd) return;
  dd.classList.remove('v23-pulse');
  void dd.offsetWidth;
  dd.classList.add('v23-pulse');
});
