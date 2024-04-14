
import type Lobby from "./Lobby"
import type { Ref } from "vue"
import EventsEmitter from "@/events/Emitter"
import type { Socket } from "socket.io-client"

export default interface Player {
    /** Variável global que armazena informações do lobby que o usuário está. Será undefined se o usuário não estiver em nenhum lobby */
    lobby: Ref<Lobby>,
    /** Emissor de eventos. É responsável por enviar mensagens para o servidor */
    eventsEmitter: EventsEmitter,
    /** Variável global que armazena o socket de comunicação com o servidor. Será undefined se o usuário não estiver conectado */
    socket: Socket
}
