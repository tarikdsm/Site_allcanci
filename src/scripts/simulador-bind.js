import { simular, reais } from './simulador-core.js';

/**
 * Liga o simulador ao markup padrão da seção #simulador.
 * @param {(r: ReturnType<typeof simular>) => void} [aoRenderizar] efeito opcional após cada atualização
 */
export function bindSimulador(aoRenderizar) {
  const faixa = document.querySelector('#sim-professores');
  const numero = document.querySelector('#sim-professores-num');
  if (!faixa || !numero) return;

  const set = (id, v) => { const el = document.querySelector(id); if (el) el.textContent = v; };
  const render = (n) => {
    const r = simular(n);
    set('#sim-recargas', r.recargasAno.toLocaleString('pt-BR'));
    set('#sim-custo-fill', reais(r.custoFill));
    set('#sim-descartaveis', r.descartaveis.toLocaleString('pt-BR'));
    set('#sim-economia', reais(r.economia));
    set('#sim-plastico', `${r.plasticoEvitadoKg.toLocaleString('pt-BR')} kg`);
    aoRenderizar?.(r);
  };
  const sync = (v) => { faixa.value = v; numero.value = v; render(Number(v)); };
  faixa.addEventListener('input', () => sync(faixa.value));
  numero.addEventListener('input', () => sync(numero.value));
  sync(faixa.value || 20);
}
