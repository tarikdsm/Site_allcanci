import { bindSimulador } from './simulador-bind.js';
import { simular } from './simulador-core.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Tinta viva: manchas que crescem e esmaecem onde o cursor passa ─────────
const canvas = document.querySelector('#tinta');
if (canvas && !reduz) {
  const ctx = canvas.getContext('2d');
  const CORES = ['#0000fe', '#0000db', '#008aff'];
  let manchas = [];
  const ajusta = () => { canvas.width = innerWidth; canvas.height = canvas.parentElement.offsetHeight; };
  ajusta(); addEventListener('resize', ajusta);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    manchas.push({ x: e.clientX - r.left, y: e.clientY - r.top, raio: 4, max: 60 + Math.random() * 80, cor: CORES[(Math.random() * CORES.length) | 0], alfa: 0.5 });
    if (manchas.length > 120) manchas.shift();
  });
  (function desenha() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    manchas = manchas.filter((m) => m.alfa > 0.01);
    for (const m of manchas) {
      m.raio = Math.min(m.raio + 1.6, m.max);
      if (m.raio >= m.max) m.alfa *= 0.96;
      ctx.globalAlpha = m.alfa;
      ctx.fillStyle = m.cor;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.raio, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(desenha);
  })();
}

// ── Trilho horizontal de produtos: botões prev/next acessíveis ─────────────
const trilho = document.querySelector('.trilho');
document.querySelector('.trilho-prev')?.addEventListener('click', () => trilho.scrollBy({ left: -trilho.clientWidth, behavior: reduz ? 'auto' : 'smooth' }));
document.querySelector('.trilho-next')?.addEventListener('click', () => trilho.scrollBy({ left: trilho.clientWidth, behavior: reduz ? 'auto' : 'smooth' }));

// Estado das pontas: desabilita os botões no início/fim do trilho
const trilhoPrev = document.querySelector('.trilho-prev');
const trilhoNext = document.querySelector('.trilho-next');
if (trilho && trilhoPrev && trilhoNext) {
  const atualiza = () => {
    const fim = trilho.scrollWidth - trilho.clientWidth - 2;
    trilhoPrev.disabled = trilho.scrollLeft <= 2;
    trilhoNext.disabled = trilho.scrollLeft >= fim;
  };
  trilho.addEventListener('scroll', () => requestAnimationFrame(atualiza), { passive: true });
  addEventListener('resize', atualiza);
  atualiza();
}

// ── Simulador + tanque de tinta: #sim-tanque é o <rect> interno do SVG ─────
// A altura do retângulo é proporcional à economia do slider em relação à
// economia no máximo do slider — cheio (ALTURA_MAX) quando o slider está no máximo.
const tanque = document.querySelector('#sim-tanque');
const ALTURA_MAX = 180; // altura útil do rect no viewBox da garrafa
bindSimulador((r) => {
  if (!tanque) return;
  const max = Number(document.querySelector('#sim-professores')?.max || 200);
  const economiaMax = simular(max).economia;
  const fracao = economiaMax > 0 ? Math.max(0, r.economia) / economiaMax : 0;
  const h = Math.round(ALTURA_MAX * Math.min(1, fracao));
  tanque.setAttribute('height', String(h));
  tanque.setAttribute('y', String(200 - h)); // fundo da garrafa em y=200 no viewBox
});

// ── Cursor-gota: seguidor do ponteiro (desktop com ponteiro fino, sem reduce) ──
// Nunca esconde o cursor nativo nem intercepta cliques (pointer-events: none).
const gota = document.querySelector('.v5-gota');
if (gota && !reduz && matchMedia('(pointer: fine)').matches) {
  let alvoX = -100, alvoY = -100, x = -100, y = -100;
  addEventListener('pointermove', (e) => {
    alvoX = e.clientX; alvoY = e.clientY;
    gota.classList.add('is-ativa');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => gota.classList.remove('is-ativa'));
  (function segue() {
    x += (alvoX - x) * 0.16;
    y += (alvoY - y) * 0.16;
    gota.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(segue);
  })();
}
