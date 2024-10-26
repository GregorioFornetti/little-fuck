import { players } from '../../global';
import EventsEmitter from '../Emitter';
import Player from '../../interfaces/Player';
import i18n from '../../plugins/i18n';
import { Server } from 'socket.io';

/**
 *  Cria um objeto Player com base no id do jogador.
 *
 *  @param io Servidor do socket.io (deve ser pego do index.ts)
 *  @param playerId Id do jogador
 */
export function createPlayer(io: Server, playerId: string): Player {
  const playerInfo = players[playerId];
  if (!playerInfo) {
    throw new Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND'));
  }

  const lobbyId = playerInfo.lobby ? playerInfo.lobby.lobbyId : undefined;

  return {
    playerId: playerId,
    eventsEmitter: new EventsEmitter(io, playerInfo.socket, lobbyId),
    socket: playerInfo.socket,
    io: io,
    lobby: playerInfo.lobby
  };
}
