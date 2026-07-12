import { bindSimulador } from './simulador-bind.js';
import { clampPercent } from './experiencias-core.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cycle = document.querySelector('[data-cycle]');
const steps = [...document.querySelectorAll('[data-cycle-step]')];
const progressByStep = { use: 0, refill: 38, continue: 72 };

steps.forEach((button) => {
  button.addEventListener('click', () => {
    steps.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    const progress = clampPercent(progressByStep[button.dataset.cycleStep] ?? 0);
    cycle?.style.setProperty('--cycle-progress', `${progress}%`);
    cycle?.setAttribute('data-cycle-active', button.dataset.cycleStep ?? 'use');
  });
});

const sections = [...document.querySelectorAll('[data-experience-section]')];
if (cycle && sections.length > 0 && !reduced) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = sections.indexOf(entry.target);
      const progress = clampPercent((index / Math.max(1, sections.length - 1)) * 100);
      cycle.style.setProperty('--cycle-progress', `${progress}%`);
    });
  }, { rootMargin: '-35% 0px -50% 0px' });
  sections.forEach((section) => observer.observe(section));
}

bindSimulador();
