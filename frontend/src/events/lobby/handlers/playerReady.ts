
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Indica que um jogador acaba de ficar preparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.
 *
 *  @param id identificador do jogador que acabou de ficar pronto
 */
export function handlePlayerReady(id: string) {
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

  lobby.value.players[playerIndex].ready = true;
}
