
import LobbyEventsEmitter from "./lobby/eventsEmitter";

export default class EventsEmitter {
    static Lobby = LobbyEventsEmitter;
}

EventsEmitter.Lobby.emitCreateLobby("name")