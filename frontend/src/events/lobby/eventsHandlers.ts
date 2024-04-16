
import type Player from "@/interfaces/Player";
import type Lobby from "@/interfaces/Lobby";
import "../../global"

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
import addEventListener from "../addEventListener";

export class LobbyEventsHandlersAdder {

    static joinLobbySuccess(handlerFunction: (player: Player, lobby: Lobby) => void): void {
        addEventListener('join-lobby-success', handlerFunction)
    }

    static joinLobbyError(handlerFunction: (player: Player, type: "lobby-in-game"|"inexistent-lobby"|"no-name"|"repeated-name"|"player-already-in-lobby") => void): void {
        addEventListener('join-lobby-error', handlerFunction)
    }

    static playerJoin(handlerFunction: (player: Player, id: string, name: string) => void): void {
        addEventListener('player-join', handlerFunction)
    }

    static playerLogout(handlerFunction: (player: Player, id: string) => void): void {
        addEventListener('player-logout', handlerFunction)
    }

    static playerLogoutError(handlerFunction: (player: Player, type: "not-in-lobby") => void): void {
        addEventListener('player-logout-error', handlerFunction)
    }

    static playerReady(handlerFunction: (player: Player, id: string) => void): void {
        addEventListener('player-ready', handlerFunction)
    }

    static playerReadyError(handlerFunction: (player: Player, type: "in-game"|"not-in-lobby"|"leader") => void): void {
        addEventListener('player-ready-error', handlerFunction)
    }

    static playerUnready(handlerFunction: (player: Player, id: string) => void): void {
        addEventListener('player-unready', handlerFunction)
    }
    
    static playerUnreadyError(handlerFunction: (player: Player, type: "in-game"|"not-in-lobby"|"leader") => void): void {
        addEventListener('player-unready-error', handlerFunction)
    }

    static startGameError(handlerFunction: (player: Player, type: "not-leader"|"not-all-ready"|"not-in-lobby"|"already-in-game") => void): void {
        addEventListener('start-game-error', handlerFunction)
    }

    static reconnect(handlerFunction: (player: Player, lobby: Lobby) => void): void {
        addEventListener('reconnect', handlerFunction)
    }
}


export default function addDefaultLobbyHandlers () {
    LobbyEventsHandlersAdder.joinLobbySuccess(handleJoinLobbySuccess)
    LobbyEventsHandlersAdder.joinLobbyError(handleJoinLobbyError)
    LobbyEventsHandlersAdder.playerJoin(handlePlayerJoin)
    LobbyEventsHandlersAdder.playerLogout(handlePlayerLogout)
    LobbyEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError)
    LobbyEventsHandlersAdder.playerReady(handlePlayerReady)
    LobbyEventsHandlersAdder.playerReadyError(handlePlayerReadyError)
    LobbyEventsHandlersAdder.playerUnready(handlePlayerUnready)
    LobbyEventsHandlersAdder.playerUnreadyError(handlePlayerUnreadyError)
    LobbyEventsHandlersAdder.reconnect(handleReconnect)
    LobbyEventsHandlersAdder.startGameError(handleStartGameError)
}