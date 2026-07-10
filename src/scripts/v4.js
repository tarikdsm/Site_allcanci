import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Scrollytelling: .sy-palco (sticky) + .sy-passo[data-etapa] ─────────────
// O palco fica preso na tela enquanto os passos rolam; cada passo que cruza a
// faixa central do viewport assume o comando da cena via palco.dataset.etapa.
const palco = document.querySelector('.sy-palco');
const passos = [...document.querySelectorAll('.sy-passo')];
if (palco && passos.length) {
  if (reduz) {
    palco.dataset.etapa = 'todas'; // CSS mostra a cena final estática com legenda completa
  } else {
    const marca = (alvo) => {
      palco.dataset.etapa = alvo.dataset.etapa;
      passos.forEach((p) => p.classList.toggle('is-ativo', p === alvo));
    };
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) marca(e.target); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    passos.forEach((p) => io.observe(p));
    passos[0].classList.add('is-ativo');
    palco.closest('.v4-sy')?.classList.add('tem-js'); // ativa o esmaecimento dos passos inativos
  }
}
// O anel de progresso de 22s e o medidor de tinta são 100% CSS: as animações
// disparam quando o palco recebe data-etapa="2" (anel) e data-etapa="3" (tinta).

// ── Carrossel de produtos: setas prev/next + estado nas pontas ─────────────
const trilho = document.querySelector('.v4-trilho');
const setaPrev = document.querySelector('.v4-seta--prev');
const setaNext = document.querySelector('.v4-seta--next');
if (trilho && setaPrev && setaNext) {
  const passoTrilho = () => {
    const card = trilho.querySelector('.v4-card');
    const gap = parseFloat(getComputedStyle(trilho).columnGap) || 24;
    return card ? card.getBoundingClientRect().width + gap : trilho.clientWidth * 0.8;
  };
  const atualiza = () => {
    const fim = trilho.scrollWidth - trilho.clientWidth - 2;
    setaPrev.disabled = trilho.scrollLeft <= 2;
    setaNext.disabled = trilho.scrollLeft >= fim;
  };
  const rola = (dir) => trilho.scrollBy({ left: dir * passoTrilho(), behavior: reduz ? 'auto' : 'smooth' });
  setaPrev.addEventListener('click', () => rola(-1));
  setaNext.addEventListener('click', () => rola(1));
  trilho.addEventListener('scroll', () => requestAnimationFrame(atualiza), { passive: true });
  addEventListener('resize', atualiza);
  atualiza();
}

// ── Simulador (contrato de markup #sim-* — ver Task 5) ─────────────────────
bindSimulador();
