import type { RoundCards } from "@/interfaces/Lobby";
import { lobby } from '@/connection';
import { i18n } from "@/plugins/i18n";

/**
 *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem
 *  o status da mesa e saibam qual é o próximo jogador que deve jogar
 * 
 *  @param cards cartas jogadas até o momento
 *  @param nextPlayerId id do próximo jogador que deve jogar. Pode ser undefined caso todos os jogadores já tenham jogado
 */
export function handleTableUpdate(cards: RoundCards, nextPlayerId?: string) {
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

  const round = lobby.value.game.match.round;

  round.cards = cards;
  round.nextPlayerId = nextPlayerId;
}
