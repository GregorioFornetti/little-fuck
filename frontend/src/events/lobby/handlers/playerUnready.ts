
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Indica que um jogador acaba de ficar despreparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.
 * 
 *  @param id identificador do jogador que acabou de ficar despreparado
 */
export function handlePlayerUnready(id: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  }

  const playerIndex = lobby.value.players.findIndex((player) => player.id === id);
  if (playerIndex === -1) {
    throw new Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND'));
  }

  lobby.value.players[playerIndex].ready = false;
}