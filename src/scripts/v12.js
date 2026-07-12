import { bindSimulador } from './simulador-bind.js';
import { slideDeltaForKey, nextIndex } from './experiencias-core.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slides = [...document.querySelectorAll('[data-experience-section]')];
const progress = document.querySelector('[data-pitch-progress]');
const current = document.querySelector('[data-slide-current]');
const personaButtons = [...document.querySelectorAll('[data-persona]')];
const personaPanels = [...document.querySelectorAll('[data-persona-panel]')];
let activeIndex = 0;
let touchStart = 0;

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    activeIndex = slides.indexOf(entry.target);
    const shown = String(activeIndex + 1).padStart(2, '0');
    if (current) current.textContent = shown;
    progress?.style.setProperty('--pitch-progress', `${((activeIndex + 1) / slides.length) * 100}%`);
    document.querySelectorAll('.v12-rail a').forEach((link, index) => link.toggleAttribute('aria-current', index === activeIndex));
  });
}, { rootMargin: '-30% 0px -55% 0px' });
slides.forEach((slide) => observer.observe(slide));

document.addEventListener('keydown', (event) => {
  if (event.target.closest('input, button, a, summary, select, textarea')) return;
  const delta = slideDeltaForKey(event.key);
  if (!delta) return;
  event.preventDefault();
  slides[nextIndex(activeIndex, delta, slides.length)]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});

document.addEventListener('pointerdown', (event) => { touchStart = event.clientY; }, { passive: true });
document.addEventListener('pointerup', (event) => {
  if (Math.abs(event.clientY - touchStart) < 80 || event.target.closest('input, button, a, summary')) return;
  const delta = event.clientY < touchStart ? 1 : -1;
  slides[nextIndex(activeIndex, delta, slides.length)]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}, { passive: true });

personaButtons.forEach((button) => button.addEventListener('click', () => {
  personaButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  personaPanels.forEach((panel) => { panel.hidden = panel.dataset.personaPanel !== button.dataset.persona; });
  document.body.dataset.persona = button.dataset.persona;
}));

bindSimulador();
