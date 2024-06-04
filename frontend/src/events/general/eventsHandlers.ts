
import EventsListenersAdderBase from "../EventsListenersAdderBase";

import { handlePlayerLogout } from "./handlers/playerLogout";
import { handlePlayerLogoutError } from "./handlers/playerLogoutError";
import { handleInternalServerError } from "./handlers/internalServerError";
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

    /**
     *  Evento indicando que um erro ocorreu no servidor. 
     *  Esse erro não era esperado, e provavelmente faria com que o servidor parasse, mas foi "contido".
     *  Quando isso ocorrer, o lobby será desfeito imediatamente,
     *  e um log desse evento será feito no servidor para posterior correção...
     */
    public internalServerError(handlerFunction: () => void): void {
        this.socket.on('internal-server-error', handlerFunction)
    }
}


export default function addDefaultGeneralHandlers(socket: Socket) {
    const generalEventsHandlersAdder = new GeneralEventsHandlersAdder(socket)

    generalEventsHandlersAdder.playerLogout(handlePlayerLogout)
    generalEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError)
    generalEventsHandlersAdder.internalServerError(handleInternalServerError)
}