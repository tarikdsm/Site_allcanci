import {
  LIMITES_PROFESSORES,
  normalizarProfessores,
  simular,
  reais,
} from './simulador-core.js';

/**
 * Liga o simulador ao markup padrão da seção #simulador.
 */
export function bindSimulador() {
  const faixa = document.querySelector('#sim-professores');
  const numero = document.querySelector('#sim-professores-num');
  const status = document.querySelector('#sim-resultado-status');
  if (!faixa || !numero) return;

  const set = (id, v) => { const el = document.querySelector(id); if (el) el.textContent = v; };
  const render = (n, anunciar = false) => {
    const r = simular(n);
    set('#sim-recargas', r.recargasAno.toLocaleString('pt-BR'));
    set('#sim-recargas-plastico', r.recargasAno.toLocaleString('pt-BR'));
    set('#sim-custo-fill', reais(r.custoFill));
    set('#sim-plastico', `${r.plasticoEvitadoKg.toLocaleString('pt-BR')} kg`);
    if (anunciar && status) {
      status.textContent = `Para ${n.toLocaleString('pt-BR')} professores: ${r.recargasAno.toLocaleString('pt-BR')} recargas por ano, com custo FILL de ${reais(r.custoFill)} e ${r.plasticoEvitadoKg.toLocaleString('pt-BR')} kg de plástico economizado.`;
    }
  };
  let ultimoValido = LIMITES_PROFESSORES.inicial;
  const sync = (v, anunciar = false) => {
    const n = normalizarProfessores(v, ultimoValido);
    ultimoValido = n;
    faixa.value = String(n);
    numero.value = String(n);
    render(n, anunciar);
  };
  const numeroEstaCompleto = () => {
    const n = Number(numero.value);
    return numero.value !== ''
      && Number.isInteger(n)
      && n >= LIMITES_PROFESSORES.minimo
      && n <= LIMITES_PROFESSORES.maximo;
  };

  faixa.addEventListener('input', () => sync(faixa.value, true));
  numero.addEventListener('input', () => {
    if (numeroEstaCompleto()) sync(numero.value, true);
  });
  numero.addEventListener('change', () => sync(numero.value, true));
  sync(faixa.value || LIMITES_PROFESSORES.inicial);
}
