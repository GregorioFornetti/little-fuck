
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
 *
 *  @param winnerId id do jogador que ganhou a rodada
 *  @param points pontos que o jogador ganhador fez nessa rodada
 */
export function handleEndRound(winnerId: string, points: number) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (!lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED'));
  }

  if (!lobby.value.game.match.round) {
    throw new Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED'));
  }

  lobby.value.game.match.round = undefined;
  lobby.value.game.match.players[winnerId].numWonRounds += points;
}
