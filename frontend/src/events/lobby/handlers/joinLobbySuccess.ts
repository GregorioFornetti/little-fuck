
import type Lobby from "@/interfaces/Lobby";
import type Player from "@/interfaces/Player";


/**
 *  Indica ao usuário que ele conseguiu entrar na sala.
 *  Este receberá uma lista de todos os outros jogadores da sala e suas informações.
 *  Logo após isso, será enviado para todos os outros jogadores o evento `player-join`,
 *  para que todos adicionem este jogador ao lobby também (incluindo ele mesmo).
 * 
 *  @param player informações do jogador atual
 *  @param lobby informações da sala que o jogador entrou
 */
export function handleJoinLobbySuccess(player: Player, lobby: Lobby) {

}