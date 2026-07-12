/** Limita um valor ao intervalo percentual usado pelas experiências. */
export const clampPercent = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
};

/** Traduz as teclas de apresentação para um deslocamento de slide. */
export const slideDeltaForKey = (key) =>
  key === 'ArrowDown' || key === 'PageDown'
    ? 1
    : key === 'ArrowUp' || key === 'PageUp'
      ? -1
      : 0;

/** Retorna o próximo índice sem sair dos limites da coleção. */
export const nextIndex = (current, delta, count) =>
  Math.min(Math.max(0, count - 1), Math.max(0, current + delta));

/** Adiciona uma seção visitada sem duplicar e preservando a ordem. */
export const addVisited = (current, id) =>
  current.includes(id) ? [...current] : [...current, id];
