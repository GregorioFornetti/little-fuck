
import type Lobby from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleJoinLobbyError } from "./handlers/joinLobbyError";
import { handleJoinLobbySuccess } from "./handlers/joinLobbySuccess";
import { handlePlayerJoin } from "./handlers/playerJoin";
import { handlePlayerLogout } from "./handlers/playerLogout";
import { handlePlayerLogoutError } from "./handlers/playerLogoutError";
import { handlePlayerReady } from "./handlers/playerReady";
import { handlePlayerReadyError } from "./handlers/playerReadyError";
import { handlePlayerUnready } from "./handlers/playerUnready";
import { handlePlayerUnreadyError } from "./handlers/playerUnreadyError";
import { handleReconnect } from "./handlers/reconnect";
import { handleStartGameError } from "./handlers/startGameError";
import type { Socket } from "socket.io-client";


export class LobbyEventsHandlersAdder extends EventsListenersAdderBase {

    public joinLobbySuccess(handlerFunction: (lobby: Lobby) => void): void {
        this.addEventListener('join-lobby-success', handlerFunction)
    }

    public joinLobbyError(handlerFunction: (type: "lobby-in-game"|"inexistent-lobby"|"no-name"|"repeated-name"|"player-already-in-lobby") => void): void {
        this.addEventListener('join-lobby-error', handlerFunction)
    }

    public playerJoin(handlerFunction: (id: string, name: string) => void): void {
        this.addEventListener('player-join', handlerFunction)
    }

    public playerLogout(handlerFunction: (id: string) => void): void {
        this.addEventListener('player-logout', handlerFunction)
    }

    public playerLogoutError(handlerFunction: (type: "not-in-lobby") => void): void {
        this.addEventListener('player-logout-error', handlerFunction)
    }

    public playerReady(handlerFunction: (id: string) => void): void {
        this.addEventListener('player-ready', handlerFunction)
    }

    public playerReadyError(handlerFunction: (type: "in-game"|"not-in-lobby"|"leader") => void): void {
        this.addEventListener('player-ready-error', handlerFunction)
    }

    public playerUnready(handlerFunction: (id: string) => void): void {
        this.addEventListener('player-unready', handlerFunction)
    }
    
    public playerUnreadyError(handlerFunction: (type: "in-game"|"not-in-lobby"|"leader") => void): void {
        this.addEventListener('player-unready-error', handlerFunction)
    }

    public startGameError(handlerFunction: (type: "not-leader"|"not-all-ready"|"not-in-lobby"|"already-in-game") => void): void {
        this.addEventListener('start-game-error', handlerFunction)
    }

    public reconnect(handlerFunction: (lobby: Lobby) => void): void {
        this.addEventListener('reconnect', handlerFunction)
    }
}


export default function addDefaultLobbyHandlers (socket: Socket) {
    const lobbyEventsHandlersAdder = new LobbyEventsHandlersAdder(socket)

    lobbyEventsHandlersAdder.joinLobbySuccess(handleJoinLobbySuccess)
    lobbyEventsHandlersAdder.joinLobbyError(handleJoinLobbyError)
    lobbyEventsHandlersAdder.playerJoin(handlePlayerJoin)
    lobbyEventsHandlersAdder.playerLogout(handlePlayerLogout)
    lobbyEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError)
    lobbyEventsHandlersAdder.playerReady(handlePlayerReady)
    lobbyEventsHandlersAdder.playerReadyError(handlePlayerReadyError)
    lobbyEventsHandlersAdder.playerUnready(handlePlayerUnready)
    lobbyEventsHandlersAdder.playerUnreadyError(handlePlayerUnreadyError)
    lobbyEventsHandlersAdder.reconnect(handleReconnect)
    lobbyEventsHandlersAdder.startGameError(handleStartGameError)
}