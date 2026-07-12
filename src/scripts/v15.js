import { bindSimulador } from './simulador-bind.js';
import { addVisited } from './experiencias-core.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabs = [...document.querySelectorAll('[data-dossier-tab]')];
const checks = [...document.querySelectorAll('[data-check-section]')];
const progress = document.querySelector('[data-check-progress]');
let visited = [];

checks.forEach((check) => check.addEventListener('change', () => {
  check.dataset.userChanged = 'true';
  const total = checks.filter((item) => item.checked).length;
  if (progress) { progress.value = total; progress.textContent = `${total} de ${checks.length}`; }
}));

tabs.forEach((tab) => tab.addEventListener('click', (event) => {
  event.preventDefault();
  const target = document.querySelector(`#${tab.dataset.dossierTab}`);
  const navigate = () => {
    document.body.dataset.document = tab.dataset.dossierTab;
    target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  if (!reduced && document.startViewTransition) document.startViewTransition(navigate);
  else navigate();
}));

const sections = [...document.querySelectorAll('[data-experience-section]')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    visited = addVisited(visited, entry.target.id);
    tabs.forEach((tab) => tab.toggleAttribute('aria-current', tab.dataset.dossierTab === entry.target.id));
    const check = checks.find((item) => item.dataset.checkSection === entry.target.id);
    if (check && check.dataset.userChanged !== 'true') check.checked = true;
    const total = checks.filter((item) => item.checked).length;
    if (progress) { progress.value = total; progress.textContent = `${total} de ${checks.length}`; }
  });
}, { rootMargin: '-25% 0px -60% 0px' });
sections.forEach((section) => observer.observe(section));

bindSimulador();
