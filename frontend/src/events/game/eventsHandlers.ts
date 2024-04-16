
import type Player from "@/interfaces/Player";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleEndGame } from "./handlers/endGame";
import { handleStartGame } from "./handlers/startGame";
import type { Socket } from "socket.io-client";


export class GameEventsHandlersAdder extends EventsListenersAdderBase {
    public startGame(handlerFunction: (player: Player) => void): void {
        this.addEventListener('start-game', handlerFunction)
    }

    public endGame(handlerFunction: (player: Player, playersRanks: string[]) => void): void {
        this.addEventListener('end-game', handlerFunction)
    }
}


export default function addDefaultGameHandlers (socket: Socket) {
    const gameEventsHandlersAdder = new GameEventsHandlersAdder(socket)
    
    gameEventsHandlersAdder.startGame(handleStartGame)
    gameEventsHandlersAdder.endGame(handleEndGame)
}