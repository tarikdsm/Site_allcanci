import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Chuva digital — canvas estilo Matrix com gotas de tinta
   e símbolos da resistência (22s, FILL, RECARGA).
   Versão reduzida em telas estreitas / ponteiros touch.
   ============================================================ */
const canvas = document.querySelector('[data-rain]');

if (canvas) {
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const hero = canvas.closest('.v16-hero') || canvas;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const TOKENS = ['F', 'I', 'L', '2', '0', '1', '7', '↻', '△', '▼', '●', '▌', '│', 'S'];
    const SINAIS = ['22s', 'FILL', 'RECARGA', 'FILL', '22s'];
    const COR_VERDE = '#00ff60';
    const COR_CIANO = '#43e8ff';
    const COR_ALARME = '#ff0c00';

    let largura = 0;
    let altura = 0;
    let colunas = [];
    let tamFonte = 16;
    let passoMs = 90;

    const escolher = (lista) => lista[Math.floor(Math.random() * lista.length)];
    const sortearCor = () => {
      const r = Math.random();
      if (r < 0.03) return COR_ALARME;
      if (r < 0.18) return COR_CIANO;
      return COR_VERDE;
    };
    const novoEstadoColuna = () => ({
      cor: sortearCor(),
      tinta: Math.random() < 0.12,
      sinal: Math.random() < 0.1,
    });

    const montar = () => {
      const estreito = innerWidth < 720;
      const dpr = Math.min(devicePixelRatio || 1, coarse || estreito ? 1 : 1.5);
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(largura * dpr));
      canvas.height = Math.max(1, Math.round(altura * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tamFonte = estreito ? 13 : 16;
      passoMs = coarse || estreito ? 150 : 90;
      const larguraColuna = tamFonte + (estreito ? 14 : 10);
      const total = Math.max(1, Math.ceil(largura / larguraColuna));
      colunas = Array.from({ length: total }, (_, i) => ({
        x: i * larguraColuna + larguraColuna / 2,
        y: Math.random() * altura,
        velocidade: 0.6 + Math.random() * 0.9,
        ...novoEstadoColuna(),
      }));
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, largura, altura);
    };

    const desenharGota = (x, y, cor) => {
      ctx.fillStyle = cor;
      ctx.beginPath();
      ctx.arc(x, y, tamFonte * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 0.75, y - tamFonte * 1.1, 1.5, tamFonte * 1.1);
    };

    const desenharPasso = () => {
      ctx.fillStyle = 'rgba(5, 6, 10, 0.16)';
      ctx.fillRect(0, 0, largura, altura);
      ctx.font = `600 ${tamFonte}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      for (const c of colunas) {
        ctx.globalAlpha = 0.55 + Math.random() * 0.45;
        if (c.tinta) {
          desenharGota(c.x, c.y, c.cor);
        } else {
          ctx.fillStyle = c.cor;
          ctx.fillText(c.sinal && Math.random() < 0.12 ? escolher(SINAIS) : escolher(TOKENS), c.x, c.y);
        }
        ctx.globalAlpha = 1;
        c.y += c.velocidade * tamFonte;
        if (c.y > altura + tamFonte * 2) {
          c.y = -tamFonte * (1 + Math.random() * 8);
          Object.assign(c, novoEstadoColuna());
        }
      }
    };

    // Fallback estático: uma "fotografia" da chuva para prefers-reduced-motion.
    const quadroEstatico = () => {
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, largura, altura);
      ctx.font = `600 ${tamFonte}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      for (const c of colunas) {
        let y = Math.random() * altura;
        const trilha = 4 + Math.floor(Math.random() * 10);
        for (let i = 0; i < trilha; i += 1) {
          ctx.globalAlpha = Math.max(0.05, 0.7 - i * 0.07);
          ctx.fillStyle = c.cor;
          ctx.fillText(escolher(TOKENS), c.x, y);
          y -= tamFonte * 1.15;
        }
      }
      ctx.globalAlpha = 1;
    };

    let rafId = 0;
    let ultimo = 0;
    let acumulado = 0;
    let rodando = false;
    let visivel = true;

    const tick = (agora) => {
      if (!rodando) return;
      if (!ultimo) ultimo = agora;
      acumulado += agora - ultimo;
      ultimo = agora;
      if (acumulado >= passoMs) {
        acumulado = 0;
        desenharPasso();
      }
      rafId = requestAnimationFrame(tick);
    };
    const iniciar = () => {
      if (rodando || reduced || !visivel || document.hidden) return;
      rodando = true;
      ultimo = 0;
      acumulado = 0;
      rafId = requestAnimationFrame(tick);
    };
    const parar = () => {
      rodando = false;
      cancelAnimationFrame(rafId);
    };

    montar();
    if (reduced) quadroEstatico();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entradas) => {
        visivel = entradas[0]?.isIntersecting ?? true;
        if (visivel) iniciar(); else parar();
      }).observe(hero);
    } else {
      iniciar();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) parar(); else iniciar();
    });

    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        montar();
        if (reduced) quadroEstatico();
      }, 180);
    });
  }
}

/* ============================================================
   Glitch do título — rajadas aleatórias de interferência.
   ============================================================ */
const glitch = document.querySelector('.v16-glitch');
if (glitch && !reduced) {
  const disparar = () => {
    glitch.classList.add('v16-burst');
    setTimeout(() => glitch.classList.remove('v16-burst'), 700);
    setTimeout(disparar, 2600 + Math.random() * 4200);
  };
  setTimeout(disparar, 1800);
}

/* Simulador — flash de fósforo quando a economia é recalculada. */
bindSimulador(() => {
  if (reduced) return;
  const alvo = document.querySelector('#sim-economia');
  if (!alvo) return;
  alvo.classList.remove('v16-flash');
  void alvo.offsetWidth;
  alvo.classList.add('v16-flash');
});
