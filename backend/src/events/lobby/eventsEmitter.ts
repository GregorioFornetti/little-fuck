import Lobby from "../../interfaces/Lobby";
import EmitterBase from "../EmitterBase"


/**
 *  Uma sala consiste em um conjunto de jogadores que desejam jogar juntos o jogo "Little fuck".
 *  Os eventos desta categoria estão ligados à criação de salas, entrar em salas, sistema de preparação, etc.
 */
export default class LobbyEventsEmitter extends EmitterBase {

    
    /**
     *  Indica ao usuário que ele conseguiu entrar na sala. 
     *  Este receberá uma lista de todos os outros jogadores da sala e suas informações.
     *  Logo após isso, será enviado para todos os outros jogadores o evento player-join, para que todos adicionem este jogador ao lobby 
     *  também (incluindo ele mesmo).
     * 
     *  @param lobby informações da sala que o jogador entrou
     */
    public emitJoinLobbySuccess(lobby: Lobby) {
        this.emitToUser("join-lobby-success", lobby)
    }

    /**
     *  Indica ao usuário que ocorreu algum erro ao entrar na sala (ou criá-la). 
     *  Isso pode ocorrer devido à um nome inválido (nenhum caractere ou nome repetido), um lobby inexistente ou em partida, 
     *  ou o jogador já estar em um outro lobby.
     *  
     *  @param type tipo de erro que ocorreu ao tentar entrar na sala
     */
    public emitJoinLobbyError(type: "lobby-in-game"|"inexistent-lobby"|"no-name"|"repeated-name"|"player-already-in-lobby") {
        this.emitToUser("join-lobby-error", type)
    }

    /**
     *  Evento enviado para todos os jogadores do lobby indicando que um novo jogador entrou na sala.
     * 
     *  @param id identificador único do jogador que acaba de entrar na sala
     *  @param name nome do jogador que acaba de entrar na sala
     */
    public emitPlayerJoin(id: string, name: string) {
        this.emitToLobby("player-join", {id, name})
    }

    /**
     *  Evento indicando que um jogador acaba de sair da sala.
     *  
     *  @param id identificador único do jogador que acaba de sair da partida
     */
    public emitPlayerLogout(id: string) {
        this.emitToLobby("player-logout", id)
    }

    /**
     *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
     * 
     *  @param type tipo de erro que ocorreu ao tentar sair da sala
     */
    public emitLogoutError(type: "player-not-in-lobby") {
        this.emitToUser("logout-error", type)
    }

    /**
     *  Indica que um jogador acaba de ficar preparado para um jogo.
     *  Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.
     * 
     *  @param id identificador único do jogador que acaba de se preparar para a partida
     */
    public emitPlayerReady(id: string) {
        this.emitToLobby("player-ready", id)
    }

    /**
     *  Evento enviado ao cliente que tentou se preparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento.
     *  Outro motivo pode ser que o líder tente se preparar, mas este não precisa fazer isso, ele só precisa iniciar a partida.
     *  OBS: caso o jogador solicite a preparação e este já está preparado, nada deve acontecer (este evento não deve ser acionado).
     *  
     *  @param type tipo de erro que ocorreu ao tentar se preparar para a partida
     */
    public emitPlayerReadyError(type: "in-game"|"not-in-lobby"|"leader") {
        this.emitToUser("ready-error", type)
    }

    /**
     *  Indica que um jogador acaba de ficar despreparado para um jogo.
     *  Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.
     * 
     *  @param id identificador único do jogador que acaba de se despreparar para a partida
     */
    public emitPlayerUnready(id: string) {
        this.emitToLobby("player-unready", id)
    }

    /**
     *  Evento enviado ao cliente que tentou se despreparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento.
     *  Outro motivo pode ser que o líder tente se despreparar, mas este não precisa fazer isso, ele só precisa iniciar a partida.
     *  OBS: caso o jogador solicite a despreparação e este já está despreparado, nada deve acontecer (este evento não deve ser acionado).
     *  
     *  @param type tipo de erro que ocorreu ao tentar se despreparar para a partida
     */
    public emitPlayerUnreadyError(type: "in-game"|"not-in-lobby"|"leader") {
        this.emitToUser("unready-error", type)
    }

    /**
     *  Evento indicando que ocorreu um erro ao iniciar a partida.
     *  Esse erro pode ocorrer caso o solicitante não esteja em um sala, ou que está já está em jogo.
     *  Outro possível erro pode ocorrer caso ele não seja o líder ou se nem todos jogadores estão prontos para começar.
     *  
     *  @param type tipo de erro que ocorreu ao tentar iniciar a partida
     */
    public emitStartGameError(type: "not-leader"|"not-all-ready"|"not-in-lobby"|"already-in-game") {
        this.emitToUser("start-game-error", type)
    }

    /**
     *  Evento enviado para um usuário que acabou de reconectar.
     *  Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.
     *  
     *  @param lobby informações da sala que o jogador está conectado, para que ele possa se recuperar
     */
    public emitReconnect(lobby: Lobby) {
        this.emitToUser("reconnect", lobby)
    }
}