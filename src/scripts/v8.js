import '@google/model-viewer';
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Caixa de brinquedo: botão "DAR UM GIRO ⟳" ─────────────
   Lê a órbita atual da câmera e soma uma volta completa em
   theta — o próprio model-viewer anima a interpolação
   (interpolation-decay="200" no elemento). Com movimento
   reduzido: salto seco de 90°, sem animação. */

const mv = document.querySelector('#v8-maquina');
const botaoGiro = document.querySelector('#v8-giro');

if (mv && botaoGiro) {
  botaoGiro.addEventListener('click', () => {
    const { theta, phi, radius } = mv.getCameraOrbit();
    if (reduz) {
      mv.cameraOrbit = `${theta + Math.PI / 2}rad ${phi}rad ${radius}m`;
      mv.jumpCameraToGoal();
    } else {
      mv.cameraOrbit = `${theta + 2 * Math.PI}rad ${phi}rad ${radius}m`;
    }
  });

  // Depois que a pessoa gira a máquina com o próprio dedo,
  // o adesivo "GIRE-ME ⟳" para de cutucar.
  const aoGirar = (evento) => {
    if (evento.detail?.source !== 'user-interaction') return;
    mv.closest('.v8-brinquedo')?.classList.add('v8-brinquedo--girado');
    mv.removeEventListener('camera-change', aoGirar);
  };
  mv.addEventListener('camera-change', aoGirar);
}

/* ── Simulador (contrato de markup idêntico ao da V1) ─────── */

bindSimulador();
