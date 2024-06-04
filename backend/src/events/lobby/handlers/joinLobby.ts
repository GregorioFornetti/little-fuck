
import Player from "../../../interfaces/Player";
import { lobbys, players } from "../../../global";
import EventsEmitter from "../../Emitter";

/**
 *  Evento chamado quando um usuário deseja se conectar a um lobby.
 *  O código do lobby é fornecido ao criador da sala, e precisa ser utilizado para a conexão dos outros jogadores na mesma sala.
 *  Caso o usuário escolha um nome válido (não igual a nenhum outro do lobby e com pelo menos um caractere),
 *  tente entrar em uma sala existente e que não esteja em jogo, e ele mesmo não esteja em uma outra sala, este irá entrar na sala, 
 *  recebendo a mensagem `join-lobby-sucess`. Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`.
 *  
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param lobbyId Código (identificador) da sala a qual o jogador deseja se conectar
 *  @param name Nome que o jogador deseja utilizar no jogo.
 */
export function handleJoinLobby(player: Player, lobbyId: string, name: string) {
    if (lobbys[lobbyId] === undefined) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('inexistent-lobby')
        return
    }

    if (lobbys[lobbyId].game !== undefined) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('lobby-in-game')
        return
    }

    const formattedName = name.trim()

    if (formattedName.length === 0) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('no-name')
        return
    }

    if (lobbys[lobbyId].players.find(p => p.name === formattedName) !== undefined) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('repeated-name')
        return
    }

    if (player.lobby) {
        player.eventsEmitter.Lobby.emitJoinLobbyError('player-already-in-lobby')
        return
    }



    const currentLobby = lobbys[lobbyId]

    player.lobby = currentLobby
    player.eventsEmitter = new EventsEmitter(player.io, player.socket, lobbyId)

    player.eventsEmitter.Lobby.emitJoinLobbySuccess(currentLobby)

    currentLobby.players.push({
        id: player.playerId,
        name: formattedName,
        leader: false,
        ready: false
    })

    players[player.playerId] = { lobby: currentLobby, socket: player.socket }

    player.eventsEmitter.Lobby.emitPlayerJoin(player.playerId, formattedName)
}