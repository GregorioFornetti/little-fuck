
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para indicar o início da rodada.
 *
 *  @param firstPlayerId id do jogador que deve começar a rodada (jogar a primeira carta)
 */
export function handleStartRound(firstPlayerId: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (!lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED'));
  }

  if (lobby.value.game.match.round) {
    throw new Error(i18n.t('COMMON.ERROR.ROUND_ALREADY_STARTED'));
  }

  lobby.value.game.match.round = {
    cards: {
      onMatch: [],
      anulledCards: [],
    },
    nextPlayerId: firstPlayerId,
  };
}
