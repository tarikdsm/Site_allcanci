import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const map = document.querySelector('[data-campus-map]');
const hotspots = [...document.querySelectorAll('[data-campus-target]')];

hotspots.forEach((hotspot) => hotspot.addEventListener('click', () => {
  const target = document.querySelector(`#${hotspot.dataset.campusTarget}`);
  target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

const observed = hotspots.map((hotspot) => document.querySelector(`#${hotspot.dataset.campusTarget}`)).filter(Boolean);
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    map?.setAttribute('data-active-zone', entry.target.id);
    hotspots.forEach((hotspot) => hotspot.toggleAttribute('aria-current', hotspot.dataset.campusTarget === entry.target.id));
  });
}, { rootMargin: '-30% 0px -55% 0px' });
observed.forEach((section) => observer.observe(section));

bindSimulador();
