import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tilt 3D do estágio da máquina
const stage = document.querySelector('[data-tilt]');
if (stage && !reduz) {
  const amp = 9;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.style.transform = `perspective(900px) rotateY(${x * amp}deg) rotateX(${-y * amp}deg)`;
  });
  stage.addEventListener('pointerleave', () => (stage.style.transform = ''));
}

// Contadores animados
const conta = (el) => {
  const alvo = parseFloat(el.dataset.contador);
  const t0 = performance.now();
  const dur = 1200;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = el.dataset.prefixo + Math.round(alvo * (1 - Math.pow(1 - p, 3))) + (el.dataset.sufixo ?? '');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver((es) =>
  es.forEach((e) => { if (e.isIntersecting) { conta(e.target); io.unobserve(e.target); } }));
document.querySelectorAll('[data-contador]').forEach((el) => {
  el.dataset.prefixo = el.dataset.prefixo ?? '';
  if (reduz) el.textContent = el.dataset.prefixo + el.dataset.contador + (el.dataset.sufixo ?? '');
  else io.observe(el);
});

// Simulador (bind compartilhado — ver contrato de markup na Task 5)
bindSimulador();
