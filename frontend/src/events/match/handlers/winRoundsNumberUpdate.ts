
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala
 *  atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar.
 *  OBS: esse evento não indica que um jogador ganhou uma rodada (o evento que faz isso é o `end-round`).
 *
 *  @param numWinRounds número de rodadas que o jogador atual acredita que irá vencer (palpite)
 *  @param nextPlayerId id do próximo jogador que deve palpitar. Pode ser undefined caso todos os jogadores já tenham palpitado
 */
export function handleWinRoundsNumberUpdate(numWinRounds: number, nextPlayerId?: string) {
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

  if (!lobby.value.game.match.nextPlayerId) {
    throw new Error(i18n.t('COMMON.ERROR.NO_MATCH_NEXT_PLAYER'));
  }

  const match = lobby.value.game.match;

  match.players[lobby.value.game.match.nextPlayerId].numWinsNeeded = numWinRounds;
  match.nextPlayerId = nextPlayerId;
}
