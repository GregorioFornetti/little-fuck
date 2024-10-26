
import { lobby, socket } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que um jogador acaba de sair da sala.
 *
 *  @param id id do jogador que acabou de sair da sala
 */
export function handlePlayerLogout(id: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  const playerIndex = lobby.value.players.findIndex((player) => player.id === id);
  if (playerIndex === -1) {
    throw new Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND'));
  }

  const isLeader = lobby.value.players[playerIndex].leader;
  lobby.value.players.splice(playerIndex, 1);

  if (isLeader) {
    lobby.value.players[0].leader = true;
  }

  if (socket.id === id) {
    lobby.value = null;
  }
}
