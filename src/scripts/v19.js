import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced) {
  bindSimulador();
} else {
  document.body.classList.add('v19-motion');

  // Revela cada seção "colada" ao entrar na viewport (uma vez só).
  const sections = [...document.querySelectorAll('[data-experience-section]')];
  if ('IntersectionObserver' in window && sections.length > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('v19-shown');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    sections.forEach((section) => io.observe(section));
  } else {
    sections.forEach((section) => section.classList.add('v19-shown'));
  }

  // A cada nova simulação, o valor da economia é "carimbado" de novo.
  bindSimulador(() => {
    const economia = document.querySelector('#sim-economia');
    if (!economia) return;
    economia.classList.remove('v19-ka-chunk');
    void economia.offsetWidth;
    economia.classList.add('v19-ka-chunk');
  });
}
