
import lobbyEventsHandlers from './lobby/eventsHandlers';
import gameEventsHandlers from './game/eventsHandlers';
import matchEventsHandlers from './match/eventsHandlers';
import roundEventsHandlers from './round/eventsHandlers';
import { Socket } from "socket.io-client";
import type Player from '../interfaces/Player';
import EventsEmitter from './Emitter';
import "../global"


export default function addEventsListeners(socket: Socket) {
    const eventsHandlers: { [eventName: string]: (player: Player, ...args: any[]) => any} = {
        ...lobbyEventsHandlers,
        ...gameEventsHandlers,
        ...matchEventsHandlers,
        ...roundEventsHandlers
    }

    Object.entries(eventsHandlers).forEach(([eventName, eventHandler]) => {
        socket.on(eventName, (...args) => {
            const player: Player = {
                eventsEmitter: EventsEmitter,
                socket: socket,
                lobby: globalThis.lobby
            }
            eventHandler(player, ...args)
        })
    })
}