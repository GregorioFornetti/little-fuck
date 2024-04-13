
import LobbyEventsEmitter from "./lobby/eventsEmitter";
import GameEventsEmitter from "./game/eventsEmitter";
import MatchEventsEmitter from "./match/eventsEmitter";
import RoundEventsEmitter from "./round/eventsEmitter";

/**
 *  Classe para emissão de eventos (enviar mensagens ao servidor). 
 * 
 *  Todas as documentações sobre os eventos estão em `docs/events.md`.
 */
export default class EventsEmitter {
    static Lobby = LobbyEventsEmitter;
    static Game = GameEventsEmitter;
    static Match = MatchEventsEmitter;
    static Round = RoundEventsEmitter;
}
