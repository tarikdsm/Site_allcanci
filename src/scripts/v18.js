import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const hud = document.querySelector('.v18-hud');
const coinsEl = document.querySelector('[data-v18-coins]');
const scoreEl = document.querySelector('[data-v18-score]');
const toast = document.querySelector('[data-v18-toast]');

const state = { coins: 0, score: 0 };

/* Conta visualmente de `from` até `to` com zeros à esquerda (placar de arcade). */
function animateNumber(el, from, to, { pad = 2, duration = 500 } = {}) {
  if (!el) return;
  if (reduced) {
    el.textContent = String(to).padStart(pad, '0');
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(from + (to - from) * t)).padStart(pad, '0');
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function popCoin() {
  if (!hud || reduced) return;
  hud.classList.remove('v18-coin-pop');
  void hud.offsetWidth;
  hud.classList.add('v18-coin-pop');
}

function addCoins(n) {
  const from = state.coins;
  state.coins += n;
  animateNumber(coinsEl, from, state.coins, { pad: 2 });
  popCoin();
}

function addScore(n) {
  const from = state.score;
  state.score += n;
  animateNumber(scoreEl, from, state.score, { pad: 6, duration: 700 });
}

/* ---------- PRESS START: loading de fase com 22 passos (recarga de 22s) ---------- */
const startBtn = document.querySelector('[data-v18-start]');
const loadText = document.querySelector('[data-v18-load-text]');
const loadPct = document.querySelector('[data-v18-load-pct]');
const loadFill = document.querySelector('[data-v18-load-fill]');
const loadBar = document.querySelector('[data-v18-loadbar]');
const screenTag = document.querySelector('[data-v18-screen-tag]');
const TOTAL_STEPS = 22;
let loading = false;
let loaded = false;

function setLoadStep(step) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  if (loadFill) loadFill.style.width = `${pct}%`;
  if (loadPct) loadPct.textContent = `${pct}%`;
  loadBar?.setAttribute('aria-valuenow', String(step));
  if (loadText) loadText.textContent = step >= TOTAL_STEPS ? 'FASE 01 LIBERADA!' : `RECARREGANDO… ${step}s / 22s`;
}

startBtn?.addEventListener('click', () => {
  if (loading) return;
  loading = true;
  screenTag?.classList.remove('v18-blink');
  if (screenTag) screenTag.textContent = 'PLAYER 1 READY';
  const finish = () => {
    loading = false;
    if (!loaded) {
      loaded = true;
      addCoins(10);
      addScore(50);
    }
    document.querySelector('#produtos')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  if (reduced) {
    setLoadStep(TOTAL_STEPS);
    finish();
    return;
  }
  const duration = 2200;
  const start = performance.now();
  const tick = (now) => {
    const step = Math.min(TOTAL_STEPS, Math.floor(((now - start) / duration) * TOTAL_STEPS));
    setLoadStep(step);
    if (step < TOTAL_STEPS) requestAnimationFrame(tick);
    else finish();
  };
  requestAnimationFrame(tick);
});

/* ---------- Fichas e score por fase visitada (uma vez por seção) ---------- */
const sections = [...document.querySelectorAll('[data-experience-section]')];
const seen = new Set();
if ('IntersectionObserver' in window && sections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      addCoins(5);
      addScore(100);
    });
  }, { rootMargin: '-30% 0px -45% 0px' });
  sections.forEach((section) => observer.observe(section));
}

/* ---------- Simulador: cada ajuste rende ficha (com throttle) ---------- */
let lastSimReward = 0;
bindSimulador(() => {
  const now = Date.now();
  if (now - lastSimReward < 800) return;
  lastSimReward = now;
  addCoins(1);
  addScore(10);
});

/* ---------- Easter egg Konami: ↑ ↑ ↓ ↓ ← → ← → B A ---------- */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiPos = 0;
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}
addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : key === KONAMI[0] ? 1 : 0;
  if (konamiPos !== KONAMI.length) return;
  konamiPos = 0;
  document.body.classList.add('v18-cheat');
  addCoins(99);
  addScore(999);
  showToast('Código Konami aceito: recarga infinita! +99 fichas');
});
