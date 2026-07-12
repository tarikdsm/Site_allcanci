/*
 * V10 — "FILL OS"
 * 1. Relógio HH:MM:SS da barra de status
 * 2. Boot log digitado linha a linha (com fallback para reduced-motion)
 * 3. VISOR.3D — three.js com modos SÓLIDO / ARAME / RAIO-X
 * 4. Simulador (bind compartilhado) + eco no prompt e barra de progresso
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. Relógio da barra de status ────────────────────────── */

const relogio = document.getElementById('v10-relogio');
if (relogio) {
  const tique = () => {
    relogio.textContent = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  };
  tique();
  setInterval(tique, 1000);
}

/* ── 2. Boot log ──────────────────────────────────────────── */

(function iniciaBoot() {
  const boot = document.getElementById('v10-boot');
  if (!boot) return;
  const linhas = [...boot.querySelectorAll('.v10-boot-linha')];
  if (!linhas.length) return;

  // Sem animação: tudo visível estaticamente (estado renderizado no servidor)
  if (reduz) {
    boot.classList.add('is-pronto');
    return;
  }

  boot.classList.add('is-anim');
  boot.setAttribute('aria-hidden', 'true'); // evita leitura parcial durante a digitação

  // Coleta os nós de texto de cada linha (preservando os spans coloridos),
  // guarda o conteúdo original e esvazia para digitar de volta.
  const dados = linhas.map((linha) => {
    const nos = [];
    (function coleta(el) {
      el.childNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) nos.push(n);
        else if (n.nodeType === Node.ELEMENT_NODE) coleta(n);
      });
    })(linha);
    const textos = nos.map((n) => n.nodeValue);
    nos.forEach((n) => {
      n.nodeValue = '';
    });
    return { linha, nos, textos };
  });

  let indice = 0;
  let pulou = false;

  const encerra = () => {
    dados.forEach(({ linha, nos, textos }) => {
      nos.forEach((n, i) => {
        n.nodeValue = textos[i];
      });
      linha.classList.add('is-on');
      linha.classList.remove('is-digitando');
    });
    boot.classList.remove('is-anim');
    boot.classList.add('is-pronto');
    boot.removeAttribute('aria-hidden');
  };

  // Um toque no painel pula a animação
  boot.addEventListener('pointerdown', () => {
    pulou = true;
  }, { once: true });

  const digitaLinha = ({ linha, nos, textos }, fim) => {
    linha.classList.add('is-on', 'is-digitando');
    let i = 0;
    let j = 0;
    const passo = () => {
      if (pulou) {
        encerra();
        return;
      }
      // Completa nós já esgotados e pula trechos só de espaço em branco
      while (i < nos.length && (j >= textos[i].length || textos[i].trim() === '')) {
        nos[i].nodeValue = textos[i];
        i += 1;
        j = 0;
      }
      if (i >= nos.length) {
        linha.classList.remove('is-digitando');
        fim();
        return;
      }
      j += 1;
      nos[i].nodeValue = textos[i].slice(0, j);
      setTimeout(passo, 7 + Math.random() * 15);
    };
    passo();
  };

  const proxima = () => {
    if (pulou || indice >= dados.length) {
      encerra();
      return;
    }
    const dado = dados[indice];
    indice += 1;
    digitaLinha(dado, () => {
      if (indice >= dados.length) {
        encerra();
        return;
      }
      setTimeout(proxima, 140 + Math.random() * 340);
    });
  };

  setTimeout(proxima, 380);
})();

/* ── 3. VISOR.3D — three.js ───────────────────────────────── */

(function iniciaVisor() {
  const canvas = document.querySelector('.v10-visor-canvas');
  if (!canvas || !canvas.dataset.glb) return;
  const palco = canvas.closest('.v10-visor-palco');
  const painel = canvas.closest('.v10-visor');
  if (!palco || !painel) return;

  const botoes = [...document.querySelectorAll('.v10-modo')];
  const leituraModo = document.getElementById('v10-visor-modo');

  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let raiz = null;
  let rafId = 0;
  let iniciado = false;
  let rodando = false;
  let visivel = false;
  let falhou = false;
  let retomaTimer = 0;
  let modoAtual = 'solido';

  const originais = new Map();
  const matArame = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x43e8ff });
  const matRaiox = new THREE.MeshBasicMaterial({
    color: 0x43e8ff,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  function aplicaModo() {
    if (!raiz) return;
    raiz.traverse((obj) => {
      if (!obj.isMesh) return;
      if (modoAtual === 'arame') obj.material = matArame;
      else if (modoAtual === 'raiox') obj.material = matRaiox;
      else obj.material = originais.get(obj) ?? obj.material;
    });
  }

  // Botões de modo: grupo de toggles com aria-pressed exclusivo
  botoes.forEach((botao) => {
    botao.addEventListener('click', () => {
      modoAtual = botao.dataset.modo || 'solido';
      botoes.forEach((outro) => outro.setAttribute('aria-pressed', String(outro === botao)));
      if (leituraModo) leituraModo.textContent = botao.dataset.rotulo || 'SOLIDO';
      aplicaModo();
    });
  });

  function loop() {
    if (!rodando) return;
    if (controls) controls.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  }

  function atualizaLoop() {
    const deve = iniciado && !falhou && visivel && !document.hidden && !!renderer;
    if (deve && !rodando) {
      rodando = true;
      rafId = requestAnimationFrame(loop);
    } else if (!deve && rodando) {
      rodando = false;
      cancelAnimationFrame(rafId);
    }
  }

  function dimensiona() {
    if (!renderer || !camera) return;
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function init() {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      falhou = true; // sem WebGL: o poster estático permanece
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    // Luzes: hemisfério frio + key branca + rim ciano para destacar
    // a máquina preta sobre o navy do painel
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x0a1228, 1.15));
    const chave = new THREE.DirectionalLight(0xffffff, 1.7);
    chave.position.set(2.2, 3.2, 2.6);
    scene.add(chave);
    const contra = new THREE.DirectionalLight(0x43e8ff, 1.35);
    contra.position.set(-2.6, 1.6, -2.4);
    scene.add(contra);
    const preenche = new THREE.DirectionalLight(0x8fb7ff, 0.5);
    preenche.position.set(-1.6, 0.5, 2.8);
    scene.add(preenche);

    dimensiona();
    new ResizeObserver(dimensiona).observe(palco);
    window.addEventListener('resize', dimensiona);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.autoRotate = !reduz;
    controls.autoRotateSpeed = 0.5;

    // Rotação ociosa pausa durante a interação e retoma depois
    controls.addEventListener('start', () => {
      clearTimeout(retomaTimer);
      controls.autoRotate = false;
    });
    controls.addEventListener('end', () => {
      if (reduz) return;
      clearTimeout(retomaTimer);
      retomaTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 4000);
    });

    const loader = new GLTFLoader();
    loader.load(
      canvas.dataset.glb,
      (gltf) => {
        raiz = gltf.scene;

        // Enquadra pelo bounding box — nunca coordenadas fixas
        const caixa = new THREE.Box3().setFromObject(raiz);
        const tamanho = caixa.getSize(new THREE.Vector3());
        const centro = caixa.getCenter(new THREE.Vector3());
        raiz.position.sub(centro);
        scene.add(raiz);

        const maior = Math.max(tamanho.x, tamanho.y, tamanho.z);
        const dist = ((maior / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * 1.3;
        camera.near = dist / 60;
        camera.far = dist * 20;
        camera.position.copy(new THREE.Vector3(0.6, 0.32, 1).normalize().multiplyScalar(dist));
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.minDistance = dist * 0.55;
        controls.maxDistance = dist * 1.9;
        controls.update();

        // Guarda os materiais originais para o modo SÓLIDO
        raiz.traverse((obj) => {
          if (obj.isMesh) originais.set(obj, obj.material);
        });
        aplicaModo();

        renderer.render(scene, camera);
        painel.classList.add('is-vivo'); // esmaece o poster
        atualizaLoop();
      },
      undefined,
      () => {
        falhou = true; // erro de carga: o poster estático permanece
        atualizaLoop();
      }
    );
  }

  // Lazy: só inicializa quando o palco se aproxima do viewport;
  // o mesmo observer pausa o loop quando o visor sai de tela.
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        visivel = e.isIntersecting;
        if (visivel && !iniciado) {
          iniciado = true;
          init();
        }
        atualizaLoop();
      });
    },
    { rootMargin: '280px 0px' }
  );
  io.observe(palco);

  document.addEventListener('visibilitychange', atualizaLoop);
})();

/* ── 4. Simulador ─────────────────────────────────────────── */

const faixa = document.getElementById('sim-professores');
const argPrompt = document.getElementById('v10-sim-arg');

bindSimulador(() => {
  if (!faixa) return;
  // Eco do argumento no prompt "$ fill sim --professores N"
  if (argPrompt) argPrompt.textContent = faixa.value;
  // Barra de progresso ciana do slider
  const min = Number(faixa.min) || 1;
  const max = Number(faixa.max) || 200;
  const pct = ((Number(faixa.value) - min) / (max - min)) * 100;
  faixa.style.setProperty('--pct', `${Math.max(0, Math.min(100, pct)).toFixed(2)}%`);
});
