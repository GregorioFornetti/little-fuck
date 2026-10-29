import type { Card } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento com a nova mão do próprio jogador (após uma troca de cartas).
 *
 *  @param cards nova mão do jogador
 */
export function handleHandUpdate(cards: Card[]) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (lobby.value.game?.match) {
    lobby.value.game.match.currentPlayerCards = [...cards];
  }
}
