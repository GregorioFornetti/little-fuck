import lobbyEventsHandlers from './lobby/eventsHandlers';
import gameEventsHandlers from './game/eventsHandlers';
import matchEventsHandlers from './match/eventsHandlers';
import roundEventsHandlers from './round/eventsHandlers';
import generalEventsHandlers from './general/eventsHandlers';
import powerupEventsHandlers from './powerup/eventsHandlers';
import { Socket, Server } from 'socket.io';
import Player from '../interfaces/Player';
import { createPlayer } from './functions/createPlayer';
import { handleDisconnect } from './general/handlers/disconnect';

/**
 *  Adiciona todos os handlers de eventos ao socket especificado
 *
 *  @param io objeto do servidor, para conseguir emitir eventos para jogadores em lobby
 *  @param socket socket do jogador
 *  @param playerId id estável do jogador (o mesmo entre reconexões). Se não informado, usa o id do socket
 */
export default function addEventsListeners(io: Server, socket: Socket, playerId: string = socket.id) {
  const eventsHandlers: { [eventName: string]: (player: Player, ...args: any[]) => any} = {
    ...lobbyEventsHandlers,
    ...gameEventsHandlers,
    ...matchEventsHandlers,
    ...roundEventsHandlers,
    ...generalEventsHandlers,
    ...powerupEventsHandlers
  };

  Object.entries(eventsHandlers).forEach(([eventName, eventHandler]) => {
    socket.on(eventName, (...args) => {
      const player: Player = createPlayer(io, playerId);
      eventHandler(player, ...args);
    });
  });

  // Desconectar não tira o jogador da sala: ele só sai se ficar offline por mais de 10 minutos
  socket.on('disconnect', () => {
    handleDisconnect(io, playerId, socket.id);
  });
}
