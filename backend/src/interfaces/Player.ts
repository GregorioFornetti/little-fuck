import EventsEmitter from "../events/Emitter";
import Lobby from "./Lobby";


export default interface Player {
    /** Identificador único do usuário que acionou o evento */
    playerId: string,
    /** Objeto para emitir eventos para o cliente */
    eventsEmitter: EventsEmitter,
    /** Informações do lobby que o usuário está atualmente. Será undefined se não estiver em um lobby */
    lobby?: Lobby
}