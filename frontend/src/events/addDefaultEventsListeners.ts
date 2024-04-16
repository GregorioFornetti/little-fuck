
import addDefaultLobbyEventsHandlers from './lobby/eventsHandlers';
import addDefaultGameEventsHandlers from './game/eventsHandlers';
import addDefaultMatchEventsHandlers from './match/eventsHandlers';
import addDefaultRoundEventsHandlers from './round/eventsHandlers';
import type { Socket } from 'socket.io-client';


export default function addDefaultEventsListeners(socket: Socket) {
    addDefaultLobbyEventsHandlers(socket)
    addDefaultGameEventsHandlers(socket)
    addDefaultMatchEventsHandlers(socket)
    addDefaultRoundEventsHandlers(socket)
}