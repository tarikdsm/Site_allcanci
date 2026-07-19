import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Formas primárias: espalhadas → compostas ao entrar na viewport (e vice-versa).
   O estado "espalhado" vem do CSS via --dx/--dy/--rot; .is-composed zera o transform. */
const shapes = [...document.querySelectorAll('.v22 [data-compose]')];
if (reduced || !('IntersectionObserver' in window)) {
  shapes.forEach((el) => el.classList.add('is-composed'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-composed', entry.isIntersecting);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });
  shapes.forEach((el) => io.observe(el));
}

/* Parallax sutil da composição do hero: as formas descem um pouco mais que a foto.
   Somente desktop com ponteiro fino; atualização via rAF e ignorada fora da viewport. */
const comp = document.querySelector('.v22-comp');
const hero = document.querySelector('.v22-hero');
const finePointer = matchMedia('(pointer: fine)').matches;
if (comp && hero && !reduced && finePointer && innerWidth > 760) {
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const span = Math.max(1, rect.height - innerHeight * 0.4);
    const progress = Math.min(1, Math.max(0, -rect.top / span));
    comp.style.setProperty('--v22-par', `${(progress * 34).toFixed(1)}px`);
  };
  addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* Simulador padrão + pulso geométrico no resultado de economia a cada cálculo. */
bindSimulador(() => {
  if (reduced) return;
  const accent = document.querySelector('.v22-result-accent');
  if (!accent) return;
  accent.classList.remove('v22-pop');
  requestAnimationFrame(() => accent.classList.add('v22-pop'));
});
