import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* As páginas da edição "desdobram" conforme o leitor rola o jornal. */
if (!reduced && 'IntersectionObserver' in window) {
  const pages = [...document.querySelectorAll('[data-experience-section]')];
  pages.forEach((page) => page.classList.add('v25-reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('v25-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
  pages.forEach((page) => observer.observe(page));
}

/* Carimbo de "publicado" no quadro de economia a cada nova simulação. */
const economia = document.querySelector('[data-impact-result="economia"]');
bindSimulador(() => {
  if (reduced || !economia) return;
  economia.classList.remove('v25-stamped');
  void economia.offsetWidth;
  economia.classList.add('v25-stamped');
});
