
import lobbyEventsHandlers from './lobby/eventsHandlers';
import { players } from '../global';
import { Socket, Server } from "socket.io";
import Player from '../interfaces/Player';
import EventsEmitter from './Emitter';


export default function addEventsListeners(io: Server, socket: Socket) {
    const eventsHandlers: { [eventName: string]: (player: Player, ...args: any[]) => any} = {
        ...lobbyEventsHandlers
    }

    Object.entries(eventsHandlers).forEach(([eventName, eventHandler]) => {
        socket.on(eventName, (...args) => {
            const player: Player = {
                playerId: socket.id,
                eventsEmitter: new EventsEmitter(io, socket, players[socket.id]?.lobbyId),
                lobby: players[socket.id]
            }
            eventHandler(player, ...args)
        })
    })
}