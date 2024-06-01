
import lobbyEventsHandlers from './lobby/eventsHandlers';
import gameEventsHandlers from './game/eventsHandlers';
import matchEventsHandlers from './match/eventsHandlers';
import roundEventsHandlers from './round/eventsHandlers';
import generalEventsHandlers from './general/eventsHandlers';
import { Socket, Server } from "socket.io";
import Player from '../interfaces/Player';
import { createPlayer } from './functions/createPlayer';


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
        ...roundEventsHandlers,
        ...generalEventsHandlers
    }

    Object.entries(eventsHandlers).forEach(([eventName, eventHandler]) => {
        socket.on(eventName, (...args) => {
            const player: Player = createPlayer(io, socket.id)
            eventHandler(player, ...args)
        })
    })
}