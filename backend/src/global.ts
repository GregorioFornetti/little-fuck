
import { Socket } from "socket.io"
import Lobby from "./interfaces/Lobby"

export const lobbys: { [lobbyId: string]: Lobby } = {}
export const players: { [playerId: string]: {
    socket: Socket,
    lobby?: Lobby
} } = {}