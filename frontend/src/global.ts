
import type Lobby from "./interfaces/Lobby"
import type { Ref } from "vue"
import type { Socket } from "socket.io-client"
import type Player from "./interfaces/Player"

declare global {
    /** Variável global que armazena informações do jogador */
    var player: Player
}
