
import type Lobby from "./interfaces/Lobby"
import type { Ref } from "vue"
import type { Socket } from "socket.io-client"

declare global {
    /** Variável global que armazena informações do lobby que o usuário está. Será undefined se o usuário não estiver em nenhum lobby */
    var lobby: Ref<Lobby>
    /** Variável global que armazena o socket de comunicação com o servidor. Será undefined se o usuário não estiver conectado */
    var socket: Socket
}
