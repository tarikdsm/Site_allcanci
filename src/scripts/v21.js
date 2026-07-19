import { bindSimulador } from './simulador-bind.js';
import { reais } from './simulador-core.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------- Campo de estrelas: 3 camadas com parallax por rolagem ---------- */
const canvas = document.querySelector('[data-v21-stars]');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cores = ['#fefff0', '#fefff0', '#fefff0', '#43e8ff', '#7b8cff'];
  const camadas = [
    { fator: 0.1, raio: 0.9, brilho: 0.45 },
    { fator: 0.25, raio: 1.4, brilho: 0.7 },
    { fator: 0.5, raio: 2.1, brilho: 1 },
  ];
  let largura = 0;
  let altura = 0;
  let estrelas = [];
  let meteoros = [];
  let ultimoMeteoro = 0;
  let rodando = false;

  const montar = () => {
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const densidade = coarse || largura < 720 ? 16000 : 8500;
    const total = Math.min(320, Math.max(90, Math.round((largura * altura) / densidade)));
    estrelas = Array.from({ length: total }, (_, i) => ({
      x: Math.random() * largura,
      y: Math.random() * altura,
      camada: i % 3,
      pulso: Math.random() * Math.PI * 2,
      ritmo: 0.4 + Math.random() * 1.2,
      cor: cores[(Math.random() * cores.length) | 0],
    }));
  };

  const desenhar = (tempo) => {
    const rolagem = window.scrollY || 0;
    ctx.clearRect(0, 0, largura, altura);
    for (const e of estrelas) {
      const c = camadas[e.camada];
      const y = (((e.y - rolagem * c.fator) % altura) + altura) % altura;
      const cintilacao = 0.55 + 0.45 * Math.sin(tempo * 0.001 * e.ritmo + e.pulso);
      ctx.globalAlpha = c.brilho * cintilacao;
      ctx.fillStyle = e.cor;
      ctx.beginPath();
      ctx.arc(e.x, y, c.raio, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!coarse) {
      if (tempo - ultimoMeteoro > 5200 + Math.random() * 3500 && meteoros.length < 2) {
        meteoros.push({
          x: largura * (0.25 + Math.random() * 0.7),
          y: -20,
          vx: -(2.2 + Math.random() * 2),
          vy: 1.6 + Math.random(),
          vida: 1,
        });
        ultimoMeteoro = tempo;
      }
      meteoros = meteoros.filter((m) => m.vida > 0 && m.y < altura + 40);
      for (const m of meteoros) {
        m.x += m.vx;
        m.y += m.vy;
        m.vida -= 0.012;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
        grad.addColorStop(0, `rgba(254,255,240,${(0.8 * m.vida).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(67,232,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
        ctx.stroke();
      }
    }
  };

  const quadro = (tempo) => {
    if (!rodando) return;
    desenhar(tempo);
    requestAnimationFrame(quadro);
  };
  const iniciar = () => {
    if (!rodando && !document.hidden) {
      rodando = true;
      requestAnimationFrame(quadro);
    }
  };
  const parar = () => {
    rodando = false;
  };

  montar();
  if (reduced) {
    desenhar(0); // céu estático, sem parallax nem cintilação
    window.addEventListener('resize', () => {
      montar();
      desenhar(0);
    });
  } else {
    document.addEventListener('visibilitychange', () => (document.hidden ? parar() : iniciar()));
    window.addEventListener('resize', montar);
    iniciar();
  }
}

/* ---------- Telemetria lateral + parallax suave ---------- */
const altitude = document.querySelector('[data-v21-altitude]');
const barra = document.querySelector('[data-v21-alt-bar]');
const sistema = document.querySelector('[data-v21-system]');
const nebulas = [...document.querySelectorAll('[data-v21-nebula]')];
let pendente = false;
const atualizarDescida = () => {
  pendente = false;
  const rolagem = window.scrollY || 0;
  const maximo = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progresso = Math.min(1, Math.max(0, rolagem / maximo));
  const km = Math.round((1 - progresso) * 400);
  if (altitude) altitude.textContent = km > 0 ? `${km} km` : 'POUSO';
  if (barra) barra.style.height = `${progresso * 100}%`;
  if (!reduced) {
    if (sistema) sistema.style.transform = `translateY(${(rolagem * 0.05).toFixed(1)}px)`;
    nebulas.forEach((n, i) => {
      n.style.transform = `translateY(${(rolagem * (i % 2 === 0 ? -0.04 : 0.03)).toFixed(1)}px)`;
    });
  }
};
const aoRolar = () => {
  if (!pendente) {
    pendente = true;
    requestAnimationFrame(atualizarDescida);
  }
};
window.addEventListener('scroll', aoRolar, { passive: true });
window.addEventListener('resize', aoRolar);
atualizarDescida();

/* ---------- Revelação ao rolar ---------- */
if (!reduced) {
  const alvos = [
    ...document.querySelectorAll(
      '.v21-product, .v21-step, .v21-eco-card, .v21-badge, .v21-result, .v21-faq details, .v21-constellation li, .v21-testimonials li',
    ),
  ];
  alvos.forEach((el, i) => {
    el.setAttribute('data-v21-reveal', '');
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
  });
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('v21-in');
          io.unobserve(entrada.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );
  alvos.forEach((el) => io.observe(el));
}

/* ---------- Simulador + economia na telemetria ---------- */
const economiaEl = document.querySelector('[data-v21-economia]');
bindSimulador((r) => {
  if (economiaEl) economiaEl.textContent = reais(r.economia);
});
