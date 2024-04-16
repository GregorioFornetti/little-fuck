
import type Player from "@/interfaces/Player";
import type { Round } from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleEndRound } from "./handlers/endRound";
import { handleSelectCardError } from "./handlers/selectCardError";
import { handleStartRound } from "./handlers/startRound";
import { handleTableUpdate } from "./handlers/tableUpdate";
import type { Socket } from "socket.io-client";


export class RoundEventsHandlersAdder extends EventsListenersAdderBase {

    public startRound(handlerFunction: (player: Player, firstPlayerId: string) => void): void {
        this.addEventListener('start-round', handlerFunction)
    }

    public tableUpdate(handlerFunction: (player: Player, cards: Round, nextPlayerId: string | null) => void): void {
        this.addEventListener('table-update', handlerFunction)
    }

    public selectCardError(handlerFunction: (player: Player, type: "not-your-turn"|"invalid-index"|"not-in-lobby") => void): void {
        this.addEventListener('select-card-error', handlerFunction)
    }

    public endRound(handlerFunction: (player: Player, winnerId: string, points: number) => void): void {
        this.addEventListener('end-round', handlerFunction)
    }
}

export default function addDefaultRoundHandlers (socket: Socket) {
    const roundEventsHandlersAdder = new RoundEventsHandlersAdder(socket)
    
    roundEventsHandlersAdder.startRound(handleStartRound)
    roundEventsHandlersAdder.tableUpdate(handleTableUpdate)
    roundEventsHandlersAdder.selectCardError(handleSelectCardError)
    roundEventsHandlersAdder.endRound(handleEndRound)
}