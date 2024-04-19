
import LobbyEventsEmitter from "./lobby/eventsEmitter";
import GameEventsEmitter from "./game/eventsEmitter";
import MatchEventsEmitter from "./match/eventsEmitter";
import RoundEventsEmitter from "./round/eventsEmitter";
import type { Socket } from "socket.io-client";

/**
 *  Classe para emissão de eventos (enviar mensagens ao servidor). 
 * 
 *  Toda a documentação sobre os eventos estão em `docs/events.md` (a partir do reposítorio raiz do projeto).
 */
export default class EventsEmitter {
    public lobby: LobbyEventsEmitter
    public game: GameEventsEmitter
    public match: MatchEventsEmitter
    public round: RoundEventsEmitter

    constructor(socket: Socket) {
        this.lobby = new LobbyEventsEmitter(socket)
        this.game = new GameEventsEmitter(socket)
        this.match = new MatchEventsEmitter(socket)
        this.round = new RoundEventsEmitter(socket)
    }
}
