
import { Card } from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { shuffle } from '../../../functions/shuffle';

/**
 *  Sorteia `numCards` cartas aleatórias para os jogadores de uma partida.
 *
 *  @param alivePlayersIds ids dos jogadores que ainda estão vivos na partida e que receberão cartas.
 *  @param cards cartas disponíveis para serem sorteadas. As cartas sorteadas não podem ser repetidas.
 *  @param numCards número de cartas a serem sorteadas para cada jogador
 *  @returns um objeto contendo as cartas sorteadas para cada jogador. A chave é o id do jogador e o valor é um
 *  array de `numCards` cartas.
 */
export default function getPlayersCards(alivePlayersIds: string[], cards: Card[], numCards: number): { [playerId: string]: Card[] } {
  if (alivePlayersIds.length === 0) {
    throw new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE'));
  }

  if (cards.length === 0) {
    throw new Error(i18n.t('COMMON.ERROR.NO_CARDS'));
  }

  if (numCards < 1) {
    throw new Error(i18n.t('COMMON.ERROR.INVALID_NEGATIVE_NUM_CARDS'));
  }

  if (numCards > cards.length * alivePlayersIds.length) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_ENOUGH_CARDS'));
  }

  const shuffledCards = shuffle(cards);
  const playersCards: { [playerId: string]: Card[] } = {};

  for (const playerId of alivePlayersIds) {
    playersCards[playerId] = shuffledCards.splice(0, numCards);
  }

  return playersCards;
}
