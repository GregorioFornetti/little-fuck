
import Lobby from '../../interfaces/Lobby';
import i18n from '../../plugins/i18n';

/**
 *  Coleta o próximo jogador da lista, logo depois do jogador fornecido atualmente. O jogador coletado será um jogador vivo.
 *  Caso chege ao final da lista, será dado uma "volta" na lista, voltando ao primeiro jogador da lista.
 *  Caso o jogador fornecido não seja encontrado ou o lobby não tenha um jogo em andamento, será lançado um erro.
 *
 *  @param currentPlayerId id do jogador atual, será coletado o id próximo à ele
 *  @param lobby informações do lobby (e do jogo) atual
 *  @returns o próximo id
 */
export function getNextPlayerId(currentPlayerId: string, lobby: Lobby): string {
  if (!lobby.game) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  }

  const playerIndex = lobby.players.map((player) => player.id).indexOf(currentPlayerId);
  if (playerIndex === -1) {
    throw new Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND'));
  }

  if (Object.values(lobby.game.playersHealth).every((health) => health <= 0)) {
    throw new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE'));
  }

  let nextPlayerIndex = playerIndex;
  let nextPlayerId = '';
  do {
    nextPlayerIndex = (nextPlayerIndex + 1) % lobby.players.length;
    nextPlayerId = lobby.players[nextPlayerIndex].id;
  } while (lobby.game.playersHealth[nextPlayerId] <= 0);

  return nextPlayerId;
}
