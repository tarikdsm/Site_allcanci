import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal dos painéis/páginas ao rolar — o CSS só esconde quando body tem .v29-arm */
if (!reduced) {
  document.body.classList.add('v29-arm');
  const alvos = [...document.querySelectorAll('.v29-section, .v29-panel')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('v29-inked');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  alvos.forEach((el) => io.observe(el));
}

/* Onomatopeia estourando no quadro de economia do simulador */
const bursts = ['BOOM!', 'KA-CHING!', 'WOW!', 'ZAS!', 'PAF!'];
let burstIndex = 0;
const accent = document.querySelector('.v29-result-accent');

bindSimulador(() => {
  if (!accent || reduced) return;
  accent.dataset.burst = bursts[burstIndex % bursts.length];
  burstIndex += 1;
  accent.classList.remove('v29-pop');
  void accent.offsetWidth; /* reinicia a animação */
  accent.classList.add('v29-pop');
});
