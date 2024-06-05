/**
 *  Seleciona um índice aleatório de um array
 *
 *  @param array uma lista qualquer, a qual será selecionado um índice aleatório
 *  @returns um índice aleatório do array
 */
export function selectRandomIndex<T>(array: T[]): number {
  if (array.length === 0) {
    throw new Error('Cannot select a random index from an empty array');
  }
  return Math.floor(Math.random() * array.length);
}
