
import lobbyEventsHandlers from './lobby/eventsHandlers';
import gameEventsHandlers from './game/eventsHandlers';
import matchEventsHandlers from './match/eventsHandlers';
import roundEventsHandlers from './round/eventsHandlers';
import { players } from '../global';
import { Socket, Server } from "socket.io";
import Player from '../interfaces/Player';
import EventsEmitter from './Emitter';


/**
 *  Adiciona todos os handlers de eventos ao socket especificado
 * 
 *  @param io objeto do servidor, para conseguir emitir eventos para jogadores em lobby
 *  @param socket socket do jogador
 */
export default function addEventsListeners(io: Server, socket: Socket) {
    const eventsHandlers: { [eventName: string]: (player: Player, ...args: any[]) => any} = {
        ...lobbyEventsHandlers,
        ...gameEventsHandlers,
        ...matchEventsHandlers,
        ...roundEventsHandlers
    }

    Object.entries(eventsHandlers).forEach(([eventName, eventHandler]) => {
        socket.on(eventName, (...args) => {
            const player: Player = {
                playerId: socket.id,
                eventsEmitter: new EventsEmitter(io, socket, players[socket.id]?.lobbyId),
                socket: socket,
                io: io,
                lobby: players[socket.id]
            }
            eventHandler(player, ...args)
        })
    })
}