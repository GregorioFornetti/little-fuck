
import EventsListenersAdderBase from "../EventsListenersAdderBase";

import { handlePlayerLogout } from "./handlers/playerLogout";
import { handlePlayerLogoutError } from "./handlers/playerLogoutError";
import type { Socket } from "socket.io-client";


export class GeneralEventsHandlersAdder extends EventsListenersAdderBase {

    /**
     *  Evento indicando que um jogador acaba de sair da sala.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerLogout(handlerFunction: (id: string) => void): void {
        this.socket.on('player-logout', handlerFunction)
    }

    /**
     *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerLogoutError(handlerFunction: (type: "not-in-lobby") => void): void {
        this.socket.on('player-logout-error', handlerFunction)
    }
}


export default function addDefaultGeneralHandlers(socket: Socket) {
    const generalEventsHandlersAdder = new GeneralEventsHandlersAdder(socket)

    generalEventsHandlersAdder.playerLogout(handlePlayerLogout)
    generalEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError)
}