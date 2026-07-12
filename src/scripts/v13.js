import { bindSimulador } from './simulador-bind.js';
import { clampPercent } from './experiencias-core.js';

const compare = document.querySelector('[data-compare]');
const range = document.querySelector('#v13-divisor');

range?.addEventListener('input', () => {
  const value = clampPercent(range.value);
  compare?.style.setProperty('--split', `${value}%`);
  range.setAttribute('aria-valuetext', `${value}% solução FILL visível`);
});

bindSimulador((result) => {
  const impact = clampPercent((result.plasticoEvitadoKg / 200) * 100);
  document.body.style.setProperty('--v13-impact', `${Math.max(8, impact)}%`);
  document.querySelectorAll('[data-impact-result]').forEach((item, index) => {
    item.style.setProperty('--bar', `${clampPercent(impact + index * 7)}%`);
  });
});
