/*
 * V30 — «UNIVERSO FILL» · o grand finale
 * 1. Simulador (bind compartilhado)
 * 2. HUD de capítulos + trilha de progresso (funciona nos dois modos)
 * 3. Universo three.js em canvas fixo: máquina GLB flutuando no centro,
 *    milhares de partículas de tinta (THREE.Points com shader) e câmera
 *    coreografada pelo scroll entre os capítulos da página.
 *    Fallbacks: prefers-reduced-motion ou falha de WebGL ⇒ body.v30-statica
 *    (pôster estático de src/assets/3d/ + céu de estrelas CSS, sem rAF).
 *    Mobile (pointer coarse / tela estreita): campo de partículas reduzido,
 *    DPR limitado e coreografia sem deslocamento lateral.
 *    O loop pausa quando a página sai da viewport (aba oculta) ou quando o
 *    contexto WebGL é perdido.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bindSimulador } from './simulador-bind.js';

bindSimulador();

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const movelMq = matchMedia('(pointer: coarse)');
const ehMovel = () => movelMq.matches || innerWidth < 760;

/* ── Roteiro dos capítulos (HUD + câmera dividem a mesma lista) ──────
   az = azimute°, el = elevação°, zoom (maior = mais perto),
   des = deslocamento lateral da máquina (fração da largura da tela). */
const CAPITULOS = [
  { id: 'hero', nome: 'Prólogo', az: 0, el: 6, zoom: 1, des: 0 },
  { id: 'gravidade', nome: 'Gravidade', az: -32, el: 10, zoom: 1.12, des: -0.24 },
  { id: 'constelacao', nome: 'Constelação', az: 36, el: 16, zoom: 0.92, des: 0.24 },
  { id: 'produtos', nome: 'Inventário orbital', az: 62, el: 8, zoom: 1.08, des: -0.24 },
  { id: 'como-funciona', nome: 'Órbita do comodato', az: 96, el: 5, zoom: 1.04, des: 0.24 },
  { id: 'simulador', nome: 'Cálculo estelar', az: 18, el: 58, zoom: 1.22, des: -0.22 },
  { id: 'prova-social', nome: 'Sinais de vida', az: -42, el: 12, zoom: 1.02, des: 0.24 },
  { id: 'sustentabilidade', nome: 'Planeta', az: -10, el: 14, zoom: 0.85, des: -0.22 },
  { id: 'faq', nome: 'Transmissões', az: 8, el: 8, zoom: 0.9, des: 0.22 },
  { id: 'contato', nome: 'Contato final', az: 0, el: 3, zoom: 1.42, des: 0 },
];

const secoes = CAPITULOS.map((c) => document.getElementById(c.id));
let ancoras = CAPITULOS.map(() => 0);
const mede = () => {
  ancoras = secoes.map((el) =>
    el ? el.getBoundingClientRect().top + scrollY : Number.POSITIVE_INFINITY
  );
};

const indiceDoFoco = () => {
  const foco = scrollY + innerHeight * 0.42;
  let i = CAPITULOS.length - 1;
  for (let k = 0; k < CAPITULOS.length - 1; k++) {
    if (foco < ancoras[k + 1]) {
      i = k;
      break;
    }
  }
  return i;
};

/* ── HUD + trilha de progresso ────────────────────────────────────── */
const hudCap = document.querySelector('.v30-hud-cap');
const hudNome = document.querySelector('.v30-hud-nome');
const trilha = document.querySelector('.v30-trilha');
let indiceHud = -1;

const atualizaNavegacao = () => {
  const i = indiceDoFoco();
  if (i !== indiceHud) {
    indiceHud = i;
    if (hudCap) {
      hudCap.textContent = `CAP. ${String(i + 1).padStart(2, '0')}/${String(CAPITULOS.length).padStart(2, '0')}`;
    }
    if (hudNome) hudNome.textContent = CAPITULOS[i].nome;
  }
  if (trilha) {
    const limite = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    trilha.style.setProperty('--v30-progresso', Math.min(1, Math.max(0, scrollY / limite)).toFixed(4));
  }
};

let pendente = false;
addEventListener('scroll', () => {
  if (pendente) return;
  pendente = true;
  requestAnimationFrame(() => {
    pendente = false;
    atualizaNavegacao();
  });
}, { passive: true });

mede();
atualizaNavegacao();
addEventListener('load', () => { mede(); atualizaNavegacao(); });
addEventListener('resize', () => { mede(); atualizaNavegacao(); });
if ('ResizeObserver' in window) {
  // Re-mede as âncoras quando o conteúdo muda de altura (imagens, fontes, FAQ)
  new ResizeObserver(mede).observe(document.body);
}

/* ── Universo three.js ────────────────────────────────────────────── */
const canvas = document.querySelector('.v30-canvas');
const estatica = () => document.body.classList.add('v30-statica');

if (reduz || !canvas || !canvas.dataset.glb) {
  estatica();
} else {
  try {
    iniciaUniverso(canvas);
  } catch {
    estatica();
  }
}

function iniciaUniverso(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !ehMovel(),
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, ehMovel() ? 1.5 : 2));

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 400);

  // Luzes: máquina preta sobre o espaço #05060f — hemisfério fria,
  // chave branca, rim ciano e um brilho azul vindo de baixo (nebulosa)
  cena.add(new THREE.HemisphereLight(0x9db8ff, 0x05060f, 1.05));
  const chave = new THREE.DirectionalLight(0xffffff, 2.1);
  chave.position.set(2.4, 3.4, 2.8);
  cena.add(chave);
  const contra = new THREE.DirectionalLight(0x43e8ff, 1.5);
  contra.position.set(-3, 1.6, -2.6);
  cena.add(contra);
  const brilhoAzul = new THREE.PointLight(0x0000fe, 1, 0, 2);
  cena.add(brilhoAzul);

  const grupo = new THREE.Group(); // máquina: giro ocioso + flutuação
  cena.add(grupo);

  let modelo = null;
  let pontos = null;
  let maiorDim = 1;
  let distancia = 3;
  let quadro = 0;
  let anterior = 0;

  const ajustaDistancia = () => {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distAltura = maiorDim / (2 * Math.tan(fov / 2));
    const distLargura = distAltura / camera.aspect;
    distancia = 1.25 * Math.max(distAltura, distLargura);
  };

  const redimensiona = () => {
    const w = Math.max(1, innerWidth);
    const h = Math.max(1, innerHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (pontos) {
      pontos.material.uniforms.uEscala.value =
        (canvas.height * 0.5) / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    }
    if (modelo) ajustaDistancia();
    mede();
  };

  /* Campo de partículas de tinta: casca esférica achatada em volta da
     máquina. 55% ciano, 33% azul, 12% amarelo — versão reduzida no mobile. */
  const PALETA = [new THREE.Color(0x43e8ff), new THREE.Color(0x0000fe), new THREE.Color(0xffd100)];
  const criaParticulas = () => {
    const total = ehMovel() ? 800 : 2600;
    const pos = new Float32Array(total * 3);
    const cor = new Float32Array(total * 3);
    const tam = new Float32Array(total);
    const fase = new Float32Array(total);
    const rMin = distancia * 0.4;
    const rMax = distancia * 1.2;
    for (let i = 0; i < total; i++) {
      const r = rMin + Math.pow(Math.random(), 0.72) * (rMax - rMin);
      const theta = Math.random() * Math.PI * 2;
      const yy = (Math.random() * 2 - 1) * 0.62;
      const horiz = Math.sqrt(Math.max(0, 1 - yy * yy));
      pos[i * 3] = r * horiz * Math.cos(theta);
      pos[i * 3 + 1] = r * yy;
      pos[i * 3 + 2] = r * horiz * Math.sin(theta);
      const sorte = Math.random();
      const c = sorte < 0.55 ? PALETA[0] : sorte < 0.88 ? PALETA[1] : PALETA[2];
      cor[i * 3] = c.r;
      cor[i * 3 + 1] = c.g;
      cor[i * 3 + 2] = c.b;
      // Azul puro é escuro em blending aditivo: partículas azuis são maiores
      tam[i] = maiorDim * (0.014 + Math.random() * 0.03) * (c === PALETA[1] ? 1.7 : 1);
      fase[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aCor', new THREE.BufferAttribute(cor, 3));
    geo.setAttribute('aTamanho', new THREE.BufferAttribute(tam, 1));
    geo.setAttribute('aFase', new THREE.BufferAttribute(fase, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uTempo: { value: 0 }, uEscala: { value: 600 } },
      vertexShader: `
        attribute vec3 aCor;
        attribute float aTamanho;
        attribute float aFase;
        uniform float uTempo;
        uniform float uEscala;
        varying vec3 vCor;
        varying float vPulso;
        void main() {
          vCor = aCor;
          vec3 p = position;
          p.y += sin(uTempo * 0.4 + aFase) * 0.05 * length(position);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vPulso = 0.7 + 0.3 * sin(uTempo * 1.5 + aFase * 3.1);
          float tamanho = aTamanho * vPulso * uEscala / max(0.001, -mv.z);
          gl_PointSize = clamp(tamanho, 1.0, 90.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vCor;
        varying float vPulso;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          float alfa = smoothstep(0.5, 0.08, d);
          if (alfa < 0.02) discard;
          gl_FragColor = vec4(vCor, alfa * (0.5 + 0.5 * vPulso));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(geo, material);
    p.frustumCulled = false; // a casca inteira pode sair do frustum da bounding sphere
    return p;
  };

  /* Câmera: alvo derivado do scroll (interpola entre capítulos vizinhos) */
  const suaviza = (t) => t * t * (3 - 2 * t);
  const mistura = (a, b, t) => a + (b - a) * t;
  const alvoDeScroll = () => {
    const i = indiceDoFoco();
    if (i >= CAPITULOS.length - 1) return CAPITULOS[CAPITULOS.length - 1];
    const a = CAPITULOS[i];
    const b = CAPITULOS[i + 1];
    const trecho = Math.max(1, ancoras[i + 1] - ancoras[i]);
    const foco = scrollY + innerHeight * 0.42;
    const t = suaviza(Math.min(1, Math.max(0, (foco - ancoras[i]) / trecho)));
    return {
      az: mistura(a.az, b.az, t),
      el: mistura(a.el, b.el, t),
      zoom: mistura(a.zoom, b.zoom, t),
      des: mistura(a.des, b.des, t),
    };
  };

  const vivo = { az: CAPITULOS[0].az, el: CAPITULOS[0].el, zoom: CAPITULOS[0].zoom, des: 0 };
  const alvoOlhar = new THREE.Vector3();
  const direcao = new THREE.Vector3();
  const direita = new THREE.Vector3();

  const posicionaCamera = () => {
    const azr = THREE.MathUtils.degToRad(vivo.az);
    const elr = THREE.MathUtils.degToRad(vivo.el);
    const d = distancia / vivo.zoom;
    camera.position.set(
      d * Math.sin(azr) * Math.cos(elr),
      d * Math.sin(elr),
      d * Math.cos(azr) * Math.cos(elr)
    );
    alvoOlhar.set(0, 0, 0);
    // Deslocamento lateral: a máquina cede a coluna do texto (só desktop)
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

  const desenha = (agora) => {
    quadro = requestAnimationFrame(desenha);
    const dt = Math.min(0.1, (agora - anterior) / 1000 || 0.016);
    anterior = agora;
    const f = 1 - Math.pow(0.94, dt * 60); // ~0.06 a 60 fps

    const alvo = alvoDeScroll();
    vivo.az += (alvo.az - vivo.az) * f;
    vivo.el += (alvo.el - vivo.el) * f;
    vivo.zoom += (alvo.zoom - vivo.zoom) * f;
    const desAlvo = ehMovel() ? 0 : alvo.des;
    vivo.des += (desAlvo - vivo.des) * f;
    posicionaCamera();

    grupo.rotation.y += dt * 0.14; // giro ocioso da máquina
    grupo.position.y = Math.sin(agora * 0.00045) * maiorDim * 0.045; // flutuação
    if (pontos) {
      pontos.rotation.y -= dt * 0.022; // contra-rotação lenta do enxame
      pontos.material.uniforms.uTempo.value = agora / 1000;
    }
    renderer.render(cena, camera);
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

  // Pausa o rAF quando a página sai da viewport (aba/janela oculta)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) desliga();
    else liga();
  });
  canvas.addEventListener('webglcontextlost', (evento) => {
    evento.preventDefault();
    desliga();
    estatica();
  });
  addEventListener('resize', redimensiona);
  movelMq.addEventListener('change', redimensiona);
  redimensiona();

  new GLTFLoader().load(
    canvas.dataset.glb,
    (gltf) => {
      modelo = gltf.scene;
      // Centraliza pela bounding box — nunca coordenadas fixas
      const caixa = new THREE.Box3().setFromObject(modelo);
      const centro = caixa.getCenter(new THREE.Vector3());
      modelo.position.sub(centro);
      const tamanho = caixa.getSize(new THREE.Vector3());
      maiorDim = Math.max(tamanho.x, tamanho.y, tamanho.z);
      grupo.add(modelo);

      // Nebulosa azul sob a máquina, proporcional ao tamanho dela
      brilhoAzul.position.set(0, -0.85 * maiorDim, 0.75 * maiorDim);
      brilhoAzul.intensity = 20 * maiorDim * maiorDim;

      ajustaDistancia();
      camera.near = distancia / 80;
      camera.far = distancia * 8;
      camera.updateProjectionMatrix();

      pontos = criaParticulas();
      cena.add(pontos);

      redimensiona();
      mede();
      posicionaCamera();
      renderer.render(cena, camera);

      document.body.classList.add('v30-3d-pronto'); // esmaece o pôster
      liga();
    },
    undefined,
    () => estatica() // erro de carga: pôster estático permanece
  );
}
