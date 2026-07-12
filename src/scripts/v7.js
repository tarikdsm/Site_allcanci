/**
 * V7 — "Linha de Produção"
 * Máquina FILL 3D (three.js) em canvas fixo atrás do conteúdo, com câmera
 * coreografada pelo scroll entre waypoints por seção + HUD técnico.
 * prefers-reduced-motion ou falha de WebGL ⇒ body.v7-sem-3d (render estático).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bindSimulador } from './simulador-bind.js';

bindSimulador();

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('.v7-canvas');

if (!canvas || reduz) {
  document.body.classList.add('v7-sem-3d');
} else {
  try {
    inicia3d(canvas);
  } catch {
    document.body.classList.add('v7-sem-3d');
  }
}

function inicia3d(canvas) {
  const palco = canvas.parentElement;
  const hud = document.querySelector('.v7-hud');
  const movel = matchMedia('(max-width: 719.98px)');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 200);

  // Luzes: máquina preta sobre papel claro — hemisfério + chave + contra
  cena.add(new THREE.HemisphereLight(0xffffff, 0xc8c2b0, 1.0));
  const chave = new THREE.DirectionalLight(0xffffff, 2.2);
  chave.position.set(-3.5, 5, 4.5); // frente, alto, esquerda
  cena.add(chave);
  const contra = new THREE.DirectionalLight(0xffffff, 1.2);
  contra.position.set(4, 2.5, -4); // recorte por trás, direita
  cena.add(contra);

  /* Waypoints da coreografia (azimute°, elevação°, zoom, deslocamento
     horizontal em fração da largura da tela), casados com as seções:
     hero=frontal → produtos=¾ esq. → como-funciona=perfil → simulador=topo
     (7 encaixes) → prova-social=¾ dir. → sustentabilidade/faq=frontal
     afastada → contato=frente próxima. */
  const ROTEIRO = [
    { id: 'hero', az: 0, el: 8, zoom: 1.0, des: 0.24 },
    { id: 'produtos', az: 38, el: 12, zoom: 1.12, des: -0.26 },
    { id: 'como-funciona', az: 92, el: 6, zoom: 1.05, des: 0.26 },
    { id: 'simulador', az: 20, el: 64, zoom: 1.2, des: -0.26 },
    { id: 'prova-social', az: -38, el: 12, zoom: 1.12, des: 0.26 },
    { id: 'sustentabilidade', az: -8, el: 10, zoom: 0.82, des: -0.24 },
    { id: 'faq', az: 6, el: 10, zoom: 0.85, des: 0.24 },
    { id: 'contato', az: 0, el: 4, zoom: 1.5, des: 0 },
  ];
  const secoes = ROTEIRO.map((p) => document.getElementById(p.id));

  let modelo = null;
  let maiorDim = 1; // maior dimensão da bounding box do modelo
  let distancia = 3; // distância de enquadramento (recalculada por aspect)
  let ancoras = ROTEIRO.map(() => 0); // offsetTop de cada seção

  const mede = () => {
    // Posição de cada seção em coordenadas do documento
    ancoras = secoes.map((el) => (el ? el.getBoundingClientRect().top + scrollY : 0));
  };

  const ajustaDistancia = () => {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distAltura = maiorDim / (2 * Math.tan(fov / 2));
    const distLargura = distAltura / camera.aspect;
    distancia = 1.3 * Math.max(distAltura, distLargura);
  };

  const redimensiona = () => {
    const r = palco.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (modelo) ajustaDistancia();
    mede();
  };

  const suaviza = (t) => t * t * (3 - 2 * t); // smoothstep
  const mistura = (a, b, t) => a + (b - a) * t;

  // Alvo da câmera a partir do progresso de scroll entre as seções
  const alvoDeScroll = () => {
    const foco = scrollY + innerHeight * 0.38;
    let i = ROTEIRO.length - 1;
    for (let k = 0; k < ROTEIRO.length - 1; k++) {
      if (foco < ancoras[k + 1]) {
        i = k;
        break;
      }
    }
    if (i >= ROTEIRO.length - 1) return ROTEIRO[ROTEIRO.length - 1];
    const trecho = Math.max(1, ancoras[i + 1] - ancoras[i]);
    const t = suaviza(Math.min(1, Math.max(0, (foco - ancoras[i]) / trecho)));
    const a = ROTEIRO[i];
    const b = ROTEIRO[i + 1];
    return {
      az: mistura(a.az, b.az, t),
      el: mistura(a.el, b.el, t),
      zoom: mistura(a.zoom, b.zoom, t),
      des: mistura(a.des, b.des, t),
    };
  };

  // Estado vivo da câmera (persegue o alvo com lerp por frame).
  // No mobile o palco é centralizado: o primeiro frame já nasce alinhado
  // ao poster de carregamento (sem "dupla exposição" deslocada).
  const inicial = movel.matches
    ? { az: 0, el: 12, zoom: 1.05, des: 0 }
    : ROTEIRO[0];
  const vivo = { az: inicial.az, el: inicial.el, zoom: inicial.zoom, des: inicial.des };
  const alvoOlhar = new THREE.Vector3();
  const direcao = new THREE.Vector3();
  const direita = new THREE.Vector3();

  const posicionaCamera = () => {
    const azr = THREE.MathUtils.degToRad(vivo.az);
    const elr = THREE.MathUtils.degToRad(vivo.el);
    const d = distancia / vivo.zoom;

    // Órbita em volta do centro do modelo (origem — modelo centralizado no load)
    camera.position.set(
      d * Math.sin(azr) * Math.cos(elr),
      d * Math.sin(elr),
      d * Math.cos(azr) * Math.cos(elr)
    );
    alvoOlhar.set(0, 0, 0);

    // Deslocamento horizontal: a máquina ocupa a coluna vazia ao lado dos cartões
    if (vivo.des) {
      const larguraMundo = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect;
      const desloc = -vivo.des * larguraMundo;
      direcao.subVectors(alvoOlhar, camera.position).normalize();
      direita.crossVectors(direcao, camera.up).normalize();
      camera.position.addScaledVector(direita, desloc);
      alvoOlhar.addScaledVector(direita, desloc);
    }
    camera.lookAt(alvoOlhar);
  };

  const grau = (v) => (((v % 360) + 360) % 360).toFixed(1).padStart(5, '0');

  const atualizaHud = () => {
    if (!hud) return;
    hud.textContent =
      `AZ ${grau(vivo.az)}° · EL ${Math.abs(vivo.el).toFixed(1).padStart(4, '0')}° · ` +
      `ZOOM ${vivo.zoom.toFixed(2)}×`;
  };

  let quadro = 0;
  let anterior = 0;

  const desenha = (agora) => {
    quadro = requestAnimationFrame(desenha);
    const dt = Math.min(0.1, (agora - anterior) / 1000 || 0.016);
    anterior = agora;
    const f = 1 - Math.pow(0.94, dt * 60); // fator ~0.06 a 60 fps

    if (movel.matches) {
      // Mobile: palco estático no hero com rotação ociosa lenta
      vivo.az += 9 * dt;
      vivo.el += (12 - vivo.el) * f;
      vivo.zoom += (1.05 - vivo.zoom) * f;
      vivo.des += (0 - vivo.des) * f;
    } else {
      const alvo = alvoDeScroll();
      vivo.az += (alvo.az - vivo.az) * f;
      vivo.el += (alvo.el - vivo.el) * f;
      vivo.zoom += (alvo.zoom - vivo.zoom) * f;
      vivo.des += (alvo.des - vivo.des) * f;
    }

    posicionaCamera();
    renderer.render(cena, camera);
    atualizaHud();
  };

  const liga = () => {
    if (!quadro && modelo && !document.hidden) {
      anterior = performance.now();
      quadro = requestAnimationFrame(desenha);
    }
  };

  const desliga = () => {
    if (quadro) {
      cancelAnimationFrame(quadro);
      quadro = 0;
    }
  };

  // Pausa o loop quando a aba fica oculta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) desliga();
    else liga();
  });

  addEventListener('resize', redimensiona);
  movel.addEventListener('change', () => {
    // Normaliza o azimute acumulado pela rotação ociosa ao voltar ao desktop
    vivo.az = ((vivo.az % 360) + 360) % 360;
    if (vivo.az > 180) vivo.az -= 360;
    redimensiona();
  });
  if ('ResizeObserver' in window) {
    // Re-mede as âncoras quando o conteúdo muda de altura (imagens, fontes, FAQ)
    new ResizeObserver(mede).observe(document.body);
  }
  redimensiona();

  new GLTFLoader().load(
    canvas.dataset.glb,
    (gltf) => {
      modelo = gltf.scene;
      // Centraliza o modelo na origem e mede a bounding box (nada chumbado)
      const caixa = new THREE.Box3().setFromObject(modelo);
      const centro = caixa.getCenter(new THREE.Vector3());
      modelo.position.sub(centro);
      const tamanho = caixa.getSize(new THREE.Vector3());
      maiorDim = Math.max(tamanho.x, tamanho.y, tamanho.z);
      cena.add(modelo);

      ajustaDistancia();
      mede();
      posicionaCamera();
      renderer.render(cena, camera);

      // Revela o canvas (o poster de carregamento some em CSS) e inicia o loop
      document.body.classList.add('v7-3d-pronto');
      liga();
    },
    undefined,
    () => document.body.classList.add('v7-sem-3d')
  );
}
