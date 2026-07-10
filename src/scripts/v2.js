import { bindSimulador } from './simulador-bind.js';

// Sinaliza que o JS está ativo — o CSS só esconde .v2-revela sob :root.v2-js,
// garantindo que a página fica 100% legível sem JavaScript.
document.documentElement.classList.add('v2-js');

// Revelação editorial ao rolar: fade/slide sutil, seção a seção.
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const alvos = document.querySelectorAll('.v2-revela');

if (reduz || !('IntersectionObserver' in window)) {
  // Movimento reduzido: nada de animação — tudo visível de imediato.
  alvos.forEach((el) => el.classList.add('visivel'));
} else {
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          io.unobserve(entrada.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );
  alvos.forEach((el) => io.observe(el));
}

// Simulador (contrato de markup #sim-* — ver Task 5)
bindSimulador();
