import type { Server } from 'socket.io';
import { OFFLINE_LIMIT_MS, players } from '../../../global';
import { createPlayer } from '../../functions/createPlayer';
import { handleLogout } from '../handlers/logout';

const removalTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Cancela a remoção agendada de um jogador (usado quando ele reconecta). */
export function cancelOfflineRemoval(playerId: string) {
  const timer = removalTimers.get(playerId);
  if (timer) {
    clearTimeout(timer);
    removalTimers.delete(playerId);
  }
}

/**
 * Agenda a remoção de um jogador que ficou offline. Se ele continuar
 * offline após o limite (10 minutos por padrão), ele sai da sala como se
 * tivesse pedido para sair (mesma lógica do logout) e some do servidor.
 */
export function scheduleOfflineRemoval(io: Server, playerId: string, delayMs: number = OFFLINE_LIMIT_MS) {
  cancelOfflineRemoval(playerId);

  const timer = setTimeout(() => {
    removalTimers.delete(playerId);

    const playerInfo = players[playerId];
    if (!playerInfo || playerInfo.socket.connected || playerInfo.offlineSince === undefined) {
      return;
    }

    if (playerInfo.lobby) {
      handleLogout(createPlayer(io, playerId));
    }
    delete players[playerId];
  }, delayMs);

  timer.unref();
  removalTimers.set(playerId, timer);
}
