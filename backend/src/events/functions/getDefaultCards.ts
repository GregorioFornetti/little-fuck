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

/**
 *  Monta o baralho das cartas numeradas de um jogo.
 *  Sem cartas personalizadas, usa as cartas padrão do jogo. Se o baralho tiver
 *  menos cartas do que jogadores, cartas de valor 1 são adicionadas até que
 *  haja pelo menos uma carta para cada jogador.
 *
 *  @param customCards valores das cartas personalizadas escolhidas pelo líder
 *  @param numPlayers quantidade de jogadores que receberão cartas
 *  @returns o baralho de cartas numeradas do jogo
 */
export function getNumberedCards(customCards?: number[], numPlayers = 0): Card[] {
  const cards: Card[] = customCards && customCards.length > 0
    ? customCards.map((value) => ({ value, type: 'common' as const }))
    : getDefaultCards();

  while (cards.length < numPlayers) {
    cards.push({ value: 1, type: 'common' });
  }

  return cards;
}