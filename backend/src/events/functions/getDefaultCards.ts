import { Card } from '../../interfaces/Lobby';

/**
 *  O jogo tem 52 cartas (igual ao baralho), sendo estas quatro cartas de números 1 a 12 (cartas comuns)
 *  e uma carta de números 13 a 16 (cartas manilhas). Essa função retorna uma lista contendo essas cartas.
 *
 *  @returns uma lista contendo todas as cartas padrões do jogo
 */
export function getDefaultCards(): Card[] {
  const cards: Card[] = [];

  for (let i = 1; i <= 12; i++) {
    for (let j = 0; j < 4; j++) {
      cards.push({ value: i, type: 'common' });
    }
  }

  for (let i = 13; i <= 16; i++) {
    cards.push({ value: i, type: 'common' });
  }

  return cards;
}
