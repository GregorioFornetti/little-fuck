import type { Server } from 'socket.io';
import { players } from '../../../global';
import { scheduleOfflineRemoval } from '../functions/offlineRemoval';

/**
 * Marca o jogador como offline quando o socket dele desconecta (ex: recarregou a página).
 * Ele NÃO sai da sala nesse momento: só será removido se continuar offline
 * por mais de 10 minutos (ver `scheduleOfflineRemoval`). Se ele reconectar
 * antes disso, a remoção é cancelada e ele volta exatamente de onde parou.
 *
 * @param io Servidor do socket.io
 * @param playerId Id estável do jogador que desconectou
 * @param socketId Id do socket que desconectou (ignora se um socket mais novo já assumiu)
 */
export function handleDisconnect(io: Server, playerId: string, socketId: string) {
  const playerInfo = players[playerId];
  if (!playerInfo || playerInfo.socket.id !== socketId) {
    return;
  }

  playerInfo.offlineSince = Date.now();
  scheduleOfflineRemoval(io, playerId);
}
