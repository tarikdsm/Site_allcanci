import { bindSimulador } from './simulador-bind.js';
import { reais } from './simulador-core.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Traços de marcador (SVG paths com classe .traco): cada path recebe o próprio
// comprimento como dasharray e "se desenha" quando a seção entra na tela.
// Com movimento reduzido, os traços já nascem prontos (dashoffset 0).
document.querySelectorAll('.traco path').forEach((p) => {
  const L = p.getTotalLength();
  p.style.strokeDasharray = String(L);
  p.style.strokeDashoffset = reduz ? '0' : String(L);
});
if (!reduz) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('desenhado');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.4 }
  );
  document.querySelectorAll('.traco').forEach((s) => io.observe(s));
}

// Linha extra da conta do simulador, seguindo o mesmo contrato de markup #sim-*:
// O custo anual dos descartáveis é calculado com as premissas exibidas no simulador.
bindSimulador((r) => {
  const alvo = document.querySelector('#sim-custo-descartaveis');
  if (alvo) alvo.textContent = reais(r.custoDescartaveis);
});
