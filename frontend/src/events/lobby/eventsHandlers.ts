
import type Lobby from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleJoinLobbyError } from "./handlers/joinLobbyError";
import { handleJoinLobbySuccess } from "./handlers/joinLobbySuccess";
import { handlePlayerJoin } from "./handlers/playerJoin";
import { handlePlayerLogout } from "./handlers/playerLogout";
import { handlePlayerLogoutError } from "./handlers/playerLogoutError";
import { handlePlayerReady } from "./handlers/playerReady";
import { handlePlayerReadyError } from "./handlers/playerReadyError";
import { handlePlayerUnready } from "./handlers/playerUnready";
import { handlePlayerUnreadyError } from "./handlers/playerUnreadyError";
import { handleReconnect } from "./handlers/reconnect";
import { handleStartGameError } from "./handlers/startGameError";
import type { Socket } from "socket.io-client";


export class LobbyEventsHandlersAdder extends EventsListenersAdderBase {

    /**
     *  Indica ao usuário que ele conseguiu entrar na sala.
     *  Este receberá uma lista de todos os outros jogadores da sala e suas informações.
     *  Logo após isso, será enviado para todos os outros jogadores o evento `player-join`,
     *  para que todos adicionem este jogador ao lobby também (incluindo ele mesmo).
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public joinLobbySuccess(handlerFunction: (lobby: Lobby) => void): void {
        this.socket.on('join-lobby-success', handlerFunction)
    }

    /**
     *  Indica ao usuário que ocorreu algum erro ao entrar na sala (ou criá-la).
     *  Isso pode ocorrer devido à um nome inválido (nenhum caractere ou nome repetido),
     *  um lobby inexistente ou em partida, ou o jogador já estar em um outro lobby.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public joinLobbyError(handlerFunction: (type: "lobby-in-game"|"inexistent-lobby"|"no-name"|"repeated-name"|"player-already-in-lobby") => void): void {
        this.socket.on('join-lobby-error', handlerFunction)
    }

    /**
     *  Evento enviado para todos os jogadores indicando que um novo jogador entrou na sala.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerJoin(handlerFunction: (id: string, name: string) => void): void {
        this.socket.on('player-join', handlerFunction)
    }

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
     *  Indica que um jogador acaba de ficar preparado para um jogo.
     *  Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerReady(handlerFunction: (id: string) => void): void {
        this.socket.on('player-ready', handlerFunction)
    }

    /**
     *  Evento enviado ao cliente que tentou se preparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento.
     *  Outro motivo pode ser que o líder tente se preparar, mas este não precisa fazer isso, ele só precisa iniciar a partida.
     *  OBS: caso o jogador solicite a preparação e este já está preparado, nada deve acontecer (este evento não deve ser acionado).
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerReadyError(handlerFunction: (type: "in-game"|"not-in-lobby"|"leader") => void): void {
        this.socket.on('player-ready-error', handlerFunction)
    }

    /**
     *  Indica que um jogador acaba de ficar despreparado para um jogo.
     *  Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerUnready(handlerFunction: (id: string) => void): void {
        this.socket.on('player-unready', handlerFunction)
    }
    
    /**
     *  Evento enviado ao cliente que tentou se despreparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento.
     *  Outro motivo pode ser que o líder tente se despreparar, mas este não precisa fazer isso, ele só precisa iniciar a partida.
     *  OBS: caso o jogador solicite a despreparação e este já está despreparado, nada deve acontecer (este evento não deve ser acionado).
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public playerUnreadyError(handlerFunction: (type: "in-game"|"not-in-lobby"|"leader") => void): void {
        this.socket.on('player-unready-error', handlerFunction)
    }

    /**
     *  Evento indicando que ocorreu um erro ao iniciar a partida.
     *  Esse erro pode ocorrer caso o solicitante não esteja em um sala, ou que está já está em jogo.
     *  Outro possível erro pode ocorrer caso ele não seja o líder ou se nem todos jogadores estão prontos para começar.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public startGameError(handlerFunction: (type: "not-leader"|"not-all-ready"|"not-in-lobby"|"already-in-game") => void): void {
        this.socket.on('start-game-error', handlerFunction)
    }

    /**
     *  Evento enviado para um usuário que acabou de reconectar.
     *  Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public reconnect(handlerFunction: (lobby: Lobby) => void): void {
        this.socket.on('reconnect', handlerFunction)
    }
}


export default function addDefaultLobbyHandlers (socket: Socket) {
    const lobbyEventsHandlersAdder = new LobbyEventsHandlersAdder(socket)

    lobbyEventsHandlersAdder.joinLobbySuccess(handleJoinLobbySuccess)
    lobbyEventsHandlersAdder.joinLobbyError(handleJoinLobbyError)
    lobbyEventsHandlersAdder.playerJoin(handlePlayerJoin)
    lobbyEventsHandlersAdder.playerLogout(handlePlayerLogout)
    lobbyEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError)
    lobbyEventsHandlersAdder.playerReady(handlePlayerReady)
    lobbyEventsHandlersAdder.playerReadyError(handlePlayerReadyError)
    lobbyEventsHandlersAdder.playerUnready(handlePlayerUnready)
    lobbyEventsHandlersAdder.playerUnreadyError(handlePlayerUnreadyError)
    lobbyEventsHandlersAdder.reconnect(handleReconnect)
    lobbyEventsHandlersAdder.startGameError(handleStartGameError)
}