
import type Player from "@/interfaces/Player";
import type { Card, SpecialMatchCards } from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleEndMatch } from "./handlers/endMatch";
import { handleStartMatch } from "./handlers/startMatch";
import { handleStartSpecialMatch } from "./handlers/startSpecialMatch";
import { handleWinRoundsNumberError } from "./handlers/winRoundsNumberError";
import { handleWinRoundsNumberUpdate } from "./handlers/winRoundsNumberUpdate";
import type { Socket } from "socket.io-client";



export class MatchEventsHandlersAdder extends EventsListenersAdderBase {

    public startMatch(handlerFunction: (player: Player, cards: Card[], firstPlayerId: string) => void): void {
        this.addEventListener('start-match', handlerFunction)
    }

    public winRoundsNumberUpdate(handlerFunction: (player: Player, numWinRounds: number, nextPlayerId: string|null) => void): void {
        this.addEventListener('win-rounds-number-update', handlerFunction)
    }

    public winRoundsNumberError(handlerFunction: (player: Player, type: "not-your-turn"|"negative-is-invalid"|"not-in-lobby"|"num-wins-equals-num-cards") => void): void {
        this.addEventListener('win-rounds-number-error', handlerFunction)
    }

    public endMatch(handlerFunction: (player: Player, playerHealthUpdate: { [playerId: string]: number }) => void): void {
        this.addEventListener('end-match', handlerFunction)
    }

    public startSpecialMatch(handlerFunction: (player: Player, cards: SpecialMatchCards, firstPlayerId: string) => void): void {
        this.addEventListener('start-special-match', handlerFunction)
    }
}
    


export default function addDefaultMatchHandlers (socket: Socket) {
    const matchEventsHandlersAdder = new MatchEventsHandlersAdder(socket)
    
    matchEventsHandlersAdder.startMatch(handleStartMatch)
    matchEventsHandlersAdder.winRoundsNumberUpdate(handleWinRoundsNumberUpdate)
    matchEventsHandlersAdder.winRoundsNumberError(handleWinRoundsNumberError)
    matchEventsHandlersAdder.endMatch(handleEndMatch)
    matchEventsHandlersAdder.startSpecialMatch(handleStartSpecialMatch)
}