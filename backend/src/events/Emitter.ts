
import { Socket, Server } from "socket.io";
import LobbyEventsEmitter from "./lobby/eventsEmitter";


export default class EventsEmitter {
    public Lobby: LobbyEventsEmitter;
    
    constructor(io: Server, socket: Socket, lobbyId?: string) {
        this.Lobby = new LobbyEventsEmitter(io, socket, lobbyId);
    }
}
