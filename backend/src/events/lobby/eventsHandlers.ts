
import { randomUUID } from "node:crypto";
import Player from "../../interfaces/Player";
import Lobby from "../../interfaces/Lobby";
import { lobbys, players } from "../../global";

/**
 *  Evento chamado quando um usuário deseja criar um lobby. O lobby é uma sala em que vários jogadores podem se conectar a partir de um código.
 *  O jogador que criar a sala será o lider da mesma. Caso o usuário escolha um nome válido (com pelo menos um caractere) e ele mesmo não esteja em
 *  uma outra sala, este irá criar a sala, recebendo a mensgem `join-lobby-sucess`. 
 *  Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`
 * 
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param name Nome que o jogador deseja dar a ele mesmo
 */
export function handleCreateLobby(player: Player, name: string) {
    const formattedName = name.trim()

    if (formattedName.length === 0) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('no-name')
        return
    }

    if (player.lobby) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('player-already-in-lobby')
        return
    }


    const lobby: Lobby = {
        lobbyId: randomUUID(),
        players: [
            {
                id: player.playerId,
                name: formattedName,
                leader: true,
                ready: false
            }
        ]
    }
    lobbys[lobby.lobbyId] = lobby
    players[player.playerId] = lobby
    player.eventsEmitter.Lobby.emitJoinLobbySuccess(lobby)
}