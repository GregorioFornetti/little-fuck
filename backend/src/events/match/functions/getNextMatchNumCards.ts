import { Card } from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';

/**
 *  Coleta o próximo número de cartas que é possível de fornecer para todos os jogadores vivos.
 *  Caso o número atual seja o maior possível, será retornado 1.
 *  Caso seja fornecido uma lista vazia de jogadores ou cartas, será lançado um erro.
 *
 *  @param currentMatchNumCards número atual de cartas que foi fornecido
 *  @param alivePlayersIds lista de ids dos jogadores vivos
 *  @param possibleCards lista de cartas que podem ser fornecidas
 *  @returns o próximo número de cartas que pode ser fornecido
 */
export function getNextMatchNumCards(currentMatchNumCards: number, alivePlayersIds: string[], possibleCards: Card[]): number {
  if (alivePlayersIds.length === 0) {
    throw new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE'));
  }

  if (possibleCards.length === 0) {
    throw new Error(i18n.t('COMMON.ERROR.NO_CARDS'));
  }

  if ((currentMatchNumCards + 1) * alivePlayersIds.length <= possibleCards.length) {
    return currentMatchNumCards + 1;
  } else {
    return 1;
  }
}
