
import { Socket, Server } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import LobbyEventsEmitter from "./lobby/eventsEmitter";


export default class EventsEmitter {
    public Lobby: LobbyEventsEmitter;
    
    constructor(io: Server, socket: Socket|ClientSocket, lobbyId?: string) {
        this.Lobby = new LobbyEventsEmitter(io, socket, lobbyId);
    }
}
