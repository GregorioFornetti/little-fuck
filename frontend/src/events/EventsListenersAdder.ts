
import { LobbyEventsHandlersAdder } from "./lobby/eventsHandlers";
import { GameEventsHandlersAdder } from "./game/eventsHandlers";
import { MatchEventsHandlersAdder } from "./match/eventsHandlers";
import { RoundEventsHandlersAdder } from "./round/eventsHandlers";
import type { Socket } from "socket.io-client";


export default class EventsListenersAdder {
    
    public lobby: LobbyEventsHandlersAdder;
    public game: GameEventsHandlersAdder;
    public match: MatchEventsHandlersAdder;
    public round: RoundEventsHandlersAdder;

    constructor(socket: Socket) {
        this.lobby = new LobbyEventsHandlersAdder(socket);
        this.game = new GameEventsHandlersAdder(socket);
        this.match = new MatchEventsHandlersAdder(socket);
        this.round = new RoundEventsHandlersAdder(socket);
    }
}