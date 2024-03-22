import Lobby from "../../interfaces/Lobby";
import EmitterBase from "../EmitterBase"


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
}