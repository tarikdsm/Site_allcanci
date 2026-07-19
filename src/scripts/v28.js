import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const body = document.body;

/* ------------------------------------------------------------------ */
/* Profundímetro: 0 → 1000 m de tinta (22 m = 22 s · 500 m = +500     */
/* escolas · 1000 m = 1 km de escrita). Atualiza também o             */
/* escurecimento progressivo (--v28-depth) e os raios de luz.         */
/* ------------------------------------------------------------------ */
const MAX_DEPTH = 1000;
const depthValue = document.querySelector('[data-v28-depth-value]');
const depthZone = document.querySelector('[data-v28-depth-zone]');
const zones = [
  [8, 'Superfície'],
  [22, 'Zona da luz'],
  [120, 'Águas abertas'],
  [500, 'Zona crepuscular'],
  [940, 'Zona profunda'],
  [Infinity, 'Fundo do oceano'],
];

let depthTicking = false;
const updateDepth = () => {
  depthTicking = false;
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
  const depth = progress * MAX_DEPTH;
  body.style.setProperty('--v28-depth', progress.toFixed(4));
  body.style.setProperty('--v28-rays', Math.max(0, 1 - progress * 1.5).toFixed(3));
  if (depthValue) depthValue.textContent = String(Math.round(depth)).padStart(4, '0');
  if (depthZone) {
    const zone = zones.find(([limit]) => depth < limit);
    const label = zone ? zone[1] : zones[zones.length - 1][1];
    if (depthZone.textContent !== label) depthZone.textContent = label;
  }
};
addEventListener('scroll', () => {
  if (!depthTicking) {
    depthTicking = true;
    requestAnimationFrame(updateDepth);
  }
}, { passive: true });
addEventListener('resize', updateDepth);
updateDepth();

/* ------------------------------------------------------------------ */
/* Canvas: bolhas que sobem + plâncton cintilante. Leve, pausado      */
/* fora de vista e reduzido no mobile / com reduced-motion.           */
/* ------------------------------------------------------------------ */
const canvas = document.querySelector('[data-v28-bubbles]');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const small = coarse || innerWidth < 760;
  const BUBBLES = small ? 16 : 44;
  const PLANKTON = small ? 24 : 70;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  const bubbles = [];
  const plankton = [];
  const rand = (min, max) => min + Math.random() * (max - min);

  const spawnBubble = (anywhere) => ({
    x: rand(0, width),
    y: anywhere ? rand(0, height) : height + rand(10, 80),
    r: rand(1.2, small ? 4 : 6.5),
    speed: rand(14, 42),
    sway: rand(4, 18),
    freq: rand(0.4, 1.2),
    phase: rand(0, Math.PI * 2),
    alpha: rand(0.1, 0.42),
  });
  const spawnPlankton = () => ({
    x: rand(0, width),
    y: rand(0, height),
    r: rand(0.5, 1.7),
    drift: rand(-6, 6),
    phase: rand(0, Math.PI * 2),
    freq: rand(0.6, 1.8),
    alpha: rand(0.14, 0.5),
    warm: Math.random() > 0.5,
  });

  const resize = () => {
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  for (let i = 0; i < BUBBLES; i += 1) bubbles.push(spawnBubble(true));
  for (let i = 0; i < PLANKTON; i += 1) plankton.push(spawnPlankton());

  const draw = (time, dt) => {
    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;
    for (const p of plankton) {
      p.x += (p.drift * dt) / 1000;
      if (p.x < -4) p.x = width + 4;
      if (p.x > width + 4) p.x = -4;
      const twinkle = p.alpha * (0.45 + 0.55 * Math.sin(t * p.freq + p.phase));
      if (twinkle <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.warm ? `rgba(187,224,239,${twinkle})` : `rgba(67,232,255,${twinkle})`;
      ctx.fill();
    }
    for (const b of bubbles) {
      b.y -= (b.speed * dt) / 1000;
      if (b.y < -24) Object.assign(b, spawnBubble(false));
      const x = b.x + Math.sin(t * b.freq + b.phase) * b.sway;
      ctx.beginPath();
      ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(187,224,239,${b.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - b.r * 0.32, b.y - b.r * 0.32, Math.max(0.5, b.r * 0.22), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${b.alpha * 0.85})`;
      ctx.fill();
    }
  };

  if (reduced) {
    draw(0, 0); // quadro estático: bolhas e plâncton congelados
    addEventListener('resize', () => { resize(); draw(0, 0); });
  } else {
    let running = true;
    let raf = 0;
    let last = performance.now();
    const frame = (time) => {
      if (!running) return;
      const dt = Math.min(64, time - last);
      last = time;
      draw(time, dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    let resizeRaf = 0;
    addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
  }
}

/* ------------------------------------------------------------------ */
/* Parallax leve: máquina do hero, máquina do fundo e fotos de        */
/* produto flutuam em velocidades diferentes durante a descida.       */
/* ------------------------------------------------------------------ */
if (!reduced && !coarse && innerWidth >= 760) {
  const floats = [...document.querySelectorAll('[data-v28-float]')].map((el) => ({
    el,
    speed: Number(el.dataset.v28Float) || 0.06,
  }));
  document.querySelectorAll('.v28-product-photo').forEach((el, index) => {
    floats.push({ el, speed: index % 2 === 0 ? 0.045 : -0.05 });
  });
  if (floats.length > 0) {
    let floatTicking = false;
    const applyFloats = () => {
      floatTicking = false;
      const mid = innerHeight / 2;
      for (const { el, speed } of floats) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > innerHeight + 80) continue;
        const offset = (rect.top + rect.height / 2 - mid) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    addEventListener('scroll', () => {
      if (!floatTicking) {
        floatTicking = true;
        requestAnimationFrame(applyFloats);
      }
    }, { passive: true });
    addEventListener('resize', applyFloats);
    applyFloats();
  }
}

/* Simulador: flash sonar no resultado de economia a cada ajuste. */
bindSimulador(() => {
  if (reduced) return;
  const el = document.querySelector('[data-impact-result="economia"] dd');
  el?.animate(
    [{ textShadow: '0 0 26px rgba(0,26,51,.0)', transform: 'scale(1.04)' }, { textShadow: '0 0 0 rgba(0,0,0,0)', transform: 'scale(1)' }],
    { duration: 500, easing: 'ease-out' },
  );
});
