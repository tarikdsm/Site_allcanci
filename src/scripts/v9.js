// V9 — "Levitação": model-viewer + AR real + órbita por scroll +
// números do simulador com contagem suave.
import '@google/model-viewer';
import { bindSimulador } from './simulador-bind.js';
import { reais } from './simulador-core.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mv = document.querySelector('#v9-mv');

/* ── Revelação suave ao rolar ─────────────────────────────────
   A classe no body só entra com JS ativo (e sem reduced-motion):
   sem JS, nada fica escondido. */
if (!reduz) {
  document.body.classList.add('v9-anima');
  const ioReveal = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('v9-visivel');
          ioReveal.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => ioReveal.observe(el));
}

/* ── Contadores dos chips de vidro do hero ───────────────── */
const conta = (el) => {
  const alvo = parseFloat(el.dataset.contador);
  const t0 = performance.now();
  const dur = 1200;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    if (p >= 1) {
      // Quadro final: valor-alvo EXATO, verbatim do data-attribute.
      el.textContent = el.dataset.prefixo + el.dataset.contador + (el.dataset.sufixo ?? '');
      return;
    }
    el.textContent =
      el.dataset.prefixo + Math.round(alvo * (1 - Math.pow(1 - p, 3))) + (el.dataset.sufixo ?? '');
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const ioConta = new IntersectionObserver((es) =>
  es.forEach((e) => {
    if (e.isIntersecting) {
      conta(e.target);
      ioConta.unobserve(e.target);
    }
  })
);
document.querySelectorAll('[data-contador]').forEach((el) => {
  el.dataset.prefixo = el.dataset.prefixo ?? '';
  if (reduz) el.textContent = el.dataset.prefixo + el.dataset.contador + (el.dataset.sufixo ?? '');
  else ioConta.observe(el);
});

/* ── AR: botão "tamanho real" ou chip informativo ─────────── */
const botaoAr = document.querySelector('#v9-ar');
const chipAr = document.querySelector('#v9-ar-chip');
if (mv && botaoAr && chipAr) {
  botaoAr.addEventListener('click', () => mv.activateAR());
  mv.addEventListener(
    'load',
    () => {
      if (mv.canActivateAR) botaoAr.hidden = false;
      else chipAr.hidden = false;
    },
    { once: true }
  );
}

/* ── Pausa a levitação quando o hero sai da tela (economia) ── */
const flutua = document.querySelector('#v9-flutua');
const sombra = document.querySelector('.v9-palco-sombra');
if (flutua && !reduz) {
  const ioFlutua = new IntersectionObserver((es) =>
    es.forEach((e) => {
      const estado = e.isIntersecting ? 'running' : 'paused';
      flutua.style.animationPlayState = estado;
      if (sombra) sombra.style.animationPlayState = estado;
    })
  );
  ioFlutua.observe(flutua);
}

/* ── Órbita por scroll ────────────────────────────────────────
   Neste GLB a FRENTE da máquina (placa FILL, visor, botões) fica
   em theta = 90°. Do topo do hero até o fim de #como-funciona, o
   theta vai de 65° a 115° (centrado na frente) e o raio aproxima
   de 105% para 90%. O próprio model-viewer suaviza
   (interpolation-decay). Pausado enquanto o visitante arrasta o
   modelo; desligado em reduced-motion. */
if (mv && !reduz) {
  const secaoFim = document.querySelector('#como-funciona');
  let agendado = false;
  let arrastando = false;
  let ultimoP = -1;

  mv.addEventListener('pointerdown', () => {
    arrastando = true;
  });
  addEventListener('pointerup', () => {
    arrastando = false;
    ultimoP = -1; // força ressincronizar na próxima rolagem
  });
  addEventListener('pointercancel', () => {
    arrastando = false;
    ultimoP = -1;
  });

  const orbita = () => {
    agendado = false;
    if (arrastando || !secaoFim) return;
    const fim = secaoFim.getBoundingClientRect().bottom + scrollY - innerHeight;
    const p = Math.min(Math.max(scrollY / Math.max(fim, 1), 0), 1);
    if (Math.abs(p - ultimoP) < 0.002) return;
    ultimoP = p;
    const theta = 65 + 50 * p;
    const raio = 105 - 15 * p;
    mv.cameraOrbit = `${theta.toFixed(2)}deg 78deg ${raio.toFixed(1)}%`;
  };

  addEventListener(
    'scroll',
    () => {
      if (!agendado) {
        agendado = true;
        requestAnimationFrame(orbita);
      }
    },
    { passive: true }
  );
}

/* ── Simulador: contagem suave até o novo valor (~300 ms) ──── */
const formatadores = {
  'sim-recargas': (v) => Math.round(v).toLocaleString('pt-BR'),
  'sim-custo-fill': (v) => reais(v),
  'sim-descartaveis': (v) => Math.round(v).toLocaleString('pt-BR'),
  'sim-plastico': (v) => `${(Math.round(v * 100) / 100).toLocaleString('pt-BR')} kg`,
  'sim-economia': (v) => reais(v),
};
const valoresAtuais = new Map();
const quadrosAtivos = new Map();

const animaNumero = (id, alvo) => {
  const el = document.getElementById(id);
  const formata = formatadores[id];
  if (!el || !formata) return;
  const de = valoresAtuais.get(id);
  valoresAtuais.set(id, alvo);
  // Primeiro render, valor igual ou reduced-motion: aplica direto.
  if (reduz || de === undefined || de === alvo) {
    el.textContent = formata(alvo);
    return;
  }
  cancelAnimationFrame(quadrosAtivos.get(id));
  const t0 = performance.now();
  const dur = 300;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    if (p >= 1) {
      // Quadro final: formata o valor-alvo EXATO (sem interpolação).
      el.textContent = formata(alvo);
      return;
    }
    const suave = 1 - Math.pow(1 - p, 3);
    el.textContent = formata(de + (alvo - de) * suave);
    quadrosAtivos.set(id, requestAnimationFrame(tick));
  };
  quadrosAtivos.set(id, requestAnimationFrame(tick));
};

bindSimulador((r) => {
  animaNumero('sim-recargas', r.recargasAno);
  animaNumero('sim-custo-fill', r.custoFill);
  animaNumero('sim-descartaveis', r.descartaveis);
  animaNumero('sim-plastico', r.plasticoEvitadoKg);
  animaNumero('sim-economia', r.economia);
});
