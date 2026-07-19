import { bindSimulador } from './simulador-bind.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal tipográfico: palavras que entram coreografadas pelo scroll.
   Sem JS ou com reduced-motion o conteúdo permanece visível (o estado
   oculto só existe sob body.v26-motion, adicionada aqui). */
if (!reduced) {
  document.body.classList.add('v26-motion');
  const alvos = [
    ...document.querySelectorAll(
      '[data-kinetic], .v26-eyebrow, .v26-title, .v26-lead, .v26-product, .v26-step, .v26-process-photo, .v26-simulator, .v26-proof-number, .v26-badges, .v26-testimonials li, .v26-eco-card, .v26-faq details, .v26-contact-card'
    ),
  ];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
  );
  alvos.forEach((el) => {
    el.classList.add('v26-k');
    io.observe(el);
  });
}

/* Drift horizontal: palavras que deslizam com o progresso do scroll. */
const drifters = [...document.querySelectorAll('[data-drift]')];
if (!reduced && drifters.length > 0) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const escala = Math.min(innerWidth / 1200, 1); // menos deslocamento no mobile
    drifters.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const progresso = (r.top + r.height / 2 - vh / 2) / vh;
      const velocidade = parseFloat(el.dataset.drift) || 1;
      const x = (progresso * velocidade * -110 * escala).toFixed(1);
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    });
  };
  const pedirUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', pedirUpdate, { passive: true });
  addEventListener('resize', pedirUpdate);
  update();
}

/* Cursor customizado: apenas pointer fino, pausado com a aba oculta. */
const pointerFino = matchMedia('(pointer: fine)').matches;
if (!reduced && pointerFino) {
  const cursor = document.createElement('div');
  cursor.className = 'v26-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let alvoX = x;
  let alvoY = y;
  let raf = 0;
  const loop = () => {
    x += (alvoX - x) * 0.2;
    y += (alvoY - y) * 0.2;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  };
  addEventListener('mousemove', (e) => {
    alvoX = e.clientX;
    alvoY = e.clientY;
    cursor.classList.add('is-on');
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
  addEventListener('mouseover', (e) => {
    cursor.classList.toggle('is-link', !!e.target.closest('a, button, summary, input, [role="button"]'));
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(loop);
  });
  raf = requestAnimationFrame(loop);
}

/* Simulador: ao atualizar, os números dão um "salto" tipográfico. */
bindSimulador(() => {
  if (reduced) return;
  document.querySelectorAll('.v26-result dd').forEach((dd) => {
    dd.animate(
      [{ transform: 'translateY(6px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  });
});
