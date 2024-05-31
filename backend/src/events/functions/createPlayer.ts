
import { players } from "../../global"
import EventsEmitter from "../Emitter"
import { io } from "../../index"
import Player from "../../interfaces/Player"



export function createPlayer(playerId: string): Player {
    const playerInfo = players[playerId]
    if (!playerInfo) {
        throw new Error("Player not found")  // COLOCAR ERRO CERTO AQUI
    }

    const lobbyId = playerInfo.lobby ? playerInfo.lobby.lobbyId : undefined
    
    return  {
        playerId: playerId,
        eventsEmitter: new EventsEmitter(io, playerInfo.socket, lobbyId),
        socket: playerInfo.socket,
        io: io,
        lobby: playerInfo.lobby
    }
}