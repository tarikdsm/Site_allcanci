/**
 * V6 — "Vitrine" · model-viewer com hotspots de ficha técnica.
 * - Auto-rotate lento (pausa na interação, retoma via auto-rotate-delay);
 *   removido por completo em prefers-reduced-motion.
 * - Hotspots posicionados no `load` a partir das dimensões reais do modelo.
 * - Fichas técnicas acessíveis: uma por vez, Esc fecha, foco visível.
 */
import '@google/model-viewer';
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)');

/* ── Modelo 3D ─────────────────────────────────────────────────────── */

const visor = document.querySelector('.v6-visor');

if (visor) {
  // Sem movimento automático quando o visitante prefere menos animação
  const aplicaMovimento = () => {
    if (reduz.matches) visor.removeAttribute('auto-rotate');
    else visor.setAttribute('auto-rotate', '');
  };
  aplicaMovimento();
  reduz.addEventListener?.('change', aplicaMovimento);

  // Posiciona os hotspots a partir da caixa real do modelo (glTF é Y-up).
  // Orientação medida do GLB: a FRENTE (placa FILL, visor, botões) aponta
  // para +X (theta 90° no camera-orbit); +Z é a lateral direita.
  // topo = centro + y/2 (encaixes, levemente para trás);
  // frente = centro + x/2 (visor a ~72% da altura, placa a ~48%).
  visor.addEventListener(
    'load',
    () => {
      const dim = visor.getDimensions();
      const c = visor.getBoundingBoxCenter();
      const pos = (x, y, z) => `${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`;

      visor.updateHotspot({
        name: 'hotspot-encaixes',
        position: pos(c.x - dim.x * 0.16, c.y + dim.y / 2, c.z),
        normal: '0 1 0',
      });
      visor.updateHotspot({
        name: 'hotspot-tela',
        position: pos(c.x + dim.x / 2, c.y + dim.y * 0.22, c.z),
        normal: '1 0 0',
      });
      visor.updateHotspot({
        name: 'hotspot-placa',
        position: pos(c.x + dim.x / 2, c.y - dim.y * 0.02, c.z),
        normal: '1 0 0',
      });
    },
    { once: true }
  );
}

/* ── Fichas técnicas dos hotspots ──────────────────────────────────── */

const hotspots = Array.from(document.querySelectorAll('.v6-hotspot'));
const fichaDe = (botao) => document.getElementById(botao.getAttribute('aria-controls'));

const fechaFichas = () => {
  hotspots.forEach((botao) => {
    botao.setAttribute('aria-expanded', 'false');
    const ficha = fichaDe(botao);
    if (ficha) ficha.hidden = true;
  });
};

hotspots.forEach((botao) => {
  botao.addEventListener('click', () => {
    const estavaAberta = botao.getAttribute('aria-expanded') === 'true';
    fechaFichas();
    if (!estavaAberta) {
      botao.setAttribute('aria-expanded', 'true');
      const ficha = fichaDe(botao);
      if (ficha) {
        ficha.hidden = false;
        ficha.focus({ preventScroll: true });
      }
    }
  });
});

document.querySelectorAll('.v6-ficha-fechar').forEach((fechar) => {
  fechar.addEventListener('click', () => {
    const ficha = fechar.closest('.v6-ficha');
    const dono = hotspots.find((b) => b.getAttribute('aria-controls') === ficha?.id);
    fechaFichas();
    dono?.focus();
  });
});

document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  const aberto = hotspots.find((b) => b.getAttribute('aria-expanded') === 'true');
  if (aberto) {
    fechaFichas();
    aberto.focus();
  }
});

/* ── Revelação suave ao rolar (progressive enhancement) ────────────── */

if (!reduz.matches && 'IntersectionObserver' in window) {
  document.body.classList.add('v6-anima');
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('v6-vista');
          io.unobserve(entrada.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );
  document.querySelectorAll('[data-v6-revela]').forEach((el) => io.observe(el));
}

/* ── Simulador (contrato compartilhado com a V1) ───────────────────── */

bindSimulador();
