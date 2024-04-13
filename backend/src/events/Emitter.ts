
import { Socket, Server } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import LobbyEventsEmitter from "./lobby/eventsEmitter";
import GameEventsEmitter from "./game/eventsEmitter";
import MatchEventsEmitter from "./match/eventsEmitter";
import RoundEventsEmitter from "./round/eventsEmitter";


/**
 *  Classe para emissão de eventos (enviar mensagens aos clientes). 
 * 
 *  Todas as documentações sobre os eventos estão em `docs/events.md`.
 */
export default class EventsEmitter {
    public Lobby: LobbyEventsEmitter;
    public Game: GameEventsEmitter;
    public Match: MatchEventsEmitter;
    public Round: RoundEventsEmitter;
    
    constructor(io: Server, socket: Socket|ClientSocket, lobbyId?: string) {
        this.Lobby = new LobbyEventsEmitter(io, socket, lobbyId);
        this.Game = new GameEventsEmitter(io, socket, lobbyId);
        this.Match = new MatchEventsEmitter(io, socket, lobbyId);
        this.Round = new RoundEventsEmitter(io, socket, lobbyId);
    }
}
