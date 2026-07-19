import { bindSimulador } from './simulador-bind.js';
import { clampPercent } from './experiencias-core.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- Trilho da fábrica: estações + gota de tinta ---------- */
const rail = document.querySelector('[data-rail]');
const railPaths = rail ? [...rail.querySelectorAll('[data-rail-path]')] : [];
const drop = rail?.querySelector('[data-rail-drop]');
const stationsLayer = rail?.querySelector('[data-rail-stations]');
const sections = [...document.querySelectorAll('[data-experience-section]')];

const activePath = () => railPaths.find((p) => p.getClientRects().length > 0) ?? null;

if (rail && stationsLayer && sections.length > 0) {
  const stations = sections.map(() => {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'v27-rail-station');
    const ping = document.createElementNS(SVG_NS, 'circle');
    ping.setAttribute('class', 'v27-ping');
    ping.setAttribute('r', '12');
    const ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('class', 'v27-ring');
    ring.setAttribute('r', '10');
    const core = document.createElementNS(SVG_NS, 'circle');
    core.setAttribute('class', 'v27-core');
    core.setAttribute('r', '5.5');
    g.append(ping, ring, core);
    stationsLayer.append(g);
    return g;
  });

  const placeStations = () => {
    const path = activePath();
    if (!path) return;
    const len = path.getTotalLength();
    const corr = squashCorrection();
    stations.forEach((g, i) => {
      const pt = path.getPointAtLength(((i + 0.5) / stations.length) * len);
      g.setAttribute('transform', `translate(${pt.x} ${pt.y}) scale(${corr} 1)`);
    });
  };
  // O trilho usa preserveAspectRatio="none": compensa o esmagamento horizontal
  // para que gota e estações fiquem redondas em qualquer largura.
  function squashCorrection() {
    if (!rail) return 1;
    const sx = rail.clientWidth / 120;
    const sy = rail.clientHeight / 1000;
    return sx > 0 ? +(sy / sx).toFixed(3) : 1;
  }
  placeStations();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = sections.indexOf(entry.target);
      entry.target.classList.toggle('v27-on', entry.isIntersecting);
      stations[index]?.classList.toggle('v27-rail-station--on', entry.isIntersecting);
    });
  }, { rootMargin: '-42% 0px -42% 0px' });
  sections.forEach((section) => io.observe(section));

  if (drop && !reduced) {
    let target = 0;
    let current = 0;
    let raf = 0;
    const tick = () => {
      raf = 0;
      current += (target - current) * 0.16;
      if (Math.abs(target - current) <= 0.05) current = target;
      const path = activePath();
      if (path) {
        const pt = path.getPointAtLength((clampPercent(current) / 100) * path.getTotalLength());
        drop.setAttribute('transform', `translate(${pt.x} ${pt.y}) scale(${squashCorrection()} 1)`);
      }
      if (current !== target && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      target = max > 0 ? (scrollY / max) * 100 : 0;
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) onScroll(); });
    onScroll();
  }

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(placeStations, 150);
  });
}

/* ---------- Engenhoca do hero: pausa animações fora da viewport ---------- */
const machine = document.querySelector('[data-machine]');
if (machine) {
  const machineIO = new IntersectionObserver(([entry]) => {
    machine.classList.toggle('v27-machine--paused', !entry.isIntersecting);
  });
  machineIO.observe(machine);
}

/* ---------- Painel de controle (simulador) ---------- */
bindSimulador(() => {
  if (reduced) return;
  const accent = document.querySelector('[data-impact-result="economia"]');
  if (!accent) return;
  accent.classList.remove('v27-result--pulse');
  void accent.offsetWidth;
  accent.classList.add('v27-result--pulse');
});
